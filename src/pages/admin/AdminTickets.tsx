import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminTickets } from '@/services/admin';
import { updateTicketStatus } from '@/services/tickets';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusColors: Record<string, string> = {
  aberto: 'bg-blue-100 text-blue-700',
  andamento: 'bg-yellow-100 text-yellow-700',
  concluido: 'bg-green-100 text-green-700',
};

const AdminTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterType, setFilterType] = useState('todos');
  const [filterPriority, setFilterPriority] = useState('todos');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    getAdminTickets().then(t => { setTickets(t); setLoading(false); });
  }, []);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    await updateTicketStatus(ticketId, newStatus);
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
  };

  const getClientName = (t: any) => t.clients?.users?.name ?? 'Desconhecido';

  let filtered = tickets
    .filter(t => filterStatus === 'todos' || t.status === filterStatus)
    .filter(t => filterType === 'todos' || t.type === filterType)
    .filter(t => filterPriority === 'todos' || t.priority === filterPriority)
    .filter(t => {
      if (!search) return true;
      const s = search.toLowerCase();
      return t.title?.toLowerCase().includes(s) || getClientName(t).toLowerCase().includes(s);
    });

  filtered = filtered.sort((a, b) => {
    const da = new Date(a.created_at).getTime();
    const db = new Date(b.created_at).getTime();
    return sortOrder === 'desc' ? db - da : da - db;
  });

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold text-foreground">Chamados ({filtered.length})</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Buscar por título ou cliente..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Status</SelectItem>
            <SelectItem value="aberto">Aberto</SelectItem>
            <SelectItem value="andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Tipos</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="melhoria">Melhoria</SelectItem>
            <SelectItem value="novo_projeto">Novo Projeto</SelectItem>
            <SelectItem value="duvida">Dúvida</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Mais Recentes</SelectItem>
            <SelectItem value="asc">Mais Antigos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ticket list */}
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhum chamado encontrado.</p>
      ) : filtered.map(t => (
        <Card key={t.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <Link to={`/tickets/${t.id}`} className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{t.title}</p>
              <p className="text-sm text-muted-foreground">
                {getClientName(t)} · {t.type} · {new Date(t.created_at).toLocaleDateString('pt-BR')}
              </p>
            </Link>
            <div className="flex gap-2 items-center flex-shrink-0">
              <Badge className={statusColors[t.status] ?? ''}>{t.status}</Badge>
              <Badge variant="outline">{t.priority}</Badge>
              <Select value={t.status} onValueChange={(val) => handleStatusChange(t.id, val)}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminTickets;
