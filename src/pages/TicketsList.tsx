import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getClientId } from '@/services/users';
import { getTickets } from '@/services/tickets';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const priorityColors: Record<string, string> = {
  baixa: 'bg-muted text-muted-foreground',
  media: 'bg-warning/10 text-warning',
  alta: 'bg-destructive/10 text-destructive',
};

const TicketsList = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (!user) return;
    (async () => {
      const cid = await getClientId(user.id);
      if (cid) setTickets(await getTickets(cid));
    })();
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Meus Chamados</h2>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>← Dashboard</Button>
            <Link to="/tickets/new"><Button>Novo Chamado</Button></Link>
          </div>
        </div>
        {tickets.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Nenhum chamado encontrado.</p>
        ) : tickets.map(t => (
          <Link key={t.id} to={`/tickets/${t.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{t.title}</p>
                  <p className="text-sm text-muted-foreground">{t.type} · {new Date(t.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant="outline">{t.status}</Badge>
                  <Badge className={priorityColors[t.priority] ?? ''}>{t.priority}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TicketsList;
