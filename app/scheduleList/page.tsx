'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { ArrowUpDown, CalendarClock, CalendarDays, Download, MoreVertical, AlertCircle, Eye, Pencil, RefreshCw, LayoutList, Search } from 'lucide-react';
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
import { handleUnauthorized } from '@/lib/api';
import {
  fmtDateTime,
  fmtDateTimeNice,
  formatApiDate,
  formatApiTime,
  getEnd,
  getStart,
  toApiTime,
  toDateTimeLocalValue,
  validateRange,
  type ScheduleItem,
} from '@/lib/schedule';

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="col-span-2 break-words font-medium">{children ?? '—'}</dd>
    </div>
  );
}

const fmtStamp = (v?: string) => {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : fmtDateTime(d);
};

const yesNo = (v?: boolean) => (v === undefined || v === null ? '—' : v ? 'Yes' : 'No');

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

interface Hall {
  id: string;
  name: string;
}

const UNEXPECTED_REQUIREMENT_OPTIONS = ['Projector', 'Microphone', 'Whiteboard', 'Chairs', 'Tables'].map((v) => ({
  value: v,
  label: v,
}));

// TODO: adjust to the statuses / endpoint your backend really uses.
const SCHEDULE_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
const statusUrl = (id: string) => `${API_BASE}/scheduler/${id}/status`;

function getAuthHeader() {
  const userDataString = Cookies.get('userData');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  return { Authorization: `Bearer ${userData?.access_token}` };
}

