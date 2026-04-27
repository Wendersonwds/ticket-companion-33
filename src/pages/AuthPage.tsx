import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn, signUp } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, Mail, Lock, User as UserIcon, Sparkles,
  ShieldCheck, Lock as LockIcon, Zap, MessageCircle, CheckCircle2, Star,
} from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const data = await signIn(email, password);
        const { data: userData } = await supabase.from('users').select('role').eq('id', data.user.id).single();
        navigate(userData?.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        await signUp(email, password, name);
        toast({ title: 'Cadastro realizado!', description: 'Verifique seu email para confirmar.' });
        setIsLogin(true);
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Zap, title: 'Atendimento ágil', desc: 'Resposta rápida em todos os chamados.' },
    { icon: MessageCircle, title: 'Comunicação direta', desc: 'Converse com nossa equipe em tempo real.' },
    { icon: CheckCircle2, title: 'Acompanhamento total', desc: 'Visualize status e histórico de cada solicitação.' },
  ];

  const trustBadges = [
    { icon: ShieldCheck, label: 'Dados protegidos' },
    { icon: LockIcon, label: 'Conexão segura (SSL)' },
    { icon: Star, label: 'Clientes satisfeitos' },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-10 px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground tracking-tight">Sua Marca</span>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 lg:py-14">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left — trust / summary (mobile: above form, but compact) */}
          <div className="order-2 lg:order-1 space-y-6">
            <div className="hidden lg:block">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 glass px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
                <Star className="h-3 w-3 text-primary fill-primary" />
                Plataforma de chamados premium
              </div>
              <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-foreground leading-tight">
                Sua central de atendimento, <span className="text-gradient">simples e confiável</span>
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Abra chamados, acompanhe o andamento e converse com nossa equipe em um só lugar. Tudo com segurança e total transparência.
              </p>
            </div>

            <div className="grid gap-3">
              {benefits.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-xl border border-border/60 bg-gradient-card p-4 shadow-soft"
                >
                  <div className="h-9 w-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
                    <Icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 pt-2">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="order-1 lg:order-2">
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute -inset-1 bg-gradient-primary rounded-2xl blur-2xl opacity-20" />

              <div className="relative glass rounded-2xl border border-border/50 shadow-elegant p-6 sm:p-8">
                {/* Mobile-only headline */}
                <div className="lg:hidden text-center mb-6">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Sua central de <span className="text-gradient">atendimento</span>
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">Acompanhe seus chamados com segurança</p>
                </div>

                <div className="flex flex-col items-center text-center mb-6">
                  <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow mb-3">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {isLogin ? 'Bem-vindo de volta' : 'Criar sua conta'}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    {isLogin ? 'Acesse sua área de chamados' : 'Comece em menos de um minuto'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-medium">Nome completo</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="name" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required className="pl-9 h-11" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="voce@empresa.com" value={email} onChange={e => setEmail(e.target.value)} required className="pl-9 h-11" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-medium">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="pl-9 h-11" />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 bg-gradient-primary hover:opacity-90 shadow-elegant transition-smooth" disabled={loading}>
                    {loading ? 'Aguarde...' : isLogin ? 'Entrar com segurança' : 'Criar conta'}
                  </Button>
                </form>

                <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>Seus dados são criptografados e protegidos</span>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-5">
                  {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
                  <button type="button" className="text-primary font-medium hover:underline" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Cadastre-se' : 'Faça login'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
