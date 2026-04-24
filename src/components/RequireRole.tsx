import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export type Role = 'admin' | 'support' | 'client';

export default function RequireRole({ children, roles }: { children: ReactNode; roles: Role[] }) {
  const { user, loading, role, isRoleLoading } = useAuth();

  if (loading || isRoleLoading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando...</div>;
  }

  if (!user || !role || !roles.includes(role as Role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}