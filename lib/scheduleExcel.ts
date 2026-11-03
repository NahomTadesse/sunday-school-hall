import * as XLSX from 'xlsx';
import { validateRange, type ScheduleRequestPayload } from '@/lib/schedule';

export const RECURRENCE_TYPES = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const;
export const SPAN_MODES = ['CONTINUOUS', 'DAILY_WINDOW'] as const;
export const WEEK_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

export interface HallRef {
  id: string;
  name: string;
}

/** Shape the backend's POST /scheduler/bulk expects for every array item (date and time are separate fields). */
export type BulkScheduleItem = ScheduleRequestPayload & { recurrenceType: string };

export interface ParsedRow {
  rowNumber: number; // Excel row number (header = 1)
  item: BulkScheduleItem | null;
  hallName: string;
  errors: string[];
}

const HEADERS = [
  'Start Date',
  'Start Time',
  'End Date',
  'End Time',
  'Purpose',
  'Requirements',
  'Hall',
  'Recurrence Type',
  'Recurrence End Date',
  'Days Of Week',
  'Span Mode',
];

/** Builds and downloads the Excel template (sheet 1 = data, sheet 2 = help, sheet 3 = halls). */
export function downloadTemplate(halls: HallRef[]) {
  const wb = XLSX.utils.book_new();

  const sampleHall = halls[0]?.name ?? 'Main Hall';
  const rows = [
    HEADERS,
    ['2026-10-05', '09:00', '2026-10-05', '11:00', 'Sunday service rehearsal', 'Tv, Projector', sampleHall, 'NONE', '', '', ''],
    [
      '2026-10-06',
      '18:00',
      '2026-10-06',
      '20:00',
      'Weekly choir practice',
      'Projector',
      sampleHall,
      'WEEKLY',
      '2026-12-31',
      'MONDAY, WEDNESDAY',
      'DAILY_WINDOW',
    ],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [14, 12, 14, 12, 32, 20, 22, 18, 20, 30, 18].map((wch) => ({ wch }));
  XLSX.utils.book_append_sheet(wb, ws, 'Schedules');

  const help = [
    ['Column', 'Required', 'How to fill it'],
    ['Start Date', 'Yes', 'YYYY-MM-DD, e.g. 2026-10-05'],
    ['Start Time', 'Yes', 'HH:mm (24h), e.g. 09:00'],
    ['End Date', 'No', 'YYYY-MM-DD (blank = same as Start Date)'],
    ['End Time', 'Yes', 'HH:mm. End Date + End Time must be after Start Date + Start Time (for DAILY_WINDOW: End Time after Start Time)'],
    ['Purpose', 'Yes', 'Free text'],
    ['Requirements', 'No', 'Comma separated, e.g. Tv, Projector'],
    ['Hall', 'Yes', 'Hall name exactly as in the "Halls" sheet (the hall ID also works)'],
    ['Recurrence Type', 'No', `One of: ${RECURRENCE_TYPES.join(', ')} (blank = NONE)`],
    ['Recurrence End Date', 'If recurring', 'YYYY-MM-DD'],
    ['Days Of Week', 'If WEEKLY', `Comma separated: ${WEEK_DAYS.join(', ')}`],
    ['Span Mode', 'No', `If recurring, one of: ${SPAN_MODES.join(', ')} (blank = CONTINUOUS). CONTINUOUS runs from start to end without breaks; DAILY_WINDOW uses the start-to-end time of day as a window on each day from Start Date to End Date`],
    [],
    ['Tip', '', 'Delete the two example rows before uploading your own data.'],
  ];
  const wsHelp = XLSX.utils.aoa_to_sheet(help);
  wsHelp['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsHelp, 'Instructions');

  const wsHalls = XLSX.utils.aoa_to_sheet([['Hall Name', 'Hall ID'], ...halls.map((h) => [h.name, h.id])]);
  wsHalls['!cols'] = [{ wch: 30 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsHalls, 'Halls');

  XLSX.writeFile(wb, 'schedule-bulk-template.xlsx');
}


/** Excel serial number (days since 1899-12-30) -> local Date, ignoring time zones. */
function fromSerial(serial: number): Date {
  const ms = Math.round((serial - 25569) * 86400 * 1000);
  const u = new Date(ms);
  return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate(), u.getUTCHours(), u.getUTCMinutes(), u.getUTCSeconds());
}

function toDate(v: unknown): Date | null {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === 'number') return fromSerial(v);
  const str = String(v).trim();
  // "2026-10-05 09:00", "2026-10-05T09:00", "2026/10/05 9:00", "2026-10-05"
  const m = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) {
    const d = new Date(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0));
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Cell -> { h, m }. Accepts "09:00", "9:00 PM", an Excel time fraction (0.375), a Date, or "2026-10-05 09:00". */
function toTime(v: unknown): { h: number; m: number } | null {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : { h: v.getHours(), m: v.getMinutes() };
  if (typeof v === 'number') {
    const total = Math.round((v - Math.floor(v)) * 1440);
    return { h: Math.floor(total / 60) % 24, m: total % 60 };
  }
  const m = String(v)
    .trim()
    .match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?$/i);
  if (!m) return null;
  let h = +m[1];
  const min = +m[2];
  const mer = m[3]?.toLowerCase();
  if (mer === 'pm' && h < 12) h += 12;
  if (mer === 'am' && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return { h, m: min };
}

/** A date cell: real dates/serials and "YYYY-MM-DD". Pure time cells (0 <= n < 1) are not dates. */
function toDateOnly(v: unknown): Date | null {
  if (typeof v === 'number' && v < 1) return null;
  const d = toDate(v);
  return d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : null;
}

const ymd = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const hms = (t: { h: number; m: number }) => `${pad2(t.h)}:${pad2(t.m)}:00`;

const list = (v: unknown): string[] =>
  String(v ?? '')
    .split(/[,;\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Accept a few header spellings so a slightly edited template still works.
const KEYS: Record<string, string> = {
  startdate: 'startDate',
  start: 'startDate',
  starttime: 'startTime',
  enddate: 'endDate',
  end: 'endDate',
  endtime: 'endTime',
  purpose: 'purpose',
  requirements: 'requirements',
  requirement: 'requirements',
  hall: 'hall',
  hallname: 'hall',
  hallid: 'hall',
  recurrencetype: 'recurrenceType',
  recurrence: 'recurrenceType',
  recurrenceenddate: 'recurrenceEnd',
  recurrenceend: 'recurrenceEnd',
  daysofweek: 'days',
  days: 'days',
  spanmode: 'spanMode',
  span: 'spanMode',
};

export async function parseScheduleFile(file: File, halls: HallRef[]): Promise<ParsedRow[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array', cellDates: false });
  const sheetName = wb.SheetNames.find((n) => n.toLowerCase() === 'schedules') ?? wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  if (!sheet) throw new Error('The file has no sheets.');

  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '', raw: true });

  const hallByName = new Map(halls.map((h) => [norm(h.name), h]));
  const hallById = new Map(halls.map((h) => [h.id, h]));

  const out: ParsedRow[] = [];
  raw.forEach((r, idx) => {
    const row: Record<string, unknown> = {};
    Object.entries(r).forEach(([k, v]) => {
      const key = KEYS[norm(k)];
      if (key) row[key] = v;
    });

    // skip completely empty lines
    if (Object.values(row).every((v) => String(v ?? '').trim() === '')) return;

    const errors: string[] = [];
    // Old single-column templates ("Start Time" = "2026-10-05 09:00") still work: split them into date + time.
    let startDateV = toDateOnly(row.startDate);
    let startTimeV = toTime(row.startTime);
    if (!startDateV && row.startTime && typeof row.startTime !== 'undefined') {
      const legacy = toDate(row.startTime);
      if (legacy && !(typeof row.startTime === 'number' && row.startTime < 1)) {
        startDateV = new Date(legacy.getFullYear(), legacy.getMonth(), legacy.getDate());
        startTimeV = { h: legacy.getHours(), m: legacy.getMinutes() };
      }
    }
    let endDateV = toDateOnly(row.endDate);
    let endTimeV = toTime(row.endTime);
    if (!endDateV && row.endTime) {
      const legacy = toDate(row.endTime);
      if (legacy && !(typeof row.endTime === 'number' && row.endTime < 1)) {
        endDateV = new Date(legacy.getFullYear(), legacy.getMonth(), legacy.getDate());
        endTimeV = { h: legacy.getHours(), m: legacy.getMinutes() };
      }
    }
    // blank End Date = same day as the start
    if (!endDateV && startDateV && endTimeV) endDateV = startDateV;
    const purpose = String(row.purpose ?? '').trim();
    const hallRaw = String(row.hall ?? '').trim();
    const hall = hallById.get(hallRaw) ?? hallByName.get(norm(hallRaw));
    const recurrenceType = (String(row.recurrenceType ?? '').trim().toUpperCase() || 'NONE') as string;
    const recEnd = toDate(row.recurrenceEnd);
    const days = list(row.days).map((d) => d.toUpperCase());
    const spanMode = String(row.spanMode ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_') || 'CONTINUOUS';

    if (!startDateV) errors.push('Invalid Start Date');
    if (!startTimeV) errors.push('Invalid Start Time');
    if (!endDateV) errors.push('Invalid End Date');
    if (!endTimeV) errors.push('Invalid End Time');
    if (!purpose) errors.push('Purpose is required');
    if (!hallRaw) errors.push('Hall is required');
    else if (!hall) errors.push(`Unknown hall "${hallRaw}"`);
    if (!(RECURRENCE_TYPES as readonly string[]).includes(recurrenceType))
      errors.push(`Recurrence Type must be one of ${RECURRENCE_TYPES.join('/')}`);
    const recurring = recurrenceType !== 'NONE';
    if (recurring && !recEnd) errors.push('Recurrence End Date is required');
    if (recurrenceType === 'WEEKLY' && days.length === 0) errors.push('Days Of Week is required for WEEKLY');
    const badDay = days.find((d) => !(WEEK_DAYS as readonly string[]).includes(d));
    if (badDay) errors.push(`Unknown day "${badDay}"`);
    if (recurring && !(SPAN_MODES as readonly string[]).includes(spanMode))
      errors.push(`Span Mode must be one of ${SPAN_MODES.join('/')}`);
    if (startDateV && startTimeV && endDateV && endTimeV) {
      const rangeError = validateRange(
        ymd(startDateV),
        hms(startTimeV),
        ymd(endDateV),
        hms(endTimeV),
        recurring && spanMode === 'DAILY_WINDOW'
      );
      if (rangeError) errors.push(rangeError);
    }

    let item: BulkScheduleItem | null = null;
    if (errors.length === 0 && startDateV && startTimeV && endDateV && endTimeV && hall) {
      item = {
        startDate: ymd(startDateV),
        endDate: ymd(endDateV),
        startTime: hms(startTimeV),
        endTime: hms(endTimeV),
        purpose,
        requirements: list(row.requirements),
        hallId: hall.id,
        recurrenceType,
      };
      if (recurring && recEnd) {
        recEnd.setHours(23, 59, 59, 0);
        item.recurrenceEndDate = recEnd.toISOString();
        item.daysOfWeek = days;
        item.spanMode = spanMode;
      }
    }

    out.push({ rowNumber: idx + 2, item, hallName: hall?.name ?? hallRaw, errors });
  });

  return out;
}

/** "2026-10-05 09:00" for the preview table. */
export const fmt = (date: string, time: string) => `${date} ${time.slice(0, 5)}`;
