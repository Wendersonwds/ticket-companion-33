import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/services/auth';
import { getAllTickets, updateTicketStatus } from '@/services/tickets';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusColors: Record<string, string> = {
  aberto: 'bg-blue-100 text-blue-700',
  andamento: 'bg-yellow-100 text-yellow-700',
  concluido: 'bg-green-100 text-green-700',
};

const AdminDashboard = () => {
  const { user, loading, role, isRoleLoading } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [filter, setFilter] = useState('todos');

  useEffect(() => {
    if (!loading && !isRoleLoading) {
      if (!user) { navigate('/auth'); return; }
      if (role !== 'admin') { navigate('/dashboard'); return; }
    }
  }, [user, loading, role, isRoleLoading, navigate]);

  useEffect(() => {
    if (role === 'admin') {
      getAllTickets().then(setTickets);
    }
  }, [role]);

  const filtered = filter === 'todos' ? tickets : tickets.filter(t => t.status === filter);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    await updateTicketStatus(ticketId, newStatus);
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
  };

  if (loading || isRoleLoading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Painel Admin</h1>
        <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/auth'); }}>Sair</Button>
      </header>
      <main className="max-w-5xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Todos os Chamados ({filtered.length})</h2>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="aberto">Abertos</SelectItem>
              <SelectItem value="andamento">Em Andamento</SelectItem>
              <SelectItem value="concluido">Concluídos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Nenhum chamado encontrado.</p>
        ) : filtered.map(t => (
          <Card key={t.id} className="mb-3">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <Link to={`/tickets/${t.id}`} className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{t.title}</p>
                <p className="text-sm text-muted-foreground">{t.type} · {new Date(t.created_at).toLocaleDateString('pt-BR')}</p>
              </Link>
              <div className="flex gap-2 items-center flex-shrink-0">
                <Badge className={statusColors[t.status] ?? ''}>{t.status}</Badge>
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
      </main>
    </div>
  );
};

export default AdminDashboard;
