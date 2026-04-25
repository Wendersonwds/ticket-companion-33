import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, updateProfile } from '@/services/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { ArrowLeft, Save, User, Palette, Check } from 'lucide-react';
import { useTheme, themes } from '@/contexts/ThemeContext';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [form, setForm] = useState({ name: '', email: '', company: '', avatar_url: '' });
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (!user) return;
    (async () => {
      const p = await getProfile(user.id, user.email ?? undefined);
      setForm(p);
      setInitialLoading(false);
    })();
  }, [user, loading, navigate]);

  const onSave = async () => {
    if (!user) return;
    if (!form.name.trim()) { toast.error('O nome é obrigatório'); return; }
    setSaving(true);
    try {
      await updateProfile(user.id, { name: form.name.trim(), company: form.company.trim(), avatar_url: form.avatar_url.trim() });
      toast.success('Perfil atualizado com sucesso');
    } catch (e: any) {
      toast.error('Erro ao salvar', { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading || initialLoading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando perfil...</div>;
  }

  const initials = (form.name || form.email || 'U').slice(0, 2).toUpperCase();

  const swatch = (id: string) => {
    if (id === 'light') return 'bg-white';
    if (id === 'dark') return 'bg-slate-900';
    if (id === 'ocean') return 'bg-[hsl(195,90%,55%)]';
    return 'bg-[hsl(330,85%,62%)]';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Voltar">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-sm text-muted-foreground">Gerencie suas informações e preferências</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-4 w-4" /> Informações pessoais</CardTitle>
            <CardDescription>Esses dados ficam vinculados à sua conta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                {form.avatar_url && <AvatarImage src={form.avatar_url} alt={form.name} />}
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <Label htmlFor="avatar">URL da foto de perfil</Label>
                <Input id="avatar" placeholder="https://..." value={form.avatar_url}
                  onChange={e => setForm({ ...form, avatar_url: e.target.value })} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">Nome completo *</Label>
                <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" value={form.email} disabled />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="company">Empresa</Label>
              <Input id="company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Nome da sua empresa" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Link to="/dashboard"><Button variant="outline">Cancelar</Button></Link>
              <Button onClick={onSave} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" /> {saving ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-4 w-4" /> Tema do site</CardTitle>
            <CardDescription>A escolha é salva no seu navegador e aplicada automaticamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {themes.map(t => {
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`relative rounded-lg border-2 p-3 text-left transition-all hover:border-primary ${active ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}
                  >
                    <div className={`h-12 w-full rounded-md mb-2 border ${swatch(t.id)}`} />
                    <p className="text-sm font-medium text-foreground">{t.label}</p>
                    <p className="text-[11px] text-muted-foreground">{t.description}</p>
                    {active && (
                      <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
