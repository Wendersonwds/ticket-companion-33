import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminTickets } from '@/services/admin';
import { closeTicket, startTicketAttendance, updateTicketStatus } from '@/services/tickets';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ArrowUpDown, Headphones, Lock } from 'lucide-react';
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
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Chamados</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} resultado(s)</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por título ou cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
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
            <Button variant="outline" size="icon" onClick={() => setSortOrder(s => s === 'desc' ? 'asc' : 'desc')} title="Ordenar">
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
        <div className="space-y-2">
          {filtered.map(t => {
            const sc = statusConfig[t.status] ?? statusConfig.aberto;
            const pc = priorityConfig[t.priority];
            return (
              <Card key={t.id} className="hover:shadow-md transition-all hover:border-primary/20">
                <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <Link to={`/tickets/${t.id}`} className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-medium">{getClientName(t)}</span> · {t.type} · {new Date(t.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    {t.atendente_id === user?.id && <p className="text-xs font-medium text-primary mt-1">Em atendimento por você</p>}
                  </Link>
                  <div className="flex gap-2 items-center flex-shrink-0 flex-wrap">
                    <Badge className={sc.color}>{sc.label}</Badge>
                    {pc && <Badge className={pc.color}>{pc.label}</Badge>}
                    <Button size="lg" className="gap-2" disabled={actionLoading === t.id || t.status === 'fechado' || (t.atendente_id && t.atendente_id !== user?.id)} onClick={() => handleAttend(t.id)}>
                      <Headphones className="h-4 w-4" />
                      {t.atendente_id === user?.id ? 'Em atendimento por você' : 'Atender chamado'}
                    </Button>
                    <Button variant="outline" className="gap-2" disabled={actionLoading === t.id || t.status === 'fechado'} onClick={() => handleClose(t.id)}>
                      <Lock className="h-4 w-4" /> Fechar chamado
                    </Button>
                    <Select value={t.status === 'andamento' ? 'em_atendimento' : t.status === 'concluido' ? 'fechado' : t.status} onValueChange={(val) => handleStatusChange(t.id, val)}>
                      <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
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
