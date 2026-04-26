import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export type TicketStatus = 'aberto' | 'em_atendimento' | 'fechado';

const normalizeStatus = (status: string): TicketStatus => {
  if (status === 'andamento') return 'em_atendimento';
  if (status === 'concluido') return 'fechado';
  return status as TicketStatus;
};

async function insertTicketLog(ticketId: string, userId: string, action: 'atendido' | 'fechado') {
  const { error } = await supabase.from('ticket_logs').insert({ ticket_id: ticketId, user_id: userId, action });
  if (error) logger.debug('Erro ao registrar histórico do chamado:', error.message);
}

export async function createTicket(data: {
  title: string; description: string; type: string; priority: string; client_id: string;
}) {
  const { error, data: ticket } = await supabase.from('tickets').insert({ ...data, status: 'aberto' }).select().single();
  if (error) { logger.debug('Erro ao criar chamado:', error.message); throw error; }
  return ticket;
}

export async function getTickets(clientId: string) {
  const { data, error } = await supabase.from('tickets').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
  if (error) { logger.debug('Erro ao buscar chamados:', error.message); return []; }
  return data ?? [];
}

export async function getAllTickets() {
  const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
  if (error) { logger.debug('Erro ao buscar todos chamados:', error.message); return []; }
  return data ?? [];
}

export async function getTicketById(id: string) {
  const { data, error } = await supabase.from('tickets').select('*, clients(user_id)').eq('id', id).maybeSingle();
  if (error) { logger.debug('Erro ao buscar chamado:', error.message); return null; }
  return data;
}

export async function updateTicketStatus(id: string, status: string) {
  const normalizedStatus = normalizeStatus(status);
  const { error, data } = await supabase
    .from('tickets')
    .update({ status: normalizedStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) { logger.debug('Erro ao atualizar status:', error.message); throw error; }
  if (!data || data.length === 0) {
    logger.debug('Nenhuma linha atualizada — verifique as RLS policies da tabela tickets (UPDATE)');
    throw new Error('Não foi possível atualizar o status. Verifique as permissões no banco de dados.');
  }
  return data[0];
}

export async function startTicketAttendance(id: string) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw authError ?? new Error('Usuário não autenticado.');

  const userId = authData.user.id;
  const { error, data } = await supabase
    .from('tickets')
    .update({ status: 'em_atendimento', atendente_id: userId, updated_at: new Date().toISOString() })
    .eq('id', id)
    .neq('status', 'fechado')
    .select()
    .single();

  if (error) { logger.debug('Erro ao iniciar atendimento:', error.message); throw error; }
  await insertTicketLog(id, userId, 'atendido');
  return data;
}

export async function closeTicket(id: string) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw authError ?? new Error('Usuário não autenticado.');

  const userId = authData.user.id;
  const now = new Date().toISOString();
  const { error, data } = await supabase
    .from('tickets')
    .update({ status: 'fechado', closed_at: now, updated_at: now })
    .eq('id', id)
    .select()
    .single();

  if (error) { logger.debug('Erro ao fechar chamado:', error.message); throw error; }
  await insertTicketLog(id, userId, 'fechado');
  return data;
}

export async function getTicketLogs(ticketId: string) {
  const { data, error } = await supabase
    .from('ticket_logs')
    .select('*, users:user_id(name, role)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });
  if (error) { logger.debug('Erro ao buscar histórico:', error.message); return []; }
  return data ?? [];
}

export async function getTicketStats(clientId: string) {
  const { data, error } = await supabase.from('tickets').select('status').eq('client_id', clientId);
  if (error) { logger.debug('Erro stats:', error.message); return { total: 0, open: 0, done: 0 }; }
  const total = data?.length ?? 0;
  const open = data?.filter(t => t.status === 'aberto').length ?? 0;
  const done = data?.filter(t => t.status === 'fechado' || t.status === 'concluido').length ?? 0;
  return { total, open, done };
}
