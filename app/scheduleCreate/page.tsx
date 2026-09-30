'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, type SelectOption } from '@/components/ui/select';
import { FacilitiesPicker } from '@/components/shared/FacilitiesPicker';
import { handleUnauthorized } from '@/lib/api';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

interface Hall {
  id: string;
  name: string;
}

const RECURRENCE_OPTIONS: SelectOption[] = [
  { value: 'NONE', label: 'Does not repeat' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Mon' },
  { value: 'TUESDAY', label: 'Tue' },
  { value: 'WEDNESDAY', label: 'Wed' },
  { value: 'THURSDAY', label: 'Thu' },
  { value: 'FRIDAY', label: 'Fri' },
  { value: 'SATURDAY', label: 'Sat' },
  { value: 'SUNDAY', label: 'Sun' },
];

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
  const [recurrenceType, setRecurrenceType] = useState('NONE');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const isRecurring = recurrenceType !== 'NONE';

  useEffect(() => {
    const fetchHalls = async () => {
      const userDataString = Cookies.get('userData');
      const userData = userDataString ? JSON.parse(userDataString) : null;
      try {
        const response = await fetch(`${API_BASE}/hall`, {
          headers: { Authorization: `Bearer ${userData?.access_token}` },
        });
        if (response.status === 401 || response.status === 403) {
          handleUnauthorized();
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

    if (isRecurring) {
      if (!recurrenceEndDate) {
        toast.error('Please choose when the recurrence ends.');
        return;
      }
      if (recurrenceType === 'WEEKLY' && daysOfWeek.length === 0) {
        toast.error('Select at least one day of the week.');
        return;
      }
    }

    const userDataString = Cookies.get('userData');
    const userData = userDataString ? JSON.parse(userDataString) : null;

    const base = {
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      purpose,
      requirements,
      hallId,
    };

    setLoading(true);
    try {
      // One-time schedule -> POST /scheduler (array)
      // Recurring schedule -> POST /scheduler/recurring (single object)
      const response = await fetch(`${API_BASE}/scheduler${isRecurring ? '/recurring' : ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userData?.access_token}` },
        body: JSON.stringify(
          isRecurring
            ? {
                ...base,
                recurrenceType,
                recurrenceEndDate: new Date(`${recurrenceEndDate}T23:59:59`).toISOString(),
                daysOfWeek: recurrenceType === 'WEEKLY' ? daysOfWeek : [],
              }
            : [base]
        ),
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
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
        setRecurrenceType('NONE');
        setRecurrenceEndDate('');
        setDaysOfWeek([]);
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

          <div className="space-y-4 rounded-lg border border-border/60 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Repeat</Label>
                <Select options={RECURRENCE_OPTIONS} value={recurrenceType} onValueChange={setRecurrenceType} />
              </div>
              {isRecurring && (
                <div className="space-y-1.5">
                  <Label htmlFor="recurrenceEndDate">Repeat until</Label>
                  <Input
                    id="recurrenceEndDate"
                    type="date"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
            {recurrenceType === 'WEEKLY' && (
              <div className="space-y-1.5">
                <Label>Days of week</Label>
                <FacilitiesPicker options={DAYS_OF_WEEK} value={daysOfWeek} onChange={setDaysOfWeek} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <Link href="/scheduleBulk" className="text-sm font-medium text-primary hover:underline">
              Upload many schedules from Excel
            </Link>
            <Button type="submit" loading={loading}>
              Create Schedule
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
