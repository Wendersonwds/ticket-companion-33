import { useEffect, useState } from 'react';
import { getAdminClients } from '@/services/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Ticket } from 'lucide-react';

const AdminClients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAdminClients().then(c => { setClients(c); setLoading(false); });
  }, []);

  const filtered = clients.filter(c => {
    if (!search) return true;
    return c.name?.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6" /> Clientes ({filtered.length})
        </h2>
        <Input placeholder="Buscar por nome..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhum cliente encontrado.</p>
      ) : filtered.map(c => (
        <Card key={c.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{c.name}</p>
              <p className="text-sm text-muted-foreground">
                Cadastro: {c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '—'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Ticket className="h-4 w-4" />
              <span className="text-sm font-medium">{c.ticketCount} chamados</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminClients;
