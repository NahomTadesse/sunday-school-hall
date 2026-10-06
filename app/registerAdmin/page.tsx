'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

export default function AdminRegistrationPage() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !lastName || !username || !email || !password || !phone) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: name,
          lastName,
          userName: username,
          email,
          phoneNumber: phone,
          role: 'ADMIN',
          status: 'ACTIVE',
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        toast.success(data?.message || 'Admin registered successfully.');
        setName('');
        setLastName('');
        setUsername('');
        setEmail('');
        setPassword('');
        setPhone('');
      } else {
        toast.error(data?.message || 'Registration failed.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields: { id: string; label: string; value: string; setter: (v: string) => void; type?: string }[] = [
    { id: 'firstName', label: 'First Name', value: name, setter: setName },
    { id: 'lastName', label: 'Last Name', value: lastName, setter: setLastName },
    { id: 'username', label: 'Username', value: username, setter: setUsername },
    { id: 'email', label: 'Email', value: email, setter: setEmail, type: 'email' },
    { id: 'password', label: 'Password', value: password, setter: setPassword, type: 'password' },
    { id: 'phone', label: 'Phone Number', value: phone, setter: setPhone },
  ];

  return (
    <Card className="mx-auto max-w-2xl animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Admin Registration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input
                  id={field.id}
                  type={field.type || 'text'}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  required
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={loading}>
              Register
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
