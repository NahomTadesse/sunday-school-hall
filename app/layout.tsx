

"use client";
import '@mantine/core/styles.css';
import React, { useEffect } from 'react';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { theme } from '../theme';
import { NavbarNested } from '../components/Navbar/NavbarNested';
import { FooterLinks } from '../components/Footer/FooterLinks';
import { usePathname, useRouter } from 'next/navigation';
import AuthGuard from '../components/AuthGuard';
import { isAuthenticated } from '../app/utils/auth';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const authenticated = isAuthenticated();

  // Check for both root (/) and /login as login pages
  const isLoginPage = pathname === '/' || pathname === '/login';
  const isForgetPage = pathname === '/forgetpass';
  const showNavbar = authenticated && !isLoginPage && !isForgetPage;

  // Redirect to /stat if user is authenticated and trying to access login pages
  useEffect(() => {
    if (authenticated && (isLoginPage || isForgetPage)) {
      router.push('/stat');
    }
  }, [authenticated, isLoginPage, isForgetPage, router]);

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <AuthGuard>
            {showNavbar ? (
              <div style={{ display: 'flex', height: '100vh' }}>
                <NavbarNested />
                <main style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}>
                  <div style={{ height: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                    {children}
                  </div>
                </main>
              </div>
            ) : (
              // For login and forget password pages, render without navbar
              <div>
                {children}
              </div>
            )}
            <FooterLinks />
          </AuthGuard>
        </MantineProvider>
      </body>
    </html>
  );
}