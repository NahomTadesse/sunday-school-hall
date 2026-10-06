'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { CheckCircle2, Download, FileSpreadsheet, TriangleAlert, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { API_BASE, handleUnauthorized } from '@/lib/api';
import {
  downloadTemplate,
  fmt,
  parseScheduleFile,
  type BulkScheduleItem,
  type HallRef,
  type ParsedRow,
} from '@/lib/scheduleExcel';

export default function ScheduleBulkPage() {
  const [halls, setHalls] = useState<HallRef[]>([]);
  const [hallsLoaded, setHallsLoaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const token = () => {
    const s = Cookies.get('userData');
    return s ? JSON.parse(s)?.access_token : undefined;
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/hall`, { headers: { Authorization: `Bearer ${token()}` } });
        if (res.status === 401 || res.status === 403) {
          handleUnauthorized();
          return;
        }
        const data = await res.json();
        setHalls(Array.isArray(data) ? data.map((h: HallRef) => ({ id: h.id, name: h.name })) : []);
      } catch {
        toast.error('Could not load halls.');
      } finally {
        setHallsLoaded(true);
      }
    })();
  }, []);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      toast.error('Please upload an Excel file (.xlsx, .xls) or CSV.');
      return;
    }
    setParsing(true);
    setFileName(file.name);
    try {
      const parsed = await parseScheduleFile(file, halls);
      setRows(parsed);
      if (parsed.length === 0) toast.error('No data rows found in the file.');
    } catch (e) {
      setRows([]);
      toast.error(e instanceof Error ? e.message : 'Could not read the file.');
    } finally {
      setParsing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const valid = rows.filter((r) => r.item);
  const invalid = rows.filter((r) => !r.item);

  const submit = async () => {
    const payload: BulkScheduleItem[] = valid.map((r) => r.item as BulkScheduleItem);
    if (payload.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/scheduler/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(payload),
      });
      if (res.status === 401 || res.status === 403) {
        handleUnauthorized();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(data?.message || `${payload.length} schedule(s) uploaded.`);
        setRows([]);
        setFileName('');
      } else {
        toast.error(data?.message || 'Bulk upload failed.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Bulk Upload Schedules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download the template, fill in one schedule per row, then upload it. You can review every row before anything
            is sent to the server.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" disabled={!hallsLoaded} onClick={() => downloadTemplate(halls)}>
              <Download className="h-4 w-4" />
              Download template
            </Button>
            <Button type="button" loading={parsing} disabled={!hallsLoaded} onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Upload Excel
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
            <Link href="/scheduleCreate" className="ms-auto text-sm font-medium text-primary hover:underline">
              Create a single schedule
            </Link>
          </div>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-4 text-base">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> {valid.length} valid
              </span>
              {invalid.length > 0 && (
                <span className="flex items-center gap-1.5 text-destructive">
                  <TriangleAlert className="h-4 w-4" /> {invalid.length} with errors (will be skipped)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-[420px] overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Hall</TableHead>
                    <TableHead>Repeat</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.rowNumber} className={r.item ? '' : 'bg-destructive/5'}>
                      <TableCell>{r.rowNumber}</TableCell>
                      <TableCell>{r.item ? fmt(r.item.startTime) : '—'}</TableCell>
                      <TableCell>{r.item ? fmt(r.item.endTime) : '—'}</TableCell>
                      <TableCell>{r.item?.purpose ?? '—'}</TableCell>
                      <TableCell>{r.hallName || '—'}</TableCell>
                      <TableCell>{r.item?.recurrenceType ?? '—'}</TableCell>
                      <TableCell className={r.item ? 'text-emerald-600' : 'text-destructive'}>
                        {r.item ? 'OK' : r.errors.join('; ')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRows([]);
                  setFileName('');
                }}
              >
                Clear
              </Button>
              <Button type="button" loading={submitting} disabled={valid.length === 0} onClick={submit}>
                Upload {valid.length} schedule{valid.length === 1 ? '' : 's'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
