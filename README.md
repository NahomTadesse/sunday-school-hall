# Hall Dashboard (sunday-school)

Next.js admin dashboard for managing halls, bookings, schedules, payments, promo codes, terms and property rentals.
Backend: `https://hall-api.hohitebirhan.com/api/v1` (OpenAPI/Swagger).

## Scripts

```bash
npm install
npm run dev         # local dev server
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run lint
```

## Schedules

| Page | Route | Endpoint |
| --- | --- | --- |
| Create schedule | `/scheduleCreate` | `POST /scheduler` (one-time, array) / `POST /scheduler/recurring` |
| Bulk upload (Excel/CSV) | `/scheduleBulk` | `POST /scheduler/bulk` |
| Schedule list | `/scheduleList` | `GET /scheduler`, `GET /scheduler/{hallId}` |
| Calendar | `/scheduleCalendar` | `GET /scheduler` |

### Recurring schedules and `spanMode`

`POST /scheduler/recurring` accepts a `spanMode` field:

- `CONTINUOUS` (default): each occurrence runs without a break from `startTime` to `endTime`.
- `DAILY_WINDOW`: each occurrence uses only the start-to-end time of day as a daily window.

```json
{
  "startTime": "2026-10-06T15:00:00.000Z",
  "endTime": "2026-10-06T17:00:00.000Z",
  "purpose": "Weekly choir practice",
  "requirements": ["Projector"],
  "hallId": "<hall id>",
  "recurrenceType": "WEEKLY",
  "spanMode": "CONTINUOUS",
  "recurrenceEndDate": "2026-12-31T20:59:59.000Z",
  "daysOfWeek": ["MONDAY", "WEDNESDAY"]
}
```

- The create form shows a **Span mode** selector whenever "Repeat" is not "Does not repeat".
- The bulk Excel template has a **Span Mode** column (blank = `CONTINUOUS`, only used for recurring rows).
- The list and calendar show the repeat type and span mode. In the calendar, a multi-day `CONTINUOUS` schedule shows
  start time on the first day, "All day" in between and end time on the last day; a `DAILY_WINDOW` schedule shows the same
  time window on every day.

Schedule statuses: `PENDING`, `CONFIRMED`, `EXPIRED`, `UNEXPECTED`.

## Structure

- `app/` - pages (App Router)
- `components/` - UI primitives, shell, shared components (`MonthCalendar`, ...)
- `lib/` - API helpers, Excel parsing (`scheduleExcel.ts`), i18n (`en.json`, `am.json`)
- `contexts/` - auth, theme, language
