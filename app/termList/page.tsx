'use client';

import { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { ArrowUpDown, Download, ScrollText, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SkeletonRows } from '@/components/ui/skeleton-row';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { handleUnauthorized } from '@/lib/api';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

interface Term {
  id: string;
  hallName: string;
  termsText: string;
}

export default function TermListPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<keyof Term | null>(null);
  const [reversed, setReversed] = useState(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      const userDataString = Cookies.get('userData');
      const userData = userDataString ? JSON.parse(userDataString) : null;
      try {
        const response = await fetch(`${API_BASE}/terms`, {
          headers: { Authorization: `Bearer ${userData?.access_token}` },
        });
        if (response.status === 401 || response.status === 403) {
          handleUnauthorized();
          return;
        }
        const data = await response.json();
        setTerms(data);
      } catch {
        toast.error('Failed to fetch terms.');
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, []);

  const rows = useMemo(() => {
    const query = search.toLowerCase();
    let filtered = terms.filter(
      (t) => t.hallName.toLowerCase().includes(query) || t.termsText.toLowerCase().includes(query)
    );
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const cmp = String(a[sortBy] ?? '').localeCompare(String(b[sortBy] ?? ''));
        return reversed ? -cmp : cmp;
      });
    }
    return filtered;
  }, [terms, search, sortBy, reversed]);

  const setSorting = (key: keyof Term) => {
    setReversed(key === sortBy ? !reversed : false);
    setSortBy(key);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Hall Name', 'Term Values']],
      body: rows.map((t) => [t.hallName, t.termsText]),
    });
    doc.save('terms-data.pdf');
  };

  return (
    <>
      <Card className="animate-fade-in-up">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" />
            Term List
          </CardTitle>
          <Button variant="outline" size="sm" onClick={downloadPDF} className="gap-1.5">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by hall or term text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9"
            />
          </div>

          {loading ? (
            <SkeletonRows rows={5} cols={2} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button onClick={() => setSorting('hallName')} className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
                      Hall Name <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Term Values</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((term) => (
                    <TableRow
                      key={term.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedText(term.termsText)}
                    >
                      <TableCell className="font-medium">{term.hallName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {term.termsText.length > 60 ? `${term.termsText.substring(0, 60)}...` : term.termsText}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="py-10 text-center text-muted-foreground">
                      Nothing found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedText} onOpenChange={(open) => !open && setSelectedText(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Term & Condition</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{selectedText}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
