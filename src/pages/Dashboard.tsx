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
  AlertCircle, TrendingUp, BarChart3, User,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

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

  const statCards = [
    { label: 'Total', value: stats.total, icon: Ticket, accent: 'from-primary/20 to-primary/5', text: 'text-foreground', iconColor: 'text-primary' },
    { label: 'Abertos', value: stats.open, icon: Clock, accent: 'from-warning/20 to-warning/5', text: 'text-warning', iconColor: 'text-warning' },
    { label: 'Em Andamento', value: inProgress, icon: TrendingUp, accent: 'from-primary/20 to-primary/5', text: 'text-primary', iconColor: 'text-primary' },
    { label: 'Fechados', value: stats.done, icon: CheckCircle2, accent: 'from-success/20 to-success/5', text: 'text-success', iconColor: 'text-success' },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
              <Ticket className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-foreground tracking-tight truncate">Meus Chamados</h1>
              <p className="text-xs text-muted-foreground truncate">Olá, {userName} 👋</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link to="/tickets/new">
              <Button size="sm" className="gap-1.5 bg-gradient-primary hover:opacity-90 shadow-elegant transition-smooth">
                <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Novo Chamado</span>
              </Button>
            </Link>
            <ThemeToggle />
            <Link to="/profile">
              <Button variant="ghost" size="icon" aria-label="Meu perfil">
                <User className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate('/auth'); }} aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Hero summary */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-6 md:p-8 shadow-elegant">
          <div className="absolute inset-0 bg-gradient-hero opacity-70 pointer-events-none" />
          <div className="relative">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Visão geral</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-1">
              {stats.total === 0 ? 'Você ainda não tem chamados' : `${stats.total} chamado${stats.total > 1 ? 's' : ''} no total`}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe o status, prioridade e histórico de cada solicitação.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, accent, text, iconColor }) => (
            <div
              key={label}
              className={`relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-soft hover:shadow-card transition-smooth`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-50 pointer-events-none`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <p className={`text-3xl font-bold tracking-tight ${text}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {stats.total === 0 && !ticketsLoading && (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-10 text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center shadow-glow">
              <AlertCircle className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Nenhum chamado ainda</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Crie seu primeiro chamado para começar a acompanhar seus atendimentos.
              </p>
            </div>
            <Link to="/tickets/new">
              <Button className="bg-gradient-primary hover:opacity-90 shadow-elegant transition-smooth">
                <Plus className="h-4 w-4" /> Criar Primeiro Chamado
              </Button>
            </Link>
          </div>
        )}

        {stats.total > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Status overview */}
            <Card className="lg:col-span-1 border-border/60 bg-gradient-card shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Status dos chamados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Abertos', value: stats.open, bar: 'bg-warning' },
                  { label: 'Em atendimento', value: inProgress, bar: 'bg-primary' },
                  { label: 'Fechados', value: closed, bar: 'bg-success' },
                ].map(item => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full ${item.bar} transition-all duration-500`} style={{ width: `${(item.value / maxStatus) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent tickets */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground tracking-tight">Chamados Recentes</h2>
                <Link to="/tickets">
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                    Ver Todos <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-2.5">
                {recentTickets.map(t => {
                  const sc = statusConfig[t.status] ?? statusConfig.aberto;
                  return (
                    <Link key={t.id} to={`/tickets/${t.id}`}>
                      <div className="group rounded-xl border border-border/60 bg-gradient-card p-4 shadow-soft hover:shadow-elegant hover:border-primary/30 hover:-translate-y-0.5 transition-spring cursor-pointer flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate group-hover:text-primary transition-smooth">{t.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t.type} · {new Date(t.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center flex-shrink-0">
                          <Badge className={`${sc.color} border-0 font-medium`}>{sc.label}</Badge>
                          {t.priority && (
                            <Badge className={`${priorityConfig[t.priority] ?? ''} border-0 font-medium hidden sm:inline-flex`}>{t.priority}</Badge>
                          )}
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-smooth" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
