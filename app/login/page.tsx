'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/shell/LanguageSwitcher';
import { ThemeToggle } from '@/components/shell/ThemeToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

export default function LoginPage() {
  const { t } = useLanguage();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('email') : null;
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ principal: email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        if (rememberMe) {
          localStorage.setItem('email', email);
        } else {
          localStorage.removeItem('email');
        }

        login(data, rememberMe);
        toast.success(t('auth.welcomeBack'));
        // AppShell's own effect redirects once isAuthenticated flips true —
        // navigating here too caused a double-navigation race (insertBefore crash).
      } else {
        const errorData = await response.json().catch(() => ({ message: undefined }));
        setError(errorData?.message || t('auth.loginError'));
      }
    } catch {
      setError(t('auth.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_hsl(221_70%_95%),_hsl(var(--background))_60%)] px-4 dark:bg-[radial-gradient(ellipse_at_top,_hsl(222_45%_14%),_hsl(var(--background))_60%)]">
      <div className="absolute end-6 top-6 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{t('auth.welcomeBack')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('auth.signInToContinue')}</p>
          </div>
        </div>

        <Card className="border-border/60 shadow-xl shadow-black/5">
          <CardHeader className="sr-only">
            <h2>{t('auth.signIn')}</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSignIn} className="space-y-4">
              {error && (
                <div className="animate-fade-in rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="pe-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 end-0 flex w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} />
                  <span>{t('auth.rememberMe')}</span>
                </label>
                <a href="/forgetpass" className="text-sm font-medium text-primary hover:underline">
                  {t('auth.forgotPassword')}
                </a>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                {loading ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