export default function ScheduleListPage() {
  const { t, locale } = useLanguage();
  const intlLocale = locale === 'am' ? 'am-ET' : 'en-US';
  const niceDate = (d: Date | null) => fmtDateTimeNice(d, intlLocale);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHallId, setSelectedHallId] = useState('');
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [reversed, setReversed] = useState(false);

  const [detailsRow, setDetailsRow] = useState<ScheduleItem | null>(null);
  const [editRow, setEditRow] = useState<ScheduleItem | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editStartDate, setEditStartDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editPurpose, setEditPurpose] = useState('');
  const [editRequirements, setEditRequirements] = useState<string[]>([]);
  const [editHallId, setEditHallId] = useState('');
  const [statusRow, setStatusRow] = useState<ScheduleItem | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);
  const [postponeOpen, setPostponeOpen] = useState(false);
  const [unexpectedOpen, setUnexpectedOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [unexpectedStartDate, setUnexpectedStartDate] = useState('');
  const [unexpectedStartTime, setUnexpectedStartTime] = useState('');
  const [unexpectedEndDate, setUnexpectedEndDate] = useState('');
  const [unexpectedEndTime, setUnexpectedEndTime] = useState('');
  const [unexpectedHallId, setUnexpectedHallId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);

  const fetchAllSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/scheduler`, { headers: getAuthHeader() });
      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
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
          handleUnauthorized();
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
          handleUnauthorized();
          return;
        }
        const data = await response.json();
        setScheduleData(Array.isArray(data) ? data : data?.data || []);
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
      [
        fmtDateTime(getStart(row)),
        fmtDateTime(getEnd(row)),
        row.purpose,
        row.requirements?.join(', '),
        row.hall?.name,
        row.status,
      ]
        .filter(Boolean)
        .some((v) => v!.toString().toLowerCase().includes(query))
    );
    if (sortBy) {
      const sortValue = (r: ScheduleItem): string | number => {
        if (sortBy === 'startTime') return getStart(r)?.getTime() ?? 0;
        if (sortBy === 'endTime') return getEnd(r)?.getTime() ?? 0;
        if (sortBy === 'hall.name') return r.hall?.name ?? '';
        return String((r as any)[sortBy] ?? '');
      };
      filtered = [...filtered].sort((a, b) => {
        const av = sortValue(a);
        const bv = sortValue(b);
        const cmp =
          typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return reversed ? -cmp : cmp;
      });
    }
    return filtered;
  }, [scheduleData, search, sortBy, reversed]);

  const setSorting = (field: string) => {
    setReversed(field === sortBy ? !reversed : false);
    setSortBy(field);
  };

  const openEdit = (row: ScheduleItem) => {
    setEditRow(row);
    setEditStartDate(formatApiDate(row.startDate));
    setEditStartTime(formatApiTime(row.startTime));
    setEditEndDate(formatApiDate(row.endDate));
    setEditEndTime(formatApiTime(row.endTime));
    setEditPurpose(row.purpose ?? '');
    setEditRequirements(row.requirements ?? []);
    setEditHallId(row.hall?.id ?? '');
  };

  const handleUpdate = async () => {
    if (!editRow) return;
    if (!editStartDate || !editStartTime || !editPurpose || !editHallId) {
      toast.error('Please fill in all required fields.');
      return;
    }
    // if (!!editEndDate !== !!editEndTime) {
    //   toast.error('Fill in both the end date and the end time, or leave both empty.');
    //   return;
    // }
    const hasEnd = !!editEndDate && !!editEndTime;
    if (hasEnd) {
      const rangeError = validateRange(editStartDate, editStartTime, editEndDate, editEndTime);
      if (rangeError) {
        toast.error(rangeError);
        return;
      }
    }
    setEditSaving(true);
    try {
      const response = await fetch(`${API_BASE}/scheduler/${editRow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          startDate: editStartDate,
          startTime: toApiTime(editStartTime),
          ...(hasEnd ? { endDate: editEndDate, endTime: toApiTime(editEndTime) } : {}),
          purpose: editPurpose,
          requirements: editRequirements,
          hallId: editHallId,
        }),
      });
      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }
      const data = await response.json().catch(() => ({}));
      if (response.ok && data?.success !== false) {
        toast.success(data?.message || 'Schedule updated successfully!');
        setEditRow(null);
        fetchAllSchedules();
      } else {
        toast.error(data?.message || 'Failed to update schedule.');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!statusRow || !newStatus) {
      toast.error('Please choose a new status.');
      return;
    }
    setStatusSaving(true);
    try {
      const response = await fetch(statusUrl(statusRow.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }
      const data = await response.json().catch(() => ({}));
      if (response.ok && data?.success !== false) {
        toast.success(data?.message || 'Status updated successfully!');
        setStatusRow(null);
        fetchAllSchedules();
      } else {
        toast.error(data?.message || 'Failed to update status.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setStatusSaving(false);
    }
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
        handleUnauthorized();
        return;
      }
      const data = await response.json().catch(() => ({}));
      if (response.ok && data?.success !== false) {
        toast.success(data?.message || 'Schedule postponed successfully!');
        setPostponeOpen(false);
        fetchAllSchedules();
      } else {
        toast.error(data?.message || 'Failed to postpone schedule.');
      }
    } catch (error) {
      console.error('Error postponing schedule:', error);
    }
  };

  const handleUnexpected = async () => {
    if (!unexpectedStartDate || !unexpectedStartTime || !unexpectedEndDate || !unexpectedEndTime || !purpose) {
      toast.error('Please fill in all fields.');
      return;
    }
    const hallId = unexpectedHallId || selectedHallId;
    if (!hallId) {
      toast.error('Choose a hall first.');
      return;
    }
    const rangeError = validateRange(unexpectedStartDate, unexpectedStartTime, unexpectedEndDate, unexpectedEndTime);
    if (rangeError) {
      toast.error(rangeError);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/scheduler/unexpected`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          startDate: unexpectedStartDate,
          endDate: unexpectedEndDate,
          startTime: toApiTime(unexpectedStartTime),
          endTime: toApiTime(unexpectedEndTime),
          purpose,
          requirements,
          hallId,
        }),
      });
      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }
      const data = await response.json().catch(() => ({}));
      if (response.ok && data?.success !== false) {
        toast.success(data?.message || 'Unexpected schedule created successfully!');
        setUnexpectedOpen(false);
        setUnexpectedStartDate('');
        setUnexpectedStartTime('');
        setUnexpectedEndDate('');
        setUnexpectedEndTime('');
        setPurpose('');
        setRequirements([]);
        fetchAllSchedules();
      } else {
        toast.error(data?.message || 'Failed to create unexpected schedule.');
      }
    } catch (error) {
      console.error('Error creating unexpected schedule:', error);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Start', 'End', 'Purpose', 'Requirements', 'Hall Name', 'Status', 'Repeat', 'Span Mode']],
      body: rows.map((row) => [niceDate(getStart(row)), niceDate(getEnd(row)), row.purpose, row.requirements?.join(', '), row.hall?.name, row.status, row.recurrenceType && row.recurrenceType !== 'NONE' ? row.recurrenceType : '', row.spanMode ?? '']),
    });
    doc.save('schedules.pdf');
  };

  const hallOptions: SelectOption[] = halls.map((h) => ({ value: h.id, label: h.name }));
  const columns = [
    { key: 'startTime', label: 'Start' },
    { key: 'endTime', label: 'End' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'requirements', label: 'Requirements' },
    { key: 'hall.name', label: 'Hall Name' },
    { key: 'status', label: 'Status' },
    { key: 'recurrenceType', label: 'Repeat' },
  ];

  const calendarEvents: CalendarEvent[] = rows.flatMap((row) => {
    const start = getStart(row);
    const end = getEnd(row);
    if (!start || !end) return [];
    return [
      {
        id: row.id,
        title: row.purpose || row.hall?.name || 'Schedule',
        subtitle: row.hall?.name,
        start,
        end,
        status: row.status,
        spanMode: row.spanMode,
        recurrenceType: row.recurrenceType,
      },
    ];
  });

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
                <SkeletonRows rows={5} cols={8} />
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
                          <TableCell className="whitespace-nowrap text-sm">{niceDate(getStart(row)) || '—'}</TableCell>
                          <TableCell className="whitespace-nowrap text-sm">{niceDate(getEnd(row)) || '—'}</TableCell>
                          <TableCell>{row.purpose}</TableCell>
                          <TableCell className="text-muted-foreground">{row.requirements?.join(', ')}</TableCell>
                          <TableCell>{row.hall?.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{row.status}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            {row.recurrenceType && row.recurrenceType !== 'NONE' ? (
                              <span className="flex flex-col">
                                <span>{row.recurrenceType}</span>
                                {row.spanMode && <span className="text-xs text-muted-foreground">{row.spanMode}</span>}
                              </span>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setDetailsRow(row)}>
                                  <Eye className="me-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEdit(row)}>
                                  <Pencil className="me-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setStatusRow(row);
                                    setNewStatus('');
                                  }}
                                >
                                  <RefreshCw className="me-2 h-4 w-4" />
                                  Change Status
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedScheduleId(row.id);
                                    setNewStartTime(toDateTimeLocalValue(getStart(row)));
                                    setNewEndTime(toDateTimeLocalValue(getEnd(row)));
                                    setPostponeOpen(true);
                                  }}
                                >
                                  <CalendarDays className="me-2 h-4 w-4" />
                                  Postpone
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setUnexpectedHallId(row.hall?.id ?? '');
                                    setUnexpectedOpen(true);
                                  }}
                                >
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
                        <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
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
                  allDayLabel={t('calendar.allDay')}
                  continuousLabel={t('calendar.continuous')}
                  dailyWindowLabel={t('calendar.dailyWindow')}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!detailsRow} onOpenChange={(open) => !open && setDetailsRow(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Details</DialogTitle>
          </DialogHeader>
          {detailsRow && (
            <div className="space-y-5">
              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Schedule</h3>
                <dl className="divide-y">
                  <DetailRow label="Purpose">{detailsRow.purpose}</DetailRow>
                  <DetailRow label="Status">
                    <Badge variant="secondary">{detailsRow.status}</Badge>
                  </DetailRow>
                  <DetailRow label="Confirmed">{yesNo(detailsRow.confirmed)}</DetailRow>
                  <DetailRow label="Requirements">
                    {detailsRow.requirements?.length ? (
                      <span className="flex flex-wrap gap-1">
                        {detailsRow.requirements.map((r) => (
                          <Badge key={r} variant="outline">{r}</Badge>
                        ))}
                      </span>
                    ) : (
                      '—'
                    )}
                  </DetailRow>
                  <DetailRow label="Created at">{fmtStamp(detailsRow.createdAt)}</DetailRow>
                  <DetailRow label="Schedule ID">{detailsRow.id}</DetailRow>
                  <DetailRow label="Key">{detailsRow.key}</DetailRow>
                </dl>
              </section>

              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Date &amp; Time</h3>
                <dl className="divide-y">
                  <DetailRow label="Start">{niceDate(getStart(detailsRow)) || '—'}</DetailRow>
                  <DetailRow label="End">{niceDate(getEnd(detailsRow)) || '—'}</DetailRow>
                  <DetailRow label="Next occurrence">{formatApiDate(detailsRow.nextOccurrence) || '—'}</DetailRow>
                  <DetailRow label="Ongoing">{yesNo(detailsRow.ongoing)}</DetailRow>
                </dl>
              </section>

              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Recurrence</h3>
                <dl className="divide-y">
                  <DetailRow label="Repeat">{detailsRow.recurrenceType || 'NONE'}</DetailRow>
                  <DetailRow label="Single occurrence">{yesNo(detailsRow.singleOccurrence)}</DetailRow>
                  <DetailRow label="Occurrences">{detailsRow.occurrences}</DetailRow>
                  <DetailRow label="Upcoming">{detailsRow.upcoming}</DetailRow>
                  <DetailRow label="Weeks">{detailsRow.weeks}</DetailRow>
                  <DetailRow label="Recurrence group ID">{detailsRow.recurrenceGroupId || '—'}</DetailRow>
                </dl>
              </section>

              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Hall</h3>
                <dl className="divide-y">
                  <DetailRow label="Name">{detailsRow.hall?.name}</DetailRow>
                  <DetailRow label="Capacity">{detailsRow.hall?.capacity}</DetailRow>
                  <DetailRow label="Available">{yesNo(detailsRow.hall?.availability)}</DetailRow>
                  <DetailRow label="Facilities">
                    {detailsRow.hall?.facilities?.length ? (
                      <span className="flex flex-wrap gap-1">
                        {detailsRow.hall.facilities.map((f) => (
                          <Badge key={f} variant="outline">{f}</Badge>
                        ))}
                      </span>
                    ) : (
                      '—'
                    )}
                  </DetailRow>
                  <DetailRow label="Terms">
                    {detailsRow.hall?.terms?.length ? (
                      <ul className="list-disc ps-4">
                        {detailsRow.hall.terms.map((term, i) => (
                          <li key={term.id ?? i}>{term.termsText}</li>
                        ))}
                      </ul>
                    ) : (
                      '—'
                    )}
                  </DetailRow>
                  <DetailRow label="Hall ID">{detailsRow.hall?.id}</DetailRow>
                </dl>
              </section>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsRow(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editRow} onOpenChange={(open) => !open && setEditRow(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Start Time</Label>
                <Input type="time" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>
                  End Date <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  type="date"
                  min={editStartDate || undefined}
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  End Time <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input type="time" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Purpose</Label>
              <Input value={editPurpose} onChange={(e) => setEditPurpose(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Requirements</Label>
              <FacilitiesPicker
                options={Array.from(new Set(['Tv', 'Projector', ...editRequirements])).map((v) => ({
                  value: v,
                  label: v === 'Tv' ? 'TV' : v,
                }))}
                value={editRequirements}
                onChange={setEditRequirements}
              />
            </div>
            <div className="max-w-xs space-y-1.5">
              <Label>Hall</Label>
              <Select
                options={halls.map((h) => ({ value: h.id, label: h.name }))}
                placeholder="Choose a hall"
                value={editHallId}
                onValueChange={setEditHallId}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRow(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} loading={editSaving}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!statusRow} onOpenChange={(open) => !open && setStatusRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
          </DialogHeader>
          {statusRow && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Current status</span>
                <Badge variant="secondary">{statusRow.status}</Badge>
              </div>
              <div className="space-y-1.5">
                <Label>Change to</Label>
                <Select
                  options={SCHEDULE_STATUSES.filter((st) => st !== statusRow.status).map((st) => ({ value: st, label: st }))}
                  placeholder="Select new status"
                  value={newStatus}
                  onValueChange={setNewStatus}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusRow(null)}>
              Cancel
            </Button>
            <Button onClick={handleChangeStatus} loading={statusSaving} disabled={!newStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={unexpectedStartDate}
                  onChange={(e) => {
                    setUnexpectedStartDate(e.target.value);
                    if (!unexpectedEndDate || unexpectedEndDate < e.target.value) setUnexpectedEndDate(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Start Time</Label>
                <Input type="time" value={unexpectedStartTime} onChange={(e) => setUnexpectedStartTime(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input
                  type="date"
                  min={unexpectedStartDate || undefined}
                  value={unexpectedEndDate}
                  onChange={(e) => setUnexpectedEndDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>End Time</Label>
                <Input type="time" value={unexpectedEndTime} onChange={(e) => setUnexpectedEndTime(e.target.value)} required />
              </div>
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