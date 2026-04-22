import { supabase } from '@/lib/supabase';

export async function uploadFile(ticketId: string, file: File) {
  const path = `${ticketId}/${Date.now()}_${file.name}`;
  const { error: uploadErr } = await supabase.storage.from('attachments').upload(path, file);
  if (uploadErr) { console.log('Erro upload:', uploadErr.message); throw uploadErr; }

  const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(path);
  const url = urlData.publicUrl;

  const { error: insertErr } = await supabase.from('attachments').insert({ ticket_id: ticketId, file_url: url, file_name: file.name });
  if (insertErr) { console.log('Erro ao salvar attachment:', insertErr.message); throw insertErr; }
  return url;
}

export async function getAttachments(ticketId: string) {
  const { data, error } = await supabase.from('attachments').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: false });
  if (error) { console.log('Erro attachments:', error.message); return []; }
  return data ?? [];
}
