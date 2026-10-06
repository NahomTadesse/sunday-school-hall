'use client';

import { useState } from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="pe-9"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute inset-y-0 end-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  const { t } = useLanguage();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !repeatPassword) {
      toast.error(t('hall.validationRequired'));
      return;
    }
    if (newPassword !== repeatPassword) {
      toast.error('New password and repeat password do not match.');
      return;
    }

    const userDataString = Cookies.get('userData');
    const userData = userDataString ? JSON.parse(userDataString) : null;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/changePassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData?.userId, oldPassword, newPassword }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        toast.success(data?.message || t('common.success'));
        setOldPassword('');
        setNewPassword('');
        setRepeatPassword('');
      } else {
        toast.error(data?.message || t('common.error'));
      }
    } catch {
      toast.error(t('auth.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          {t('nav.changePassword')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField id="oldPassword" label="Old Password" value={oldPassword} onChange={setOldPassword} />
          <PasswordField id="newPassword" label="New Password" value={newPassword} onChange={setNewPassword} />
          <PasswordField
            id="repeatPassword"
            label="Repeat New Password"
            value={repeatPassword}
            onChange={setRepeatPassword}
          />
          <Button type="submit" loading={loading} className="w-full">
            {t('common.save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
