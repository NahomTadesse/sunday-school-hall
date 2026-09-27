'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, type SelectOption } from '@/components/ui/select';
import { FacilitiesPicker } from '@/components/shared/FacilitiesPicker';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

interface Hall {
  id: string;
  name: string;
}

const REQUIREMENT_OPTIONS = [
  { value: 'Tv', label: 'TV' },
  { value: 'Projector', label: 'Projector' },
];

export default function ScheduleCreatePage() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [hallId, setHallId] = useState('');
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

    if (!startTime || !endTime || !purpose || !hallId) {
      toast.error('Please fill in all fields.');
      return;
    }

    const userDataString = Cookies.get('userData');
    const userData = userDataString ? JSON.parse(userDataString) : null;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/scheduler`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userData?.access_token}` },
        body: JSON.stringify([
          {
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            purpose,
            requirements,
            hallId,
          },
        ]),
      });

      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login';
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        toast.success(data?.message || 'Schedule created.');
        setStartTime('');
        setEndTime('');
        setPurpose('');
        setRequirements([]);
        setHallId('');
      } else {
        toast.error(data?.message || 'Failed to create schedule.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-2xl animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          Create Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              placeholder="Enter the purpose of the booking"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Requirements</Label>
            <FacilitiesPicker options={REQUIREMENT_OPTIONS} value={requirements} onChange={setRequirements} />
          </div>

          <div className="max-w-xs space-y-1.5">
            <Label>Select Hall</Label>
            <Select options={hallOptions} placeholder="Choose a hall" value={hallId} onValueChange={setHallId} required />
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={loading}>
              Create Schedule
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
