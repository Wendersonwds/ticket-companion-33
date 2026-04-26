import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// Security: enforce server-side-friendly limits on the client too.
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set<string>([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const SAFE_NAME = /[^a-zA-Z0-9._-]/g;

function validateFile(file: File) {
  if (!file) throw new Error('Arquivo inválido.');
  if (file.size <= 0) throw new Error('Arquivo vazio.');
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / (1024 * 1024)} MB.`);
  }
  if (file.type && !ALLOWED_MIME.has(file.type)) {
    throw new Error('Tipo de arquivo não permitido.');
  }
}

function sanitizeName(name: string) {
  return name.replace(SAFE_NAME, '_').slice(0, 120);
}

export async function uploadFile(ticketId: string, file: File) {
  validateFile(file);

  const safeName = sanitizeName(file.name);
  const path = `${ticketId}/${Date.now()}_${safeName}`;

  const { error: uploadErr } = await supabase.storage
    .from('attachments')
    .upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });
  if (uploadErr) {
    logger.error('Falha ao enviar arquivo.', uploadErr.message);
    throw new Error('Não foi possível enviar o arquivo.');
  }

  // Store the storage path (not a public URL). We'll create signed URLs on read.
  const { error: insertErr } = await supabase
    .from('attachments')
    .insert({ ticket_id: ticketId, file_url: path, file_name: safeName });
  if (insertErr) {
    logger.error('Falha ao registrar anexo.', insertErr.message);
    throw new Error('Não foi possível salvar o anexo.');
  }
  return path;
}

// Returns attachments with short-lived signed URLs (private bucket).
export async function getAttachments(ticketId: string) {
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false });
  if (error) {
    logger.error('Falha ao listar anexos.', error.message);
    return [];
  }

  const items = data ?? [];
  const withUrls = await Promise.all(
    items.map(async (att: any) => {
      // file_url may contain either a storage path (new) or a legacy public URL.
      const path: string =
        typeof att.file_url === 'string' && att.file_url.includes('/storage/v1/object/public/attachments/')
          ? att.file_url.split('/storage/v1/object/public/attachments/')[1]
          : att.file_url;

      const { data: signed } = await supabase.storage
        .from('attachments')
        .createSignedUrl(path, 60 * 10); // 10 min

      return { ...att, signed_url: signed?.signedUrl ?? null };
    }),
  );

  return withUrls;
}
