import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminClients } from '@/services/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Ticket, Search, Mail, Calendar, UserPlus, TicketCheck } from 'lucide-react';

const AdminClients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAdminClients().then(c => { setClients(c); setLoading(false); });
  }, []);

  const filtered = clients.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s);
  });

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>;

  const total = clients.length;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const novos = clients.filter(c => c.created_at && new Date(c.created_at).getTime() >= sevenDaysAgo).length;
  const comTickets = clients.filter(c => (c.ticketCount ?? 0) > 0).length;

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6" /> Clientes
        </h2>
        <p className="text-sm text-muted-foreground">{filtered.length} de {total} cliente(s) exibido(s)</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total cadastrados</p>
              <p className="text-3xl font-bold text-foreground">{total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Novos (7 dias)</p>
              <p className="text-3xl font-bold text-foreground">{novos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <TicketCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Com chamados</p>
              <p className="text-3xl font-bold text-foreground">{comTickets}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      {/* Clients grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <Card key={c.id} className="hover:shadow-md transition-all hover:border-primary/20">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <span className="text-sm font-bold text-primary">
                        {(c.name ?? '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <p className="font-semibold text-foreground truncate">{c.name}</p>
                    {c.email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3" /> {c.email}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Ticket className="h-3 w-3" /> {c.ticketCount}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Cadastro: {c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '—'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminClients;
