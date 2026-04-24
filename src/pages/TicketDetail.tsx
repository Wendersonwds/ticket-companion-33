import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { closeTicket, getTicketById, getTicketLogs, startTicketAttendance, updateTicketStatus } from '@/services/tickets';
import { getMessages, sendMessage, subscribeToMessages } from '@/services/messages';
import { uploadFile, getAttachments } from '@/services/upload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, Clock, TrendingUp, CheckCircle2, AlertTriangle,
  Paperclip, Send, Shield, User, Headphones, Lock, History,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  aberto: { label: 'Aberto', color: 'bg-warning/10 text-warning', icon: Clock },
  andamento: { label: 'Em Atendimento', color: 'bg-primary/10 text-primary', icon: TrendingUp },
  em_atendimento: { label: 'Em Atendimento', color: 'bg-primary/10 text-primary', icon: TrendingUp },
  concluido: { label: 'Fechado', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  fechado: { label: 'Fechado', color: 'bg-success/10 text-success', icon: CheckCircle2 },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  baixa: { label: 'Baixa', color: 'bg-muted text-muted-foreground' },
  media: { label: 'Média', color: 'bg-warning/10 text-warning' },
  alta: { label: 'Alta', color: 'bg-destructive/10 text-destructive' },
};

const typeLabels: Record<string, string> = {
  bug: 'Bug', melhoria: 'Melhoria', novo_projeto: 'Novo Projeto', duvida: 'Dúvida',
};

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = role === 'admin' || role === 'support';

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (!user || !id) return;

    getTicketById(id).then(setTicket);
    getMessages(id).then(setMessages);
    getAttachments(id).then(setAttachments);
    getTicketLogs(id).then(setLogs);

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

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    try {
      await updateTicketStatus(id, newStatus);
      setTicket((prev: any) => ({ ...prev, status: newStatus }));
      toast({ title: 'Status atualizado!' });
    } catch {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    }
  };

  const handleAttend = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const updated = await startTicketAttendance(id);
      setTicket((prev: any) => ({ ...prev, ...updated }));
      setLogs(await getTicketLogs(id));
      toast({ title: 'Atendimento iniciado!' });
    } catch {
      toast({ title: 'Erro ao atender chamado', variant: 'destructive' });
    } finally { setActionLoading(false); }
  };

  const handleClose = async () => {
    if (!id || !window.confirm('Tem certeza que deseja fechar este chamado?')) return;
    setActionLoading(true);
    try {
      const updated = await closeTicket(id);
      setTicket((prev: any) => ({ ...prev, ...updated }));
      setLogs(await getTicketLogs(id));
      toast({ title: 'Chamado fechado!' });
    } catch {
      toast({ title: 'Erro ao fechar chamado', variant: 'destructive' });
    } finally { setActionLoading(false); }
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

  const sc = statusConfig[ticket.status] ?? statusConfig.aberto;
  const pc = priorityConfig[ticket.priority];
  const StatusIcon = sc.icon;
  const isOwner = ticket.clients?.user_id === user?.id;
  const canClose = ticket.status !== 'fechado' && (isAdmin || isOwner);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(isAdmin ? '/admin/tickets' : '/tickets')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{ticket.title}</h1>
            <p className="text-xs text-muted-foreground">
              #{ticket.id?.slice(0, 8)} · {typeLabels[ticket.type] ?? ticket.type} · {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Status + Priority + Admin Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Current status display */}
              <div className="flex items-center gap-3 flex-1">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${sc.color}`}>
                  <StatusIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status atual</p>
                  <Badge className={`${sc.color} text-sm`}>{sc.label}</Badge>
                </div>
                <Separator orientation="vertical" className="h-10 mx-2 hidden sm:block" />
                <div>
                  <p className="text-xs text-muted-foreground">Prioridade</p>
                  <Badge className={pc?.color ?? ''}>{pc?.label ?? ticket.priority}</Badge>
                </div>
                <Separator orientation="vertical" className="h-10 mx-2 hidden sm:block" />
                <div>
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <p className="text-sm font-medium text-foreground">{typeLabels[ticket.type] ?? ticket.type}</p>
                </div>
              </div>

              {/* Admin/support: change status */}
              {isAdmin && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-md">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">{role === 'support' ? 'Suporte' : 'Admin'}</span>
                  </div>
                  <Button className="gap-2" disabled={actionLoading || ticket.status === 'fechado' || (ticket.atendente_id && ticket.atendente_id !== user?.id)} onClick={handleAttend}>
                    <Headphones className="h-4 w-4" />
                    {ticket.atendente_id === user?.id ? 'Em atendimento por você' : 'Atender chamado'}
                  </Button>
                  <Select value={ticket.status === 'andamento' ? 'em_atendimento' : ticket.status === 'concluido' ? 'fechado' : ticket.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-40 h-9">
                      <SelectValue placeholder="Alterar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aberto">Aberto</SelectItem>
                      <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                      <SelectItem value="fechado">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {canClose && (
              <div className="mt-4 flex justify-end">
                <Button variant="outline" className="gap-2" disabled={actionLoading} onClick={handleClose}>
                  <Lock className="h-4 w-4" /> {isAdmin ? 'Fechar chamado' : 'Encerrar chamado'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chat - takes 2/3 */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                Mensagens
                <Badge variant="secondary" className="text-xs">{messages.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-3 mb-4 p-2 bg-muted/30 rounded-lg">
                {messages.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhuma mensagem ainda.</p>}
                {messages.map((m, i) => {
                  const isMe = m.sender_id === user?.id;
                  return (
                    <div key={m.id ?? i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex items-end gap-2 max-w-[80%]">
                        {!isMe && (
                          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                        <div className={`rounded-2xl px-3 py-2 text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card text-foreground border rounded-bl-md'}`}>
                          {m.message}
                          <p className="text-[10px] opacity-60 mt-1">
                            {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {isMe && (
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${isAdmin ? 'bg-primary/10' : 'bg-accent'}`}>
                            {isAdmin
                              ? <Shield className="h-3.5 w-3.5 text-primary" />
                              : <User className="h-3.5 w-3.5 text-accent-foreground" />
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder={isAdmin ? "Responder como Admin..." : "Digite uma mensagem..."}
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                />
                <Button onClick={handleSend} disabled={sending} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar info */}
          <div className="space-y-4">
            {/* Attachments */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Paperclip className="h-4 w-4" /> Anexos
                  <Badge variant="secondary" className="text-xs">{attachments.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {attachments.length === 0 && <p className="text-xs text-muted-foreground">Nenhum anexo.</p>}
                {attachments.map(a => (
                  <a key={a.id} href={a.file_url} target="_blank" rel="noopener noreferrer"
                    className="block text-sm text-primary underline truncate hover:opacity-80">
                    {a.file_name}
                  </a>
                ))}
                <Separator className="my-2" />
                <Input type="file" onChange={handleUpload} className="text-xs" />
              </CardContent>
            </Card>

            {/* Ticket Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado em</span>
                  <span className="font-medium text-foreground">{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                {ticket.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Atualizado</span>
                    <span className="font-medium text-foreground">{new Date(ticket.updated_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                {ticket.closed_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fechado</span>
                    <span className="font-medium text-foreground">{new Date(ticket.closed_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono text-xs text-foreground">{ticket.id?.slice(0, 8)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><History className="h-4 w-4" /> Histórico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="relative pl-5 before:absolute before:left-1.5 before:top-2 before:bottom-0 before:w-px before:bg-border">
                  <div className="relative mb-4">
                    <span className="absolute -left-5 top-1 h-3 w-3 rounded-full bg-warning" />
                    <p className="font-medium text-foreground">Chamado criado</p>
                    <p className="text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                  {logs.map(log => (
                    <div key={log.id} className="relative mb-4">
                      <span className={`absolute -left-5 top-1 h-3 w-3 rounded-full ${log.action === 'fechado' ? 'bg-success' : 'bg-primary'}`} />
                      <p className="font-medium text-foreground">{log.action === 'fechado' ? 'Fechado' : 'Atendido'} por {log.users?.name ?? 'usuário'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
