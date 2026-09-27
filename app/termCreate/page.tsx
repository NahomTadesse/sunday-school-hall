'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { ScrollText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, type SelectOption } from '@/components/ui/select';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

interface Hall {
  id: string;
  name: string;
}

export default function CreateTermPage() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHallId, setSelectedHallId] = useState('');
  const [termText, setTermText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHalls = async () => {
      const userDataString = Cookies.get('userData');
      const userData = userDataString ? JSON.parse(userDataString) : null;
      try {
        const response = await fetch(`${API_BASE}/hall`, {
          headers: { Authorization: `Bearer ${userData?.access_token}` },
        });
        if (response.status === 401 || response.status === 403) {
          window.location.href = '/login';
          return;
        }
        const data = await response.json();
        setHalls(data);
      } catch (error) {
        console.error('Error fetching halls:', error);
      }
    };
    fetchHalls();
  }, []);

  const hallOptions: SelectOption[] = halls.map((h) => ({ value: h.id, label: h.name }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHallId || !termText) {
      toast.error('Please select a hall and enter the term.');
      return;
    }

    const userDataString = Cookies.get('userData');
    const userData = userDataString ? JSON.parse(userDataString) : null;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/terms/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userData?.access_token}` },
        body: JSON.stringify({ hallId: selectedHallId, termText }),
      });

      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login';
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        toast.success(data?.message || 'Term created.');
        setTermText('');
        setSelectedHallId('');
      } else {
        toast.error(data?.message || 'Failed to create term.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-xl animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-primary" />
          Create Term
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Select Hall</Label>
            <Select
              options={hallOptions}
              placeholder="Choose a hall"
              value={selectedHallId}
              onValueChange={setSelectedHallId}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="termText">Term and Condition</Label>
            <Textarea
              id="termText"
              placeholder="Enter the term text"
              rows={5}
              value={termText}
              onChange={(e) => setTermText(e.target.value)}
              required
            />
          </div>
          <Button type="submit" loading={loading}>
            Create Term
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
