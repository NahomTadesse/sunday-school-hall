'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AppSidebar } from './AppSidebar';
import { Topbar } from './Topbar';
import { PageTransition } from './PageTransition';
import { useAuth } from '@/contexts/AuthContext';

const PUBLIC_ROUTES = ['/', '/login', '/forgetpass'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login');
    }
    if (isAuthenticated && isPublicRoute && pathname !== '/forgetpass') {
      router.replace('/stat');
    }
  }, [isReady, isAuthenticated, isPublicRoute, pathname, router]);

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const showShell = isAuthenticated && !isPublicRoute;

  if (!showShell) {
    return <PageTransition>{children}</PageTransition>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-secondary/40">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="mx-auto w-full max-w-5xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
