import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getClientId } from '@/services/users';
import { getTickets } from '@/services/tickets';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ticket, Search, ArrowLeft, Plus } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string }> = {
  aberto: { label: 'Aberto', color: 'bg-warning/10 text-warning' },
  andamento: { label: 'Em Atendimento', color: 'bg-primary/10 text-primary' },
  em_atendimento: { label: 'Em Atendimento', color: 'bg-primary/10 text-primary' },
  concluido: { label: 'Fechado', color: 'bg-success/10 text-success' },
  fechado: { label: 'Fechado', color: 'bg-success/10 text-success' },
};

const priorityColors: Record<string, string> = {
  baixa: 'bg-muted text-muted-foreground',
  media: 'bg-warning/10 text-warning',
  alta: 'bg-destructive/10 text-destructive',
};

const TicketsList = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (!user) return;
    (async () => {
      const cid = await getClientId(user.id);
      if (cid) setTickets(await getTickets(cid));
    })();
  }, [user, loading, navigate]);

  const filtered = tickets
    .filter(t => filterStatus === 'todos' || t.status === filterStatus || (filterStatus === 'em_atendimento' && t.status === 'andamento') || (filterStatus === 'fechado' && t.status === 'concluido'))
    .filter(t => !search || t.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Ticket className="h-5 w-5" /> Meus Chamados
            </h1>
            <p className="text-sm text-muted-foreground">{filtered.length} chamado(s)</p>
          </div>
        </div>
        <Link to="/tickets/new">
          <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Novo</Button>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar chamado..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="aberto">Abertos</SelectItem>
              <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
              <SelectItem value="fechado">Fechados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tickets */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <Ticket className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum chamado encontrado.</p>
          </div>
        ) : filtered.map(t => {
          const sc = statusConfig[t.status] ?? statusConfig.aberto;
          return (
            <Link key={t.id} to={`/tickets/${t.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer mb-3 hover:border-primary/20">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.type} · {new Date(t.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center flex-shrink-0">
                    <Badge className={sc.color}>{sc.label}</Badge>
                    <Badge className={priorityColors[t.priority] ?? ''}>{t.priority}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </main>
    </div>
  );
};

export default TicketsList;
