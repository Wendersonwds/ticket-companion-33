import { useEffect, useState } from 'react';
import { getAdminMetrics } from '@/services/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Ticket, Clock, CheckCircle2, Users, UserPlus, TrendingUp, Percent, BarChart3,
} from 'lucide-react';

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)'];

const TYPE_LABELS: Record<string, string> = {
  bug: 'Bug',
  melhoria: 'Melhoria',
  novo_projeto: 'Novo Projeto',
  duvida: 'Dúvida',
};

const STATUS_LABELS: Record<string, string> = {
  aberto: 'Abertos',
  andamento: 'Em Andamento',
  concluido: 'Concluídos',
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
    { label: 'Total de Chamados', value: metrics.total, icon: Ticket, color: 'text-primary' },
    { label: 'Abertos', value: metrics.abertos, icon: Clock, color: 'text-blue-500' },
    { label: 'Em Andamento', value: metrics.andamento, icon: TrendingUp, color: 'text-warning' },
    { label: 'Finalizados', value: metrics.concluidos, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Total de Clientes', value: metrics.totalClientes, icon: Users, color: 'text-purple-500' },
    { label: 'Novos (7 dias)', value: metrics.novosClientes, icon: UserPlus, color: 'text-cyan-500' },
  ];

  const kpiCards = [
    { label: 'Taxa de Conclusão', value: `${metrics.taxaConclusao}%`, icon: Percent },
    { label: 'Chamados / Cliente', value: metrics.avgTicketsPerClient, icon: BarChart3 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {kpiCards.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                <k.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{k.label}</p>
                <p className="text-2xl font-bold text-foreground">{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Tickets per day */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Chamados por Dia (14 dias)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metrics.ticketsPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="chamados" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Status */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Chamados por Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics.byStatus.map((s: any) => ({ ...s, name: STATUS_LABELS[s.name] || s.name }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {metrics.byStatus.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart - Types */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Chamados por Tipo</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={metrics.byType.map((t: any) => ({ ...t, name: TYPE_LABELS[t.name] || t.name }))}
                cx="50%" cy="50%"
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
    </div>
  );
};

export default AdminOverview;
