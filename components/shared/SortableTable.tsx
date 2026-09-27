'use client';

import { useMemo, useState } from 'react';
import { ArrowUpDown, Download, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SkeletonRows } from '@/components/ui/skeleton-row';

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
}

export function SortableTable<T extends Record<string, any>>({
  title,
  columns,
  data,
  loading,
  searchPlaceholder = 'Search by any field...',
  emptyLabel = 'Nothing found',
  onDownloadPdf,
  rowKey,
}: {
  title: string;
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  emptyLabel?: string;
  onDownloadPdf?: boolean;
  rowKey: (row: T) => string | number;
}) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  const [reversed, setReversed] = useState(false);

  const rows = useMemo(() => {
    const query = search.toLowerCase().trim();
    let filtered = data.filter((row) =>
      columns.some((col) => {
        const v = row[col.key];
        return v !== undefined && v !== null && v.toString().toLowerCase().includes(query);
      })
    );

    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const cmp = String(a[sortBy] ?? '').localeCompare(String(b[sortBy] ?? ''), undefined, { numeric: true });
        return reversed ? -cmp : cmp;
      });
    }

    return filtered;
  }, [data, search, sortBy, reversed, columns]);

  const setSorting = (key: keyof T) => {
    setReversed(key === sortBy ? !reversed : false);
    setSortBy(key);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [columns.map((c) => c.label)],
      body: rows.map((row) => columns.map((c) => String(row[c.key] ?? ''))),
    });
    doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <Card className="animate-fade-in-up">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle>{title}</CardTitle>
        {onDownloadPdf && (
          <Button variant="outline" size="sm" onClick={downloadPDF} className="gap-1.5">
            <Download className="h-4 w-4" />
            Download
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>

        {loading ? (
          <SkeletonRows rows={5} cols={columns.length} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={String(col.key)}>
                    <button
                      onClick={() => setSorting(col.key)}
                      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {col.label}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row, i) => (
                  <TableRow
                    key={rowKey(row)}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 20}ms`, animationFillMode: 'backwards' }}
                  >
                    {columns.map((col) => (
                      <TableCell key={String(col.key)}>{col.render ? col.render(row) : row[col.key]}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">
                    {emptyLabel}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
