'use client';

import { SortableTable, type Column } from '@/components/shared/SortableTable';

interface OverallRow {
  year: number;
  totalTransactions: string;
  acceptedRequests: string;
  rejectedRequests: string;
  admins: string;
  totalDiscounts: string;
}

const data: OverallRow[] = [
  { year: 2017, totalTransactions: '100,000 ETB', acceptedRequests: '2000', rejectedRequests: '900', admins: '200', totalDiscounts: '10,000' },
  { year: 2016, totalTransactions: '120,000 ETB', acceptedRequests: '1000', rejectedRequests: '100', admins: '200', totalDiscounts: '9000' },
  { year: 2015, totalTransactions: '100,000 ETB', acceptedRequests: '2000', rejectedRequests: '900', admins: '200', totalDiscounts: '12,000' },
];

const columns: Column<OverallRow>[] = [
  { key: 'year', label: 'Year' },
  { key: 'totalTransactions', label: 'Total Transactions' },
  { key: 'acceptedRequests', label: 'Accepted' },
  { key: 'rejectedRequests', label: 'Rejected' },
  { key: 'admins', label: 'Admins' },
  { key: 'totalDiscounts', label: 'Total Discounts' },
];

export default function OverallReportPage() {
  return (
    <SortableTable
      title="Overall Report"
      columns={columns}
      data={data}
      onDownloadPdf
      rowKey={(row) => row.year}
    />
  );
}
