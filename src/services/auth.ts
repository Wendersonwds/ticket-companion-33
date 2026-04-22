import { supabase } from '@/lib/supabase';

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) { console.log('Erro no cadastro:', error.message); throw error; }

  const userId = data.user?.id;
  if (!userId) throw new Error('User ID não encontrado');

  const { error: userErr } = await supabase.from('users').insert({ id: userId, name, role: 'client' });
  if (userErr) console.log('Erro ao criar user:', userErr.message);

  const { error: clientErr } = await supabase.from('clients').insert({ user_id: userId });
  if (clientErr) console.log('Erro ao criar client:', clientErr.message);

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) { console.log('Erro no login:', error.message); throw error; }
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.log('Erro no logout:', error.message);
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
