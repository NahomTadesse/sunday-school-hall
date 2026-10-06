'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CalendarEvent {
  id: string;
  title: string;
  subtitle?: string;
  start: Date;
  end: Date;
  status?: string;
}

const statusDot: Record<string, string> = {
  PENDING: 'bg-amber-500',
  CONFIRMED: 'bg-emerald-500',
  REJECTED: 'bg-red-500',
  CANCELLED: 'bg-muted-foreground',
};

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function eventCoversDay(event: CalendarEvent, day: Date) {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
  return event.start <= dayEnd && event.end >= dayStart;
}

export function MonthCalendar({
  events,
  weekdayLabels,
  todayLabel,
  noEventsLabel,
  eventsOnLabel,
}: {
  events: CalendarEvent[];
  weekdayLabels?: string[];
  todayLabel?: string;
  noEventsLabel?: string;
  eventsOnLabel?: string;
}) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<Date>(today);

  const weekdays = weekdayLabels ?? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const days = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay();
    const gridStart = new Date(year, month, 1 - startOffset);

    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
      return date;
    });
  }, [cursor]);

  const eventsForSelected = events.filter((e) => eventCoversDay(e, selectedDay));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date();
              setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
              setSelectedDay(now);
            }}
          >
            {todayLabel ?? 'Today'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border text-center text-xs font-medium text-muted-foreground">
        {weekdays.map((d) => (
          <div key={d} className="bg-muted/50 py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border">
        {days.map((day, i) => {
          const inMonth = day.getMonth() === cursor.getMonth();
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDay);
          const dayEvents = events.filter((e) => eventCoversDay(e, day));

          return (
            <button
              key={i}
              onClick={() => setSelectedDay(day)}
              className={cn(
                'flex min-h-[76px] flex-col items-start gap-1 bg-background p-1.5 text-start transition-colors hover:bg-accent/60 sm:min-h-[92px] sm:p-2',
                !inMonth && 'bg-muted/30 text-muted-foreground/50',
                isSelected && 'ring-2 ring-inset ring-primary'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                  isToday && 'bg-primary text-primary-foreground font-semibold'
                )}
              >
                {day.getDate()}
              </span>
              <div className="flex w-full flex-1 flex-col gap-0.5 overflow-hidden">
                {dayEvents.slice(0, 2).map((e) => (
                  <span
                    key={e.id}
                    className="flex items-center gap-1 truncate rounded bg-accent px-1 py-0.5 text-[10px] text-accent-foreground"
                  >
                    <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', statusDot[e.status || ''] || 'bg-primary')} />
                    <span className="truncate">{e.title}</span>
                  </span>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="mb-3 text-sm font-semibold">
          {eventsOnLabel ?? 'Schedules on'}{' '}
          {selectedDay.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </h4>
        {eventsForSelected.length > 0 ? (
          <ul className="space-y-2">
            {eventsForSelected.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 rounded-md border p-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{e.title}</p>
                  {e.subtitle && <p className="truncate text-xs text-muted-foreground">{e.subtitle}</p>}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {e.start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} –{' '}
                    {e.end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {e.status && <Badge variant="secondary">{e.status}</Badge>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{noEventsLabel ?? 'No schedules this day'}</p>
        )}
      </div>
    </div>
  );
}
