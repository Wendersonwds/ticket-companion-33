import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface ProfileData {
  name: string;
  email: string;
  company: string;
  avatar_url: string;
}

const localKey = (userId: string) => `profile-extra:${userId}`;

interface LocalExtras { company?: string; avatar_url?: string }

function readLocal(userId: string): LocalExtras {
  try { return JSON.parse(localStorage.getItem(localKey(userId)) ?? '{}'); }
  catch { return {}; }
}

function writeLocal(userId: string, extras: LocalExtras) {
  localStorage.setItem(localKey(userId), JSON.stringify(extras));
}

export async function getProfile(userId: string, email: string | undefined): Promise<ProfileData> {
  const { data, error } = await supabase.from('users').select('name').eq('id', userId).maybeSingle();
  if (error) logger.debug('Erro ao buscar perfil:', error.message);

  // Try to fetch optional fields from clients (graceful if cols missing)
  let company = '';
  let avatar_url = '';
  const { data: client, error: cErr } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (cErr) logger.debug('Erro ao buscar client:', cErr.message);
  if (client) {
    company = (client as any).company ?? '';
    avatar_url = (client as any).avatar_url ?? '';
  }

  // Local fallback (used if db cols not available)
  const local = readLocal(userId);
  if (!company && local.company) company = local.company;
  if (!avatar_url && local.avatar_url) avatar_url = local.avatar_url;

  return {
    name: data?.name ?? '',
    email: email ?? '',
    company,
    avatar_url,
  };
}

export async function updateProfile(userId: string, profile: { name: string; company: string; avatar_url: string }) {
  // 1. Update name in public.users
  const { error: uErr } = await supabase.from('users').update({ name: profile.name }).eq('id', userId);
  if (uErr) {
    logger.debug('Erro ao atualizar nome:', uErr.message);
    throw new Error(uErr.message);
  }

  // 2. Try to update company / avatar_url in clients (best-effort).
  //    If the columns don't exist, fall back to localStorage so the data is preserved.
  const { error: cErr } = await supabase
    .from('clients')
    .update({ company: profile.company, avatar_url: profile.avatar_url } as any)
    .eq('user_id', userId);

  if (cErr) {
    logger.debug('Coluna ausente em clients, salvando localmente:', cErr.message);
    writeLocal(userId, { company: profile.company, avatar_url: profile.avatar_url });
  } else {
    // Clean local cache once persisted in DB
    writeLocal(userId, {});
  }
}
