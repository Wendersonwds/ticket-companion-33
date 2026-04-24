import { useEffect, useState } from 'react';
import { getAdminMetrics } from '@/services/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import {
  Ticket, Clock, CheckCircle2, Users, UserPlus, TrendingUp, Percent, BarChart3,
  AlertTriangle, Zap,
} from 'lucide-react';

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)'];

const TYPE_LABELS: Record<string, string> = {
  bug: 'Bug', melhoria: 'Melhoria', novo_projeto: 'Novo Projeto', duvida: 'Dúvida',
};

const STATUS_LABELS: Record<string, string> = {
  aberto: 'Abertos', andamento: 'Em Atendimento', em_atendimento: 'Em Atendimento', concluido: 'Fechados', fechado: 'Fechados',
};

const AdminOverview = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminMetrics().then(m => { setMetrics(m); setLoading(false); });
  }, []);

  if (loading || !metrics) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando métricas...</div>;
  }

  const statCards = [
    { label: 'Total de Chamados', value: metrics.total, icon: Ticket, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Abertos', value: metrics.abertos, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Em Atendimento', value: metrics.andamento, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Fechados', value: metrics.concluidos, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Total Clientes', value: metrics.totalClientes, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Novos (7 dias)', value: metrics.novosClientes, icon: UserPlus, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  ];

  const kpiCards = [
    { label: 'Taxa de Conclusão', value: `${metrics.taxaConclusao}%`, icon: Percent, desc: 'Chamados fechados / total' },
    { label: 'Chamados / Cliente', value: metrics.avgTicketsPerClient, icon: BarChart3, desc: 'Média por cliente ativo' },
    { label: 'Chamados Urgentes', value: metrics.highPriority ?? 0, icon: AlertTriangle, desc: 'Prioridade alta pendentes' },
    { label: 'Resolução Rápida', value: `${metrics.resolvedIn24h ?? 0}`, icon: Zap, desc: 'Resolvidos em < 24h' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Visão Geral</h2>
        <p className="text-sm text-muted-foreground">Acompanhe o desempenho do sistema em tempo real</p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className={`h-8 w-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((k) => (
          <Card key={k.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                  <k.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{k.value}</p>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">{k.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart - Tickets per day */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Chamados por Dia (14 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={metrics.ticketsPerDay}>
                <defs>
                  <linearGradient id="colorChamados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="chamados" stroke="hsl(217, 91%, 60%)" strokeWidth={2} fill="url(#colorChamados)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Chamados por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={metrics.byStatus.map((s: any) => ({ ...s, name: STATUS_LABELS[s.name] || s.name }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {metrics.byStatus.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={metrics.byType.map((t: any) => ({ ...t, name: TYPE_LABELS[t.name] || t.name }))}
                  cx="50%" cy="50%"
                  innerRadius={55}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {metrics.byType.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Prioridade dos Chamados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={metrics.byPriority ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  <Cell fill="hsl(215, 16%, 70%)" />
                  <Cell fill="hsl(38, 92%, 50%)" />
                  <Cell fill="hsl(0, 84%, 60%)" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      {metrics.recentTickets && metrics.recentTickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Últimos Chamados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.recentTickets.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.type} · {new Date(t.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <Badge className={
                  t.status === 'aberto' ? 'bg-warning/10 text-warning' :
                  (t.status === 'andamento' || t.status === 'em_atendimento') ? 'bg-primary/10 text-primary' :
                  'bg-success/10 text-success'
                }>
                  {STATUS_LABELS[t.status] ?? t.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminOverview;
