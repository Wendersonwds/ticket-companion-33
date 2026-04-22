import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getTicketById } from '@/services/tickets';
import { getMessages, sendMessage, subscribeToMessages } from '@/services/messages';
import { uploadFile, getAttachments } from '@/services/upload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (!user || !id) return;

    getTicketById(id).then(setTicket);
    getMessages(id).then(setMessages);
    getAttachments(id).then(setAttachments);

    const channel = subscribeToMessages(id, (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => { channel.unsubscribe(); };
  }, [id, user, loading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !user || !id) return;
    setSending(true);
    try {
      await sendMessage(id, user.id, newMsg.trim());
      setNewMsg('');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally { setSending(false); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    try {
      await uploadFile(id, file);
      const updated = await getAttachments(id);
      setAttachments(updated);
      toast({ title: 'Arquivo enviado!' });
    } catch (err: any) {
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
    }
  };

  if (!ticket) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => navigate('/tickets')}>← Voltar</Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{ticket.title}</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">{ticket.status}</Badge>
                <Badge variant="secondary">{ticket.priority}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{ticket.description}</p>
            <p className="text-xs text-muted-foreground mt-2">Tipo: {ticket.type} · Criado em: {new Date(ticket.created_at).toLocaleDateString('pt-BR')}</p>
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Anexos</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {attachments.map(a => (
              <a key={a.id} href={a.file_url} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary underline">
                {a.file_name}
              </a>
            ))}
            <Input type="file" onChange={handleUpload} />
          </CardContent>
        </Card>

        {/* Chat */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Mensagens</CardTitle></CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto space-y-3 mb-4 p-2">
              {messages.length === 0 && <p className="text-sm text-muted-foreground text-center">Nenhuma mensagem ainda.</p>}
              {messages.map((m, i) => (
                <div key={m.id ?? i} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${m.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    {m.message}
                    <p className="text-[10px] opacity-60 mt-1">{new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
              <Input placeholder="Digite uma mensagem..." value={newMsg} onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()} />
              <Button onClick={handleSend} disabled={sending}>Enviar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketDetail;
