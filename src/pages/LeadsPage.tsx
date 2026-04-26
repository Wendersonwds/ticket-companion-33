import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Mail, Zap, Code2, ShoppingCart, Layout, Ticket } from 'lucide-react';

const WHATSAPP_NUMBER = '5511999999999'; // ajuste para o número real
const CONTACT_EMAIL = 'contato@exemplo.com'; // ajuste para o email real

const services = [
  { icon: Layout, title: 'Sites', desc: 'Sites institucionais modernos e responsivos.' },
  { icon: Zap, title: 'Landing Pages', desc: 'Páginas de alta conversão para suas campanhas.' },
  { icon: Code2, title: 'Sistemas', desc: 'Sistemas web sob medida para o seu negócio.' },
  { icon: ShoppingCart, title: 'E-commerce', desc: 'Lojas virtuais completas e otimizadas.' },
];

const LeadsPage = () => {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Tenho interesse em um orçamento.')}`;
  const mailUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Orçamento')}`;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Sua Marca</h1>
        <Link to="/auth"><Button variant="outline" size="sm">Área do cliente</Button></Link>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 max-w-5xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
          Tire seu projeto do papel hoje mesmo
        </h2>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
          Fale conosco direto pelo WhatsApp ou e-mail. Sem cadastro, sem burocracia — só uma conversa rápida.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/auth">
            <Button size="lg" className="w-full sm:w-auto">
              <Ticket /> Abrir chamado
            </Button>
          </Link>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              <MessageCircle /> WhatsApp
            </Button>
          </a>
          <a href={mailUrl}>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Mail /> E-mail
            </Button>
          </a>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Entre com Google em 1 clique — sem confirmar e-mail.</p>
      </section>

      {/* Serviços */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button size="lg">
              <MessageCircle /> Quero conversar agora
            </Button>
          </a>
        </div>
      </section>

      <footer className="border-t bg-card px-6 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} — Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default LeadsPage;
