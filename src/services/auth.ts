import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { ensureUserAndClientExist } from '@/services/ensureProfile';

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) { logger.debug('Erro no cadastro:', error.message); throw error; }

  const userId = data.user?.id;
  if (!userId) throw new Error('User ID não encontrado');

  // Ensure profile records exist immediately after signup
  await ensureUserAndClientExist(userId, email);

  // Update name if provided
  if (name) {
    await supabase.from('users').update({ name }).eq('id', userId);
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) { logger.debug('Erro no login:', error.message); throw error; }

  // Ensure profile records exist on login
  await ensureUserAndClientExist(data.user.id, data.user.email);

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) logger.debug('Erro no logout:', error.message);
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
