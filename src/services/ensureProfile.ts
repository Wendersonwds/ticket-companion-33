import { supabase } from '@/lib/supabase';

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
      console.log('Erro ao buscar user:', selectUserErr.message);
    }

    if (!existingUser) {
      console.log('Usuário não encontrado em public.users, criando...');
      const { error: insertUserErr } = await supabase
        .from('users')
        .insert({ id: userId, name: email ?? 'Usuário', role: 'client' });

      if (insertUserErr) {
        console.log('Erro ao criar user:', insertUserErr.message);
      } else {
        console.log('Usuário criado em public.users');
      }
    }

    // 2. Ensure public.clients record
    const { data: existingClient, error: selectClientErr } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (selectClientErr) {
      console.log('Erro ao buscar client:', selectClientErr.message);
    }

    if (!existingClient) {
      console.log('Client não encontrado em public.clients, criando...');
      const { error: insertClientErr } = await supabase
        .from('clients')
        .insert({ user_id: userId });

      if (insertClientErr) {
        console.log('Erro ao criar client:', insertClientErr.message);
      } else {
        console.log('Client criado em public.clients');
      }
    }
  } catch (err) {
    console.log('Erro em ensureUserAndClientExist:', err);
  }
}
