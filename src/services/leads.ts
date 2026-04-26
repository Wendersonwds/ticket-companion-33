import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function createLead(data: {
  name: string; email: string; phone: string;
  service_type: string; description: string; budget: string;
}) {
  const { error } = await supabase.from('leads').insert(data);
  if (error) { logger.debug('Erro ao criar lead:', error.message); throw error; }
}
