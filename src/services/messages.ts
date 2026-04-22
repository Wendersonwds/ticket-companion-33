import { supabase } from '@/lib/supabase';

export async function getMessages(ticketId: string) {
  const { data, error } = await supabase.from('ticket_messages').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true });
  if (error) { console.log('Erro ao buscar mensagens:', error.message); return []; }
  return data ?? [];
}

export async function sendMessage(ticketId: string, senderId: string, message: string) {
  const { error } = await supabase.from('ticket_messages').insert({ ticket_id: ticketId, sender_id: senderId, message });
  if (error) { console.log('Erro ao enviar mensagem:', error.message); throw error; }
}

export function subscribeToMessages(ticketId: string, callback: (msg: any) => void) {
  return supabase
    .channel(`messages-${ticketId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'ticket_messages',
      filter: `ticket_id=eq.${ticketId}`,
    }, (payload) => callback(payload.new))
    .subscribe();
}
