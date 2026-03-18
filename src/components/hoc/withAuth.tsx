'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Higher-Order Component for protected routes
 *
 * Usage:
 * const ProtectedPage = withAuth(YourComponent);
 *
 * or with options:
 * const AdminPage = withAuth(YourComponent, { requiredRole: 'admin' });
 */
export interface WithAuthOptions {
  requiredRole?: string;
  redirectTo?: string;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const { requiredRole, redirectTo = '/login' } = options;

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push(redirectTo);
      }

      if (
        !isLoading &&
        isAuthenticated &&
        requiredRole &&
        user?.role !== requiredRole
      ) {
        router.push('/unauthorized');
      }
    }, [isAuthenticated, isLoading, redirectTo, requiredRole, router, user]);

    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    if (requiredRole && user?.role !== requiredRole) {
      return null;
    }

    return <Component {...props} />;
  };
}
