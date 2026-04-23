import { supabase } from '@/lib/supabase';
import { ensureUserAndClientExist } from '@/services/ensureProfile';

export async function getClientId(userId: string): Promise<string | null> {
  const { data, error } = await supabase.from('clients').select('id').eq('user_id', userId).maybeSingle();
  if (error) { console.log('Erro ao buscar client:', error.message); }

  if (data?.id) return data.id;

  // Auto-create user + client if not found
  console.log('Client não encontrado, tentando criar automaticamente...');
  await ensureUserAndClientExist(userId);

  // Retry fetch
  const { data: retryData, error: retryErr } = await supabase.from('clients').select('id').eq('user_id', userId).maybeSingle();
  if (retryErr) { console.log('Erro ao buscar client (retry):', retryErr.message); return null; }
  return retryData?.id ?? null;
}
