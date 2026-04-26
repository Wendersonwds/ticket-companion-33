import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

async function attachAttendants(tickets: any[]) {
  const attendantIds = Array.from(new Set((tickets ?? []).map((t) => t.atendente_id).filter(Boolean)));
  if (attendantIds.length === 0) return tickets ?? [];

  const { data: attendants, error } = await supabase
    .from('users')
    .select('id, name, role')
    .in('id', attendantIds);

  if (error) {
    logger.debug('Erro ao buscar atendentes:', error.message);
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
  if (error) { logger.debug('Erro admin tickets:', error.message); return []; }
  return attachAttendants(data ?? []);
}

// Get all clients (users with role 'client') with their client profile + ticket counts
export async function getAdminClients() {
  // 1. Buscar todos os usuários com role 'client'
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, email, created_at, role')
    .eq('role', 'client');

  if (usersError) { logger.debug('Erro admin users:', usersError.message); return []; }

  const userIds = (users ?? []).map(u => u.id);
  if (userIds.length === 0) return [];

  // 2. Buscar perfis de cliente correspondentes
  const { data: clientProfiles } = await supabase
    .from('clients')
    .select('id, user_id, created_at')
    .in('user_id', userIds);

  const profileByUser = new Map((clientProfiles ?? []).map((c: any) => [c.user_id, c]));

  // 3. Contar tickets por client_id
  const clientIds = (clientProfiles ?? []).map((c: any) => c.id);
  const ticketsByClient = new Map<string, number>();
  if (clientIds.length > 0) {
    const { data: tickets } = await supabase
      .from('tickets')
      .select('id, client_id')
      .in('client_id', clientIds);
    (tickets ?? []).forEach((t: any) => {
      ticketsByClient.set(t.client_id, (ticketsByClient.get(t.client_id) ?? 0) + 1);
    });
  }

  return (users ?? []).map((u: any) => {
    const profile: any = profileByUser.get(u.id);
    return {
      id: profile?.id ?? u.id,
      user_id: u.id,
      created_at: profile?.created_at ?? u.created_at,
      name: u.name ?? 'Sem nome',
      email: u.email ?? '',
      ticketCount: profile ? (ticketsByClient.get(profile.id) ?? 0) : 0,
      hasProfile: !!profile,
    };
  });
}

// Get dashboard metrics
export async function getAdminMetrics() {
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('id, title, status, type, priority, created_at, client_id, atendente_id, clients(id, user_id, users:user_id(name))');
  if (error) { logger.debug('Erro métricas:', error.message); return null; }

  const ticketsWithAttendants = await attachAttendants(tickets ?? []);

  // Total de clientes = usuários com role 'client' (mesma fonte da página /admin/clients)
  const { data: clientUsers } = await supabase
    .from('users')
    .select('id, created_at')
    .eq('role', 'client');

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const total = ticketsWithAttendants.length ?? 0;
  const abertos = ticketsWithAttendants.filter(t => t.status === 'aberto').length ?? 0;
  const andamento = ticketsWithAttendants.filter(t => t.status === 'em_atendimento' || t.status === 'andamento').length ?? 0;
  const concluidos = ticketsWithAttendants.filter(t => t.status === 'fechado' || t.status === 'concluido').length ?? 0;
  const totalClientes = clientUsers?.length ?? 0;
  const novosClientes = clientUsers?.filter(c => new Date(c.created_at) >= sevenDaysAgo).length ?? 0;

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
