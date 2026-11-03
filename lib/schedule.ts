/**
 * Shared helpers for the schedule API.
 *
 * The backend now splits every schedule into
 *   startDate / endDate  ("YYYY-MM-DD")
 *   startTime / endTime  (LocalTime)
 * instead of a single start/end date-time.
 *
 * Java's LocalTime can arrive as "09:00:00", as [9, 0] / [9, 0, 0] (Jackson timestamps) or as the
 * { hour, minute, second, nano } object that Swagger documents - parseApiTime() accepts all three.
 */

export interface ApiLocalTime {
  hour: number;
  minute: number;
  second?: number;
  nano?: number;
}

export type ApiTime = string | number[] | ApiLocalTime | null | undefined;

export interface ScheduleItem {
  id: string;
  hall?: { id?: string; name: string };
  startDate?: string | number[];
  endDate?: string | number[];
  startTime?: ApiTime;
  endTime?: ApiTime;
  purpose: string;
  confirmed?: boolean;
  requirements: string[];
  status: string;
  recurrenceType?: string;
  recurrenceEndDate?: string;
  recurrenceGroupId?: string;
  /** Only sent by the create/bulk request; kept optional in case the API echoes it back. */
  spanMode?: string;
}

/** Body of POST /scheduler/unexpected, /scheduler/recurring and every item of /scheduler/bulk. */
export interface ScheduleRequestPayload {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  requirements: string[];
  hallId: string;
  recurrenceType?: string;
  recurrenceEndDate?: string;
  daysOfWeek?: string[];
  spanMode?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

export interface HM {
  h: number;
  m: number;
}

/** Accepts "09:00", "09:00:00", "2026-10-05T09:00:00", [9, 0], { hour: 9, minute: 0 }. */
export function parseApiTime(v: ApiTime): HM | null {
  if (v === null || v === undefined || v === '') return null;
  if (Array.isArray(v)) {
    if (v.length < 2) return null;
    return { h: Number(v[0]), m: Number(v[1]) };
  }
  if (typeof v === 'object') {
    if (typeof v.hour !== 'number') return null;
    return { h: v.hour, m: Number(v.minute ?? 0) };
  }
  const match = String(v).match(/(?:^|T|\s)(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return { h: +match[1], m: +match[2] };
}

/** Accepts "2026-10-05", "2026-10-05T00:00:00Z" or [2026, 10, 5]. */
export function parseApiDate(v: string | number[] | null | undefined): { y: number; mo: number; d: number } | null {
  if (v === null || v === undefined || v === '') return null;
  if (Array.isArray(v)) {
    if (v.length < 3) return null;
    return { y: +v[0], mo: +v[1], d: +v[2] };
  }
  const match = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return { y: +match[1], mo: +match[2], d: +match[3] };
}

/** "09:00" for display. */
export function formatApiTime(v: ApiTime): string {
  const t = parseApiTime(v);
  return t ? `${pad(t.h)}:${pad(t.m)}` : '';
}

/** "2026-10-05" for display. */
export function formatApiDate(v: string | number[] | null | undefined): string {
  const d = parseApiDate(v);
  return d ? `${d.y}-${pad(d.mo)}-${pad(d.d)}` : '';
}

function combine(dateV: ScheduleItem['startDate'], timeV: ApiTime): Date | null {
  const d = parseApiDate(dateV);
  if (!d) return null;
  const t = parseApiTime(timeV) ?? { h: 0, m: 0 };
  const date = new Date(d.y, d.mo - 1, d.d, t.h, t.m, 0, 0);
  return isNaN(date.getTime()) ? null : date;
}

/** Start as a local Date (startDate + startTime). Falls back to the old single date-time string. */
export function getStart(s: ScheduleItem): Date | null {
  const c = combine(s.startDate, s.startTime);
  if (c) return c;
  if (typeof s.startTime === 'string' && s.startTime.includes('T')) {
    const legacy = new Date(s.startTime);
    return isNaN(legacy.getTime()) ? null : legacy;
  }
  return null;
}

/** End as a local Date (endDate + endTime). Falls back to the old single date-time string. */
export function getEnd(s: ScheduleItem): Date | null {
  const c = combine(s.endDate ?? s.startDate, s.endTime);
  if (c) return c;
  if (typeof s.endTime === 'string' && s.endTime.includes('T')) {
    const legacy = new Date(s.endTime);
    return isNaN(legacy.getTime()) ? null : legacy;
  }
  return null;
}

/** "2026-10-05 09:00" */
export function fmtDateTime(d: Date | null): string {
  if (!d) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "09:00" / "09:00:30" (from <input type="time">) -> "09:00:00" for the LocalTime fields. */
export function toApiTime(hhmm: string): string {
  const m = hhmm.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return hhmm;
  return `${pad(+m[1])}:${m[2]}:00`;
}

/** Local Date -> value for <input type="datetime-local">. */
export function toDateTimeLocalValue(d: Date | null): string {
  if (!d) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Date + time input values -> Date, or null when either is empty/invalid. */
export function dateFromInputs(date: string, time: string): Date | null {
  if (!date || !time) return null;
  const d = parseApiDate(date);
  const t = parseApiTime(time);
  if (!d || !t) return null;
  return new Date(d.y, d.mo - 1, d.d, t.h, t.m, 0, 0);
}

/**
 * Shared validation for the create form, the "unexpected" dialog and the bulk upload.
 * Returns an error message, or null when the range is fine.
 *  - DAILY_WINDOW: the dates give the range, the times give the daily window (end time after start time).
 *  - everything else: end date + end time must be after start date + start time.
 */
export function validateRange(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
  dailyWindow = false
): string | null {
  const start = dateFromInputs(startDate, startTime);
  const end = dateFromInputs(endDate, endTime);
  if (!start) return 'Please enter a valid start date and time.';
  if (!end) return 'Please enter a valid end date and time.';
  if (dailyWindow) {
    if (endDate < startDate) return 'End date must not be before the start date.';
    if (parseApiTime(endTime)!.h * 60 + parseApiTime(endTime)!.m <= parseApiTime(startTime)!.h * 60 + parseApiTime(startTime)!.m)
      return 'End time must be after the start time.';
    return null;
  }
  if (end <= start) return 'End must be after the start.';
  return null;
}
