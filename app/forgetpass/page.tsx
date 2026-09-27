'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MailQuestion } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shell/ThemeToggle';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/auth/forgot-password?principal=${encodeURIComponent(email)}`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Failed to send reset link');
      toast.success('Reset link sent! Check your email.');
      setEmail('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_hsl(221_70%_95%),_hsl(var(--background))_60%)] px-4 dark:bg-[radial-gradient(ellipse_at_top,_hsl(222_45%_14%),_hsl(var(--background))_60%)]">
      <div className="absolute end-6 top-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <MailQuestion className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Forgot your password?</h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter your email to get a reset link</p>
          </div>
        </div>

        <Card className="shadow-xl shadow-black/5">
          <CardHeader className="sr-only">
            <h2>Reset password</h2>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-1.5">
              <Label htmlFor="resetEmail">Your email</Label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Cancel
              </button>
              <Button onClick={handleResetPassword} loading={loading}>
                Reset password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
