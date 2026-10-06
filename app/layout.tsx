import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppShell } from '@/components/shell/AppShell';
import { Toaster } from '@/components/ui/sonner';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sunday School — Hall Dashboard',
  description: 'Hall & booking management dashboard',
  icons: { icon: '/favicon.svg' },
};

// Runs before React hydrates so the correct theme class is present on
// <html> immediately — avoids a light/dark flash on load.
const noFlashScript = `
(function () {
  try {
    var match = document.cookie.match(/(?:^|; )app_theme=([^;]*)/);
    var theme = match ? decodeURIComponent(match[1]) : null;
    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={jakarta.variable}>
      <head>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AppShell>{children}</AppShell>
              <Toaster position="top-center" richColors closeButton />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
