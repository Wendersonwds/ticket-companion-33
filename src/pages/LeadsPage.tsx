import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  MessageCircle, Mail, Zap, Code2, ShoppingCart, Layout, Ticket,
  ArrowRight, Sparkles, Check, Star,
} from 'lucide-react';

const WHATSAPP_NUMBER = '5511999999999';
const CONTACT_EMAIL = 'contato@exemplo.com';

const services = [
  { icon: Layout, title: 'Sites Institucionais', desc: 'Presença digital sofisticada que converte visitantes em clientes.' },
  { icon: Zap, title: 'Landing Pages', desc: 'Páginas de alta performance otimizadas para campanhas.' },
  { icon: Code2, title: 'Sistemas Web', desc: 'Plataformas sob medida para escalar o seu negócio.' },
  { icon: ShoppingCart, title: 'E-commerce', desc: 'Lojas virtuais completas, rápidas e otimizadas para vendas.' },
];

const benefits = [
  'Atendimento direto, sem burocracia',
  'Acompanhe seus chamados em tempo real',
  'Suporte ágil via WhatsApp e e-mail',
  'Equipe especializada em projetos digitais',
];

const LeadsPage = () => {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Tenho interesse em um orçamento.')}`;
  const mailUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Orçamento')}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Sua Marca</h1>
          </div>
          <Link to="/auth">
            <Button variant="outline" size="sm" className="gap-1.5">
              Área do cliente <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 glass px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
            <Star className="h-3 w-3 text-primary fill-primary" />
            Soluções digitais sob medida
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
            Tire seu projeto<br />
            <span className="text-gradient">do papel hoje mesmo</span>
          </h2>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Fale conosco direto pelo WhatsApp ou e-mail. Sem cadastro, sem burocracia — só uma conversa rápida.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-gradient-primary hover:opacity-90 shadow-elegant transition-smooth">
                <Ticket className="h-4 w-4" /> Abrir chamado
              </Button>
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto h-12 px-8 transition-smooth">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </Button>
            </a>
            <a href={mailUrl}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 transition-smooth">
                <Mail className="h-4 w-4" /> E-mail
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            O que fazemos
          </h3>
          <p className="mt-3 text-muted-foreground">Serviços completos para o seu negócio crescer online</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-soft hover:shadow-elegant hover:border-primary/30 hover:-translate-y-1 transition-spring"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4 group-hover:scale-110 transition-spring">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h4 className="font-semibold text-foreground text-base">{title}</h4>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefícios + CTA */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-card p-10 md:p-16 shadow-elegant">
          <div className="absolute inset-0 bg-gradient-hero opacity-60 pointer-events-none" />
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Pronto para começar?
              </h3>
              <p className="mt-3 text-muted-foreground text-lg">
                Abra um chamado agora e nossa equipe entra em contato rapidamente.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-gradient-primary hover:opacity-90 shadow-elegant transition-smooth">
                    <Ticket className="h-4 w-4" /> Abrir chamado
                  </Button>
                </Link>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 transition-smooth">
                    <MessageCircle className="h-4 w-4" /> Conversar
                  </Button>
                </a>
              </div>
            </div>
            <ul className="space-y-3">
              {benefits.map(b => (
                <li key={b} className="flex items-start gap-3 text-foreground">
                  <span className="mt-0.5 h-5 w-5 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </span>
                  <span className="text-sm md:text-base">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 px-6 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Sua Marca — Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default LeadsPage;
