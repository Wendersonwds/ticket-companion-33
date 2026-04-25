import { supabase } from '@/lib/supabase';

async function attachAttendants(tickets: any[]) {
  const attendantIds = Array.from(new Set((tickets ?? []).map((t) => t.atendente_id).filter(Boolean)));
  if (attendantIds.length === 0) return tickets ?? [];

  const { data: attendants, error } = await supabase
    .from('users')
    .select('id, name, role')
    .in('id', attendantIds);

  if (error) {
    console.log('Erro ao buscar atendentes:', error.message);
    return tickets ?? [];
  }

  const attendantsById = new Map((attendants ?? []).map((a: any) => [a.id, a]));
  return (tickets ?? []).map((ticket: any) => ({
    ...ticket,
    atendente: ticket.atendente_id ? attendantsById.get(ticket.atendente_id) ?? null : null,
  }));
}

// Get all tickets with client info
export async function getAdminTickets() {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, clients(id, user_id, users:user_id(name))')
    .order('created_at', { ascending: false });
  if (error) { console.log('Erro admin tickets:', error.message); return []; }
  return attachAttendants(data ?? []);
}

// Get all clients with user info and ticket counts
export async function getAdminClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('id, user_id, created_at, users:user_id(name), tickets(id)');
  if (error) { console.log('Erro admin clients:', error.message); return []; }
  return (data ?? []).map((c: any) => ({
    id: c.id,
    user_id: c.user_id,
    created_at: c.created_at,
    name: c.users?.name ?? 'Sem nome',
    email: '',
    ticketCount: c.tickets?.length ?? 0,
  }));
}

// Get dashboard metrics
export async function getAdminMetrics() {
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('id, title, status, type, priority, created_at, client_id, atendente_id, clients(id, user_id, users:user_id(name))');
  if (error) { console.log('Erro métricas:', error.message); return null; }

  const ticketsWithAttendants = await attachAttendants(tickets ?? []);

  const { data: clients } = await supabase.from('clients').select('id, created_at');

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const total = ticketsWithAttendants.length ?? 0;
  const abertos = ticketsWithAttendants.filter(t => t.status === 'aberto').length ?? 0;
  const andamento = ticketsWithAttendants.filter(t => t.status === 'em_atendimento' || t.status === 'andamento').length ?? 0;
  const concluidos = ticketsWithAttendants.filter(t => t.status === 'fechado' || t.status === 'concluido').length ?? 0;
  const totalClientes = clients?.length ?? 0;
  const novosClientes = clients?.filter(c => new Date(c.created_at) >= sevenDaysAgo).length ?? 0;

  // High priority open tickets
  const highPriority = ticketsWithAttendants.filter(t => t.priority === 'alta' && t.status !== 'fechado' && t.status !== 'concluido').length ?? 0;

  // Resolved in 24h (approximate - same day creation)
  const resolvedIn24h = 0; // Would need updated_at tracking

  // Tickets per day (last 14 days)
  const ticketsPerDay: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split('T')[0];
    ticketsPerDay[key] = 0;
  }
  ticketsWithAttendants.forEach(t => {
    const key = new Date(t.created_at).toISOString().split('T')[0];
    if (ticketsPerDay[key] !== undefined) ticketsPerDay[key]++;
  });

  // By type
  const byType: Record<string, number> = { bug: 0, melhoria: 0, novo_projeto: 0, duvida: 0 };
  ticketsWithAttendants.forEach(t => { if (byType[t.type] !== undefined) byType[t.type]++; });

  // By status
  const byStatus = { aberto: abertos, em_atendimento: andamento, fechado: concluidos };

  // By priority
  const priorityCounts: Record<string, number> = { baixa: 0, media: 0, alta: 0 };
  ticketsWithAttendants.forEach(t => { if (priorityCounts[t.priority] !== undefined) priorityCounts[t.priority]++; });
  const PRIORITY_LABELS: Record<string, string> = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };

  // Completion rate
  const taxaConclusao = total > 0 ? Math.round((concluidos / total) * 100) : 0;

  // Tickets per client
  const avgTicketsPerClient = totalClientes > 0 ? (total / totalClientes).toFixed(1) : '0';

  // Recent tickets (last 5)
  const recentTickets = ticketsWithAttendants
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return {
    total, abertos, andamento, concluidos,
    totalClientes, novosClientes,
    highPriority, resolvedIn24h,
    ticketsPerDay: Object.entries(ticketsPerDay).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      chamados: count,
    })),
    byType: Object.entries(byType).map(([name, value]) => ({ name, value })),
    byStatus: Object.entries(byStatus).map(([name, value]) => ({ name, value })),
    byPriority: Object.entries(priorityCounts).map(([name, value]) => ({ name: PRIORITY_LABELS[name] || name, value })),
    taxaConclusao,
    avgTicketsPerClient,
    recentTickets,
  };
}
