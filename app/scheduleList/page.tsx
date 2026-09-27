'use client';

import { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { ArrowUpDown, CalendarClock, CalendarDays, Download, MoreVertical, AlertCircle, LayoutList, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SkeletonRows } from '@/components/ui/skeleton-row';
import { Select, type SelectOption } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FacilitiesPicker } from '@/components/shared/FacilitiesPicker';
import { MonthCalendar, type CalendarEvent } from '@/components/shared/MonthCalendar';
import { useLanguage } from '@/contexts/LanguageContext';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

interface Hall {
  id: string;
  name: string;
}

interface Schedule {
  id: string;
  startTime: string;
  endTime: string;
  purpose: string;
  requirements: string[];
  hall: { name: string };
  status: string;
}

const UNEXPECTED_REQUIREMENT_OPTIONS = ['Projector', 'Microphone', 'Whiteboard', 'Chairs', 'Tables'].map((v) => ({
  value: v,
  label: v,
}));

function getAuthHeader() {
  const userDataString = Cookies.get('userData');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  return { Authorization: `Bearer ${userData?.access_token}` };
}

export default function ScheduleListPage() {
  const { t, locale } = useLanguage();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHallId, setSelectedHallId] = useState('');
  const [scheduleData, setScheduleData] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [reversed, setReversed] = useState(false);

  const [postponeOpen, setPostponeOpen] = useState(false);
  const [unexpectedOpen, setUnexpectedOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [unexpectedStartTime, setUnexpectedStartTime] = useState('');
  const [unexpectedEndTime, setUnexpectedEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);

  const fetchAllSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/scheduler`, { headers: getAuthHeader() });
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login';
        return;
      }
      const data = await response.json();
      setScheduleData(Array.isArray(data) ? data : data.schedules || data.data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setScheduleData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await fetch(`${API_BASE}/hall`, { headers: getAuthHeader() });
        if (response.status === 401 || response.status === 403) {
          window.location.href = '/login';
          return;
        }
        setHalls(await response.json());
      } catch (error) {
        console.error('Error fetching halls:', error);
      }
    };
    fetchHalls();
    fetchAllSchedules();
  }, []);

  useEffect(() => {
    if (!selectedHallId) return;
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/scheduler/${selectedHallId}`, { headers: getAuthHeader() });
        if (response.status === 401 || response.status === 403) {
          window.location.href = '/login';
          return;
        }
        setScheduleData(await response.json());
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [selectedHallId]);

  const rows = useMemo(() => {
    const query = search.toLowerCase();
    let filtered = scheduleData.filter((row) =>
      [row.startTime, row.endTime, row.purpose, row.requirements?.join(', '), row.hall?.name, row.status]
        .filter(Boolean)
        .some((v) => v!.toString().toLowerCase().includes(query))
    );
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const av = sortBy === 'hall.name' ? a.hall?.name : (a as any)[sortBy];
        const bv = sortBy === 'hall.name' ? b.hall?.name : (b as any)[sortBy];
        const cmp = String(av ?? '').localeCompare(String(bv ?? ''));
        return reversed ? -cmp : cmp;
      });
    }
    return filtered;
  }, [scheduleData, search, sortBy, reversed]);

  const setSorting = (field: string) => {
    setReversed(field === sortBy ? !reversed : false);
    setSortBy(field);
  };

  const handlePostpone = async () => {
    if (!newStartTime || !newEndTime || !selectedScheduleId) return;
    try {
      const response = await fetch(`${API_BASE}/scheduler/postpone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          newStartTime: new Date(newStartTime).toISOString(),
          newEndTime: new Date(newEndTime).toISOString(),
          scheduleId: selectedScheduleId,
        }),
      });
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login';
        return;
      }
      if (response.ok) {
        toast.success('Schedule postponed successfully!');
        setPostponeOpen(false);
        fetchAllSchedules();
      } else {
        toast.error('Failed to postpone schedule.');
      }
    } catch (error) {
      console.error('Error postponing schedule:', error);
    }
  };

  const handleUnexpected = async () => {
    if (!unexpectedStartTime || !unexpectedEndTime || !purpose) return;
    try {
      const response = await fetch(`${API_BASE}/scheduler/unexpected`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          startTime: new Date(unexpectedStartTime).toISOString(),
          endTime: new Date(unexpectedEndTime).toISOString(),
          purpose,
          requirements,
          hallId: selectedHallId,
        }),
      });
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login';
        return;
      }
      if (response.ok) {
        toast.success('Unexpected schedule created successfully!');
        setUnexpectedOpen(false);
        fetchAllSchedules();
      } else {
        toast.error('Failed to create unexpected schedule.');
      }
    } catch (error) {
      console.error('Error creating unexpected schedule:', error);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Start Time', 'End Time', 'Purpose', 'Requirements', 'Hall Name', 'Status']],
      body: rows.map((row) => [row.startTime, row.endTime, row.purpose, row.requirements?.join(', '), row.hall?.name, row.status]),
    });
    doc.save('schedules.pdf');
  };

  const hallOptions: SelectOption[] = halls.map((h) => ({ value: h.id, label: h.name }));
  const columns = [
    { key: 'startTime', label: 'Start Time' },
    { key: 'endTime', label: 'End Time' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'requirements', label: 'Requirements' },
    { key: 'hall.name', label: 'Hall Name' },
    { key: 'status', label: 'Status' },
  ];

  const calendarEvents: CalendarEvent[] = rows
    .filter((row) => row.startTime && row.endTime)
    .map((row) => ({
      id: row.id,
      title: row.purpose || row.hall?.name || 'Schedule',
      subtitle: row.hall?.name,
      start: new Date(row.startTime),
      end: new Date(row.endTime),
      status: row.status,
    }));

  const weekdayLabels =
    locale === 'am'
      ? ['እሁድ', 'ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <Card className="animate-fade-in-up">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Schedule List
          </CardTitle>
          <Button variant="outline" size="sm" onClick={downloadPDF} className="gap-1.5">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by any field"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-9"
              />
            </div>
            <div className="w-56">
              <Select options={hallOptions} placeholder="Choose a hall" value={selectedHallId} onValueChange={setSelectedHallId} />
            </div>
          </div>

          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list" className="gap-1.5">
                <LayoutList className="h-3.5 w-3.5" />
                {t('calendar.listView')}
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {t('calendar.calendarView')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              {loading ? (
                <SkeletonRows rows={5} cols={7} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead key={col.key}>
                          <button onClick={() => setSorting(col.key)} className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
                            {col.label} <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </TableHead>
                      ))}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length > 0 ? (
                      rows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.startTime}</TableCell>
                          <TableCell>{row.endTime}</TableCell>
                          <TableCell>{row.purpose}</TableCell>
                          <TableCell className="text-muted-foreground">{row.requirements?.join(', ')}</TableCell>
                          <TableCell>{row.hall?.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{row.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedScheduleId(row.id);
                                    setPostponeOpen(true);
                                  }}
                                >
                                  <CalendarDays className="me-2 h-4 w-4" />
                                  Postpone
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setUnexpectedOpen(true)}>
                                  <AlertCircle className="me-2 h-4 w-4" />
                                  Unexpected
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                          Nothing found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="calendar">
              {loading ? (
                <SkeletonRows rows={6} cols={7} />
              ) : (
                <MonthCalendar
                  events={calendarEvents}
                  weekdayLabels={weekdayLabels}
                  todayLabel={t('calendar.today')}
                  noEventsLabel={t('calendar.noEvents')}
                  eventsOnLabel={t('calendar.eventsOn')}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={postponeOpen} onOpenChange={setPostponeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Postpone Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>New Start Time</Label>
              <Input type="datetime-local" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>New End Time</Label>
              <Input type="datetime-local" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} required />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePostpone}>Postpone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={unexpectedOpen} onOpenChange={setUnexpectedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Unexpected Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Start Time</Label>
              <Input type="datetime-local" value={unexpectedStartTime} onChange={(e) => setUnexpectedStartTime(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>End Time</Label>
              <Input type="datetime-local" value={unexpectedEndTime} onChange={(e) => setUnexpectedEndTime(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Purpose</Label>
              <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Requirements</Label>
              <FacilitiesPicker options={UNEXPECTED_REQUIREMENT_OPTIONS} value={requirements} onChange={setRequirements} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUnexpected}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}