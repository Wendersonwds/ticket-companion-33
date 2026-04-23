import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getClientId } from '@/services/users';
import { createTicket } from '@/services/tickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const NewTicket = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) { toast({ title: 'Erro', description: 'Selecione uma categoria', variant: 'destructive' }); return; }
    if (!user) return;

    setSubmitting(true);
    try {
      const clientId = await getClientId(user.id);
      if (!clientId) { toast({ title: 'Erro', description: 'Não foi possível identificar o cliente', variant: 'destructive' }); return; }
      await createTicket({ title, description, type, priority: 'media', client_id: clientId });
      toast({ title: 'Chamado criado com sucesso!' });
      navigate('/tickets');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-lg mx-auto">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">← Voltar</Button>
        <Card>
          <CardHeader><CardTitle>Novo Chamado</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Categoria *</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="melhoria">Melhoria</SelectItem>
                    <SelectItem value="novo_projeto">Novo Projeto</SelectItem>
                    <SelectItem value="duvida">Dúvida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Título *</label>
                <Input placeholder="Resumo do chamado" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Descrição</label>
                <Textarea placeholder="Detalhes (opcional)" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Criando...' : 'Criar Chamado'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewTicket;
