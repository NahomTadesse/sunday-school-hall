"use client";
import '@mantine/core/styles.css';
import React from 'react';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { theme } from '../theme';
import { NavbarNested } from '../components/Navbar/NavbarNested';
import { FooterLinks } from '../components/Footer/FooterLinks';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isLoginPage = pathname === '/';
  const isForgetPage = pathname === '/forgetpass';

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
          <div style={{ display: 'flex', height: '100vh' }}>
            {/* Render Navbar only if not on the login page */}
            {!isLoginPage && !isForgetPage && <NavbarNested />}
            <main style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}>
              {/* Set a max height for scrollable area */}
              <div style={{ height: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                {children}
              </div>
            </main>
          </div>
          <FooterLinks />
        </MantineProvider>
      </body>
    </html>
  );
}