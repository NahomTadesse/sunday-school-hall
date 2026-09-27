'use client';

import { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { CalendarDays, LayoutList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SkeletonRows } from '@/components/ui/skeleton-row';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonthCalendar, type CalendarEvent } from '@/components/shared/MonthCalendar';
import { useLanguage } from '@/contexts/LanguageContext';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

interface ScheduleItem {
  id: string;
  hall: { name: string };
  startTime: string;
  endTime: string;
  purpose: string;
  requirements: string[];
  status: string;
}

const statusVariant: Record<string, 'default' | 'success' | 'destructive' | 'secondary' | 'warning'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  REJECTED: 'destructive',
  CANCELLED: 'secondary',
};

export default function ScheduleCalendarPage() {
  const { t, locale } = useLanguage();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      const userDataString = Cookies.get('userData');
      const userData = userDataString ? JSON.parse(userDataString) : null;
      try {
        const response = await fetch(`${API_BASE}/scheduler`, {
          headers: { accept: '*/*', Authorization: `Bearer ${userData?.access_token}` },
        });
        if (response.status === 401 || response.status === 403) {
          window.location.href = '/login';
          return;
        }
        const result = await response.json();
        setSchedules(result?.data || []);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const events: CalendarEvent[] = useMemo(
    () =>
      schedules.map((s) => ({
        id: s.id,
        title: s.purpose || s.hall?.name || 'Schedule',
        subtitle: s.hall?.name,
        start: new Date(s.startTime),
        end: new Date(s.endTime),
        status: s.status,
      })),
    [schedules]
  );

  const weekdayLabels =
    locale === 'am'
      ? ['እሁድ', 'ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          {t('nav.scheduleCalendar')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calendar">
          <TabsList>
            <TabsTrigger value="calendar" className="gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {t('calendar.calendarView')}
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-1.5">
              <LayoutList className="h-3.5 w-3.5" />
              {t('calendar.listView')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            {loading ? (
              <SkeletonRows rows={6} cols={7} />
            ) : (
              <MonthCalendar
                events={events}
                weekdayLabels={weekdayLabels}
                todayLabel={t('calendar.today')}
                noEventsLabel={t('calendar.noEvents')}
                eventsOnLabel={t('calendar.eventsOn')}
              />
            )}
          </TabsContent>

          <TabsContent value="list">
            {loading ? (
              <SkeletonRows rows={5} cols={5} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hall</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Requirements</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.length > 0 ? (
                    schedules.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.hall?.name}</TableCell>
                        <TableCell>{s.purpose}</TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {new Date(s.startTime).toLocaleString()}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {new Date(s.endTime).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{s.requirements?.join(', ') || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[s.status] || 'secondary'}>{s.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        {t('common.nothingFound')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
