import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getClientId } from '@/services/users';
import { getTickets, getTicketStats } from '@/services/tickets';
import { signOut } from '@/services/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Ticket, Clock, CheckCircle2, Plus, LogOut, ArrowRight,
  AlertCircle, TrendingUp, BarChart3,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  aberto: { label: 'Aberto', color: 'bg-warning/10 text-warning', icon: Clock },
  andamento: { label: 'Em Atendimento', color: 'bg-primary/10 text-primary', icon: TrendingUp },
  em_atendimento: { label: 'Em Atendimento', color: 'bg-primary/10 text-primary', icon: TrendingUp },
  concluido: { label: 'Fechado', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  fechado: { label: 'Fechado', color: 'bg-success/10 text-success', icon: CheckCircle2 },
};

const priorityConfig: Record<string, string> = {
  baixa: 'bg-muted text-muted-foreground',
  media: 'bg-warning/10 text-warning',
  alta: 'bg-destructive/10 text-destructive',
};

const Dashboard = () => {
  const { user, loading, role, isRoleLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, open: 0, done: 0 });
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (!loading && !isRoleLoading && (role === 'admin' || role === 'support')) { navigate('/admin'); return; }
    if (!user) return;
    (async () => {
      const clientId = await getClientId(user.id);
      if (clientId) {
        const [s, t] = await Promise.all([getTicketStats(clientId), getTickets(clientId)]);
        setStats(s);
        setTickets(t);
      }
      setTicketsLoading(false);
    })();
  }, [user, loading, role, isRoleLoading, navigate]);

  if (loading || isRoleLoading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando...</div>;

  const inProgress = tickets.filter(t => t.status === 'em_atendimento' || t.status === 'andamento').length;
  const recentTickets = tickets.slice(0, 5);
  const userName = user?.email?.split('@')[0] ?? 'Usuário';
  const closed = stats.done;
  const maxStatus = Math.max(stats.open, inProgress, closed, 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Meus Chamados</h1>
          <p className="text-sm text-muted-foreground">Olá, {userName} 👋</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/tickets/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Novo Chamado
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/auth'); }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Ticket className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-warning" />
                <span className="text-xs text-muted-foreground">Abertos</span>
              </div>
              <p className="text-2xl font-bold text-warning">{stats.open}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Em Andamento</span>
              </div>
              <p className="text-2xl font-bold text-primary">{inProgress}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-xs text-muted-foreground">Fechados</span>
              </div>
              <p className="text-2xl font-bold text-success">{stats.done}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {stats.total === 0 && (
          <Card className="border-dashed border-2">
            <CardContent className="p-8 text-center space-y-3">
              <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Nenhum chamado ainda</h3>
              <p className="text-sm text-muted-foreground">Crie seu primeiro chamado para começar a acompanhar seus atendimentos.</p>
              <Link to="/tickets/new">
                <Button className="mt-2">Criar Primeiro Chamado</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {stats.total > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Status dos chamados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Abertos', value: stats.open, bar: 'bg-warning' },
                { label: 'Em atendimento', value: inProgress, bar: 'bg-primary' },
                { label: 'Fechados', value: closed, bar: 'bg-success' },
              ].map(item => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">{item.label}</span><span className="font-medium text-foreground">{item.value}</span></div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full ${item.bar}`} style={{ width: `${(item.value / maxStatus) * 100}%` }} /></div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Tickets */}
        {recentTickets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Chamados Recentes</h2>
              <Link to="/tickets">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                  Ver Todos <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {recentTickets.map(t => {
              const sc = statusConfig[t.status] ?? statusConfig.aberto;
              return (
                <Link key={t.id} to={`/tickets/${t.id}`}>
                  <Card className="hover:shadow-md transition-all cursor-pointer mb-2 hover:border-primary/20">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{t.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t.type} · {new Date(t.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center flex-shrink-0">
                        <Badge className={sc.color}>{sc.label}</Badge>
                        {t.priority && (
                          <Badge className={priorityConfig[t.priority] ?? ''}>{t.priority}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
