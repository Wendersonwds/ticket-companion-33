import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

/**
 * Ensures the authenticated user has records in public.users and public.clients.
 * Called on every auth state change (login, signup, reload).
 */
export async function ensureUserAndClientExist(userId: string, email?: string): Promise<void> {
  try {
    // 1. Ensure public.users record
    const { data: existingUser, error: selectUserErr } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (selectUserErr) {
      logger.debug('Erro ao buscar user:', selectUserErr.message);
    }

    if (!existingUser) {
      logger.debug('Usuário não encontrado em public.users, criando...');
      const { error: insertUserErr } = await supabase
        .from('users')
        .insert({ id: userId, name: email ?? 'Usuário', role: 'client' });

      if (insertUserErr) {
        logger.debug('Erro ao criar user:', insertUserErr.message);
      } else {
        logger.debug('Usuário criado em public.users');
      }
    }

    // 2. Ensure public.clients record
    const { data: existingClient, error: selectClientErr } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (selectClientErr) {
      logger.debug('Erro ao buscar client:', selectClientErr.message);
    }

    if (!existingClient) {
      logger.debug('Client não encontrado em public.clients, criando...');
      const { error: insertClientErr } = await supabase
        .from('clients')
        .insert({ user_id: userId });

      if (insertClientErr) {
        logger.debug('Erro ao criar client:', insertClientErr.message);
      } else {
        logger.debug('Client criado em public.clients');
      }
    }
  } catch (err) {
    logger.debug('Erro em ensureUserAndClientExist:', err);
  }
}
