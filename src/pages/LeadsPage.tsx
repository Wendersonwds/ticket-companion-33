import { useState } from 'react';
import { createLead } from '@/services/leads';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const LeadsPage = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', service_type: 'site', description: '', budget: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createLead(form);
      setSent(true);
      toast({ title: 'Solicitação enviada!' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12 space-y-4">
            <p className="text-2xl font-bold text-foreground">✓ Enviado!</p>
            <p className="text-muted-foreground">Entraremos em contato em breve.</p>
            <Button variant="outline" onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', service_type: 'site', description: '', budget: '' }); }}>
              Enviar outro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Solicite um Orçamento</h1>
        <Link to="/auth"><Button variant="outline" size="sm">Login</Button></Link>
      </header>
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Fale Conosco</CardTitle>
            <CardDescription>Preencha o formulário abaixo e entraremos em contato</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <Input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              <Input placeholder="Telefone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
              <Select value={form.service_type} onValueChange={v => setForm(f => ({ ...f, service_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="site">Site</SelectItem>
                  <SelectItem value="landing_page">Landing Page</SelectItem>
                  <SelectItem value="sistema">Sistema</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="Descreva seu projeto" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
              <Input placeholder="Orçamento estimado (R$)" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeadsPage;
