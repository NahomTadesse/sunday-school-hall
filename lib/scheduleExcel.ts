import * as XLSX from 'xlsx';

export const RECURRENCE_TYPES = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'] as const;
export const WEEK_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

export interface HallRef {
  id: string;
  name: string;
}

/** Shape the backend's POST /scheduler/bulk expects for every array item. */
export interface BulkScheduleItem {
  startTime: string;
  endTime: string;
  purpose: string;
  requirements: string[];
  hallId: string;
  recurrenceType: string;
  recurrenceEndDate?: string;
  daysOfWeek?: string[];
}

export interface ParsedRow {
  rowNumber: number; // Excel row number (header = 1)
  item: BulkScheduleItem | null;
  hallName: string;
  errors: string[];
}

const HEADERS = [
  'Start Time',
  'End Time',
  'Purpose',
  'Requirements',
  'Hall',
  'Recurrence Type',
  'Recurrence End Date',
  'Days Of Week',
];

/** Builds and downloads the Excel template (sheet 1 = data, sheet 2 = help, sheet 3 = halls). */
export function downloadTemplate(halls: HallRef[]) {
  const wb = XLSX.utils.book_new();

  const sampleHall = halls[0]?.name ?? 'Main Hall';
  const rows = [
    HEADERS,
    ['2026-10-05 09:00', '2026-10-05 11:00', 'Sunday service rehearsal', 'Tv, Projector', sampleHall, 'NONE', '', ''],
    [
      '2026-10-06 18:00',
      '2026-10-06 20:00',
      'Weekly choir practice',
      'Projector',
      sampleHall,
      'WEEKLY',
      '2026-12-31',
      'MONDAY, WEDNESDAY',
    ],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [18, 18, 32, 20, 22, 18, 20, 30].map((wch) => ({ wch }));
  XLSX.utils.book_append_sheet(wb, ws, 'Schedules');

  const help = [
    ['Column', 'Required', 'How to fill it'],
    ['Start Time', 'Yes', 'YYYY-MM-DD HH:mm (24h), e.g. 2026-10-05 09:00'],
    ['End Time', 'Yes', 'YYYY-MM-DD HH:mm, must be after Start Time'],
    ['Purpose', 'Yes', 'Free text'],
    ['Requirements', 'No', 'Comma separated, e.g. Tv, Projector'],
    ['Hall', 'Yes', 'Hall name exactly as in the "Halls" sheet (the hall ID also works)'],
    ['Recurrence Type', 'No', `One of: ${RECURRENCE_TYPES.join(', ')} (blank = NONE)`],
    ['Recurrence End Date', 'If recurring', 'YYYY-MM-DD'],
    ['Days Of Week', 'If WEEKLY', `Comma separated: ${WEEK_DAYS.join(', ')}`],
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

const pad = (n: number) => String(n).padStart(2, '0');

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

const list = (v: unknown): string[] =>
  String(v ?? '')
    .split(/[,;\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Accept a few header spellings so a slightly edited template still works.
const KEYS: Record<string, string> = {
  starttime: 'start',
  start: 'start',
  endtime: 'end',
  end: 'end',
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
    const start = toDate(row.start);
    const end = toDate(row.end);
    const purpose = String(row.purpose ?? '').trim();
    const hallRaw = String(row.hall ?? '').trim();
    const hall = hallById.get(hallRaw) ?? hallByName.get(norm(hallRaw));
    const recurrenceType = (String(row.recurrenceType ?? '').trim().toUpperCase() || 'NONE') as string;
    const recEnd = toDate(row.recurrenceEnd);
    const days = list(row.days).map((d) => d.toUpperCase());

    if (!start) errors.push('Invalid Start Time');
    if (!end) errors.push('Invalid End Time');
    if (start && end && end <= start) errors.push('End Time must be after Start Time');
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

    let item: BulkScheduleItem | null = null;
    if (errors.length === 0 && start && end && hall) {
      item = {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        purpose,
        requirements: list(row.requirements),
        hallId: hall.id,
        recurrenceType,
      };
      if (recurring && recEnd) {
        recEnd.setHours(23, 59, 59, 0);
        item.recurrenceEndDate = recEnd.toISOString();
        item.daysOfWeek = days;
      }
    }

    out.push({ rowNumber: idx + 2, item, hallName: hall?.name ?? hallRaw, errors });
  });

  return out;
}

export const fmt = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
