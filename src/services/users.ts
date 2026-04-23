import { supabase } from '@/lib/supabase';

export async function getClientId(userId: string): Promise<string | null> {
  const { data, error } = await supabase.from('clients').select('id').eq('user_id', userId).maybeSingle();
  if (error) { console.log('Erro ao buscar client:', error.message); }

  if (data?.id) return data.id;

  // Auto-create client if not found
  const { data: newClient, error: createErr } = await supabase
    .from('clients')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (createErr) { console.log('Erro ao criar client:', createErr.message); return null; }
  return newClient?.id ?? null;
}
