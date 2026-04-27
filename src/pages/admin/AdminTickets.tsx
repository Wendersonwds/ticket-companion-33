import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminTickets } from '@/services/admin';
import { closeTicket, startTicketAttendance, updateTicketStatus } from '@/services/tickets';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ArrowUpDown, Headphones, Lock, UserCheck, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const statusConfig: Record<string, { label: string; color: string }> = {
  aberto: { label: 'Aberto', color: 'bg-warning/10 text-warning' },
  andamento: { label: 'Em Atendimento', color: 'bg-primary/10 text-primary' },
  em_atendimento: { label: 'Em Atendimento', color: 'bg-primary/10 text-primary' },
  concluido: { label: 'Fechado', color: 'bg-success/10 text-success' },
  fechado: { label: 'Fechado', color: 'bg-success/10 text-success' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  baixa: { label: 'Baixa', color: 'bg-muted text-muted-foreground' },
  media: { label: 'Média', color: 'bg-warning/10 text-warning' },
  alta: { label: 'Alta', color: 'bg-destructive/10 text-destructive' },
};

const AdminTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterType, setFilterType] = useState('todos');
  const [filterPriority, setFilterPriority] = useState('todos');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    getAdminTickets().then(t => { setTickets(t); setLoading(false); });
  }, []);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    if (newStatus === 'em_atendimento') { await handleAttend(ticketId); return; }
    if (newStatus === 'fechado') { await handleClose(ticketId); return; }
    try {
      await updateTicketStatus(ticketId, newStatus);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      toast({ title: 'Status atualizado!' });
    } catch {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const handleAttend = async (ticketId: string) => {
    setActionLoading(ticketId);
    try {
      const updated = await startTicketAttendance(ticketId);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...updated } : t));
      toast({ title: 'Atendimento iniciado!' });
    } catch {
      toast({ title: 'Erro ao atender chamado', variant: 'destructive' });
    } finally { setActionLoading(null); }
  };

  const handleClose = async (ticketId: string) => {
    if (!window.confirm('Tem certeza que deseja fechar este chamado?')) return;
    setActionLoading(ticketId);
    try {
      const updated = await closeTicket(ticketId);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...updated } : t));
      toast({ title: 'Chamado fechado!' });
    } catch {
      toast({ title: 'Erro ao fechar chamado', variant: 'destructive' });
    } finally { setActionLoading(null); }
  };

  const getClientName = (t: any) => t.clients?.users?.name ?? 'Desconhecido';
  const getAttendantName = (t: any) => t.atendente?.name ?? (t.atendente_id ? 'Atendente definido' : 'Sem atendente');

  let filtered = tickets
    .filter(t => filterStatus === 'todos' || t.status === filterStatus || (filterStatus === 'em_atendimento' && t.status === 'andamento') || (filterStatus === 'fechado' && t.status === 'concluido'))
    .filter(t => filterType === 'todos' || t.type === filterType)
    .filter(t => filterPriority === 'todos' || t.priority === filterPriority)
    .filter(t => {
      if (!search) return true;
      const s = search.toLowerCase();
      return t.title?.toLowerCase().includes(s) || getClientName(t).toLowerCase().includes(s);
    })
    .sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? db - da : da - db;
    });

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>;

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-3 sm:space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Chamados</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">{filtered.length} resultado(s)</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
            <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="grid grid-cols-3 sm:flex gap-2 sm:gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Tipos</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="melhoria">Melhoria</SelectItem>
                  <SelectItem value="novo_projeto">Novo Projeto</SelectItem>
                  <SelectItem value="duvida">Dúvida</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Prioridade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={() => setSortOrder(s => s === 'desc' ? 'asc' : 'desc')} title="Ordenar" className="self-end sm:self-auto">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ticket list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Filter className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Nenhum chamado encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => {
            const sc = statusConfig[t.status] ?? statusConfig.aberto;
            const pc = priorityConfig[t.priority];
            const isMine = t.atendente_id === user?.id;
            const isClosed = t.status === 'fechado' || t.status === 'concluido';
            return (
              <Card key={t.id} className="hover:shadow-md transition-all hover:border-primary/20">
                <CardContent className="p-3 sm:p-4 space-y-3">
                  {/* Header info */}
                  <Link to={`/tickets/${t.id}`} className="block min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="font-semibold text-foreground text-sm sm:text-base leading-snug line-clamp-2 flex-1">{t.title}</p>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <Badge className={`${sc.color} text-[10px] sm:text-xs`}>{sc.label}</Badge>
                        {pc && <Badge className={`${pc.color} text-[10px] sm:text-xs`}>{pc.label}</Badge>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] sm:text-xs text-muted-foreground">
                      <span className="font-medium truncate max-w-[160px]">{getClientName(t)}</span>
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {new Date(t.created_at).toLocaleDateString('pt-BR')}</span>
                      <span className="inline-flex items-center gap-1 truncate max-w-[160px]"><UserCheck className="h-3 w-3" /> {getAttendantName(t)}</span>
                    </div>
                    {isMine && <p className="text-[11px] sm:text-xs font-medium text-primary mt-1.5">✓ Em atendimento por você</p>}
                  </Link>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-border/50">
                    <Button
                      size="sm"
                      className="flex-1 gap-2 font-medium"
                      disabled={actionLoading === t.id || isClosed || (t.atendente_id && !isMine)}
                      onClick={() => handleAttend(t.id)}
                    >
                      <Headphones className="h-4 w-4" />
                      {actionLoading === t.id ? 'Aguarde...' : isMine ? 'Atendendo' : 'Atender'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      disabled={actionLoading === t.id || isClosed}
                      onClick={() => handleClose(t.id)}
                    >
                      <Lock className="h-4 w-4" /> Fechar
                    </Button>
                    <Select value={t.status === 'andamento' ? 'em_atendimento' : t.status === 'concluido' ? 'fechado' : t.status} onValueChange={(val) => handleStatusChange(t.id, val)}>
                      <SelectTrigger className="w-full sm:w-36 h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aberto">Aberto</SelectItem>
                        <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                        <SelectItem value="fechado">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
