'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Download, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SkeletonRows } from '@/components/ui/skeleton-row';
import { useLanguage } from '@/contexts/LanguageContext';
import { handleUnauthorized } from '@/lib/api';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

interface Hall {
  id: string | number;
  name: string;
  capacity: number;
  availability: boolean;
  facilities: string[];
}

type SortKey = 'name' | 'capacity' | 'availability' | 'facilities';

export default function HallListPage() {
  const { t } = useLanguage();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [reversed, setReversed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const userDataString = Cookies.get('userData');
      const userData = userDataString ? JSON.parse(userDataString) : null;
      try {
        const response = await fetch(`${API_BASE}/hall`, {
          headers: { Authorization: `Bearer ${userData?.access_token}` },
        });
        if (response.status === 401 || response.status === 403) {
          handleUnauthorized();
          return;
        }
        const data = await response.json();
        setHalls(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching halls:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const rows = useMemo(() => {
    const query = search.toLowerCase().trim();
    let filtered = halls.filter((h) =>
      [h.name, h.capacity, h.availability ? 'available' : 'not available', h.facilities?.join(', ')]
        .filter(Boolean)
        .some((v) => v!.toString().toLowerCase().includes(query))
    );

    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const av = sortBy === 'facilities' ? a.facilities?.join(', ') : a[sortBy];
        const bv = sortBy === 'facilities' ? b.facilities?.join(', ') : b[sortBy];
        const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true });
        return reversed ? -cmp : cmp;
      });
    }

    return filtered;
  }, [halls, search, sortBy, reversed]);

  const setSorting = (key: SortKey) => {
    setReversed(key === sortBy ? !reversed : false);
    setSortBy(key);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [[t('common.name'), t('common.capacity'), t('common.availability'), t('common.facilities')]],
      body: rows.map((r) => [
        r.name,
        r.capacity,
        r.availability ? t('common.available') : t('common.notAvailable'),
        r.facilities?.join(', '),
      ]),
    });
    doc.save('hall-data.pdf');
    toast.success(t('common.downloadPdf'));
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: 'name', label: t('common.name') },
    { key: 'capacity', label: t('common.capacity') },
    { key: 'availability', label: t('common.availability') },
    { key: 'facilities', label: t('common.facilities') },
  ];

  return (
    <Card className="animate-fade-in-up">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle>{t('hall.report')}</CardTitle>
        <Button variant="outline" size="sm" onClick={downloadPDF} className="gap-1.5">
          <Download className="h-4 w-4" />
          {t('common.download')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('common.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>

        {loading ? (
          <SkeletonRows rows={5} cols={4} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key}>
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
                    key={row.id ?? i}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 25}ms`, animationFillMode: 'backwards' }}
                  >
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.capacity}</TableCell>
                    <TableCell>
                      <Badge variant={row.availability ? 'success' : 'destructive'}>
                        {row.availability ? t('common.available') : t('common.notAvailable')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.facilities?.join(', ')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    {t('common.nothingFound')}
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
