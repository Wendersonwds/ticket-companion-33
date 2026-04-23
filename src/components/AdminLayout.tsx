import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, role, isRoleLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isRoleLoading) {
      if (!user) navigate('/auth');
      else if (role !== 'admin') navigate('/dashboard');
    }
  }, [user, loading, role, isRoleLoading, navigate]);

  if (loading || isRoleLoading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b bg-card px-4 flex-shrink-0">
            <SidebarTrigger className="mr-3" />
            <h1 className="text-lg font-semibold text-foreground">Painel Administrativo</h1>
          </header>
          <main className="flex-1 overflow-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
