import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, role, isRoleLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isRoleLoading) {
      if (!user) navigate('/auth');
      else if (role !== 'admin' && role !== 'support') navigate('/dashboard');
    }
  }, [user, loading, role, isRoleLoading, navigate]);

  if (loading || isRoleLoading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando...</div>;
  }

  const adminName = user?.email?.split('@')[0] ?? 'Admin';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card/80 backdrop-blur-md px-3 sm:px-4 flex-shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <SidebarTrigger />
              <h1 className="text-sm sm:text-lg font-semibold text-foreground truncate">
                <span className="hidden sm:inline">Painel Administrativo</span>
                <span className="sm:hidden">Admin</span>
              </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <ThemeToggle />
              <Link to="/profile">
                <Button variant="ghost" size="icon" aria-label="Meu perfil" className="h-8 w-8 sm:h-9 sm:w-9">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground hidden md:inline truncate max-w-[120px]">{adminName}</span>
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  <Shield className="h-3.5 w-3.5" />
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
