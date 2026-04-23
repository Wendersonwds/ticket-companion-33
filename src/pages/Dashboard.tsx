import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getClientId } from '@/services/users';
import { getTicketStats } from '@/services/tickets';
import { signOut } from '@/services/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user, loading, role, isRoleLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, open: 0, done: 0 });

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (!loading && !isRoleLoading && role === 'admin') { navigate('/admin'); return; }
    if (!user) return;
    (async () => {
      const clientId = await getClientId(user.id);
      if (clientId) setStats(await getTicketStats(clientId));
    })();
  }, [user, loading, role, isRoleLoading, navigate]);

  if (loading || isRoleLoading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Meus Chamados</h1>
        <div className="flex items-center gap-3">
          <Link to="/tickets"><Button variant="outline" size="sm">Ver Chamados</Button></Link>
          <Link to="/tickets/new"><Button size="sm">Novo Chamado</Button></Link>
          <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/auth'); }}>Sair</Button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-foreground">{stats.total}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Abertos</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-primary">{stats.open}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Concluídos</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-green-600">{stats.done}</p></CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
