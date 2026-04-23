import { supabase } from '@/lib/supabase';

export async function createTicket(data: {
  title: string; description: string; type: string; priority: string; client_id: string;
}) {
  const { error, data: ticket } = await supabase.from('tickets').insert({ ...data, status: 'aberto' }).select().single();
  if (error) { console.log('Erro ao criar chamado:', error.message); throw error; }
  return ticket;
}

export async function getTickets(clientId: string) {
  const { data, error } = await supabase.from('tickets').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
  if (error) { console.log('Erro ao buscar chamados:', error.message); return []; }
  return data ?? [];
}

export async function getAllTickets() {
  const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
  if (error) { console.log('Erro ao buscar todos chamados:', error.message); return []; }
  return data ?? [];
}

export async function getTicketById(id: string) {
  const { data, error } = await supabase.from('tickets').select('*').eq('id', id).maybeSingle();
  if (error) { console.log('Erro ao buscar chamado:', error.message); return null; }
  return data;
}

export async function updateTicketStatus(id: string, status: string) {
  const { error } = await supabase.from('tickets').update({ status }).eq('id', id);
  if (error) { console.log('Erro ao atualizar status:', error.message); throw error; }
}

export async function getTicketStats(clientId: string) {
  const { data, error } = await supabase.from('tickets').select('status').eq('client_id', clientId);
  if (error) { console.log('Erro stats:', error.message); return { total: 0, open: 0, done: 0 }; }
  const total = data?.length ?? 0;
  const open = data?.filter(t => t.status === 'aberto').length ?? 0;
  const done = data?.filter(t => t.status === 'concluido').length ?? 0;
  return { total, open, done };
}
