import { supabase } from '@/lib/supabase';

export async function getClientId(userId: string) {
  const { data, error } = await supabase.from('clients').select('id').eq('user_id', userId).maybeSingle();
  if (error) { console.log('Erro ao buscar client:', error.message); return null; }
  return data?.id ?? null;
}
