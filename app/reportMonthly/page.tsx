'use client';

import { SortableTable, type Column } from '@/components/shared/SortableTable';

interface MonthlyRow {
  month: string;
  totalTransactions: string;
  acceptedRequests: string;
  rejectedRequests: string;
  admins: string;
  totalDiscounts: string;
}

const data: MonthlyRow[] = [
  { month: 'January', totalTransactions: '10,000 ETB', acceptedRequests: '3', rejectedRequests: '4', admins: '2', totalDiscounts: '1,000' },
  { month: 'February', totalTransactions: '15,000 ETB', acceptedRequests: '5', rejectedRequests: '2', admins: '3', totalDiscounts: '1,500' },
  { month: 'March', totalTransactions: '20,000 ETB', acceptedRequests: '8', rejectedRequests: '1', admins: '4', totalDiscounts: '2,000' },
  { month: 'April', totalTransactions: '25,000 ETB', acceptedRequests: '10', rejectedRequests: '3', admins: '2', totalDiscounts: '2,500' },
  { month: 'May', totalTransactions: '30,000 ETB', acceptedRequests: '7', rejectedRequests: '5', admins: '3', totalDiscounts: '3,000' },
  { month: 'June', totalTransactions: '35,000 ETB', acceptedRequests: '6', rejectedRequests: '4', admins: '2', totalDiscounts: '3,500' },
  { month: 'July', totalTransactions: '40,000 ETB', acceptedRequests: '9', rejectedRequests: '3', admins: '3', totalDiscounts: '4,000' },
  { month: 'August', totalTransactions: '45,000 ETB', acceptedRequests: '5', rejectedRequests: '1', admins: '4', totalDiscounts: '4,500' },
  { month: 'September', totalTransactions: '50,000 ETB', acceptedRequests: '7', rejectedRequests: '2', admins: '3', totalDiscounts: '5,000' },
  { month: 'October', totalTransactions: '55,000 ETB', acceptedRequests: '10', rejectedRequests: '4', admins: '2', totalDiscounts: '5,500' },
  { month: 'November', totalTransactions: '60,000 ETB', acceptedRequests: '8', rejectedRequests: '3', admins: '3', totalDiscounts: '6,000' },
  { month: 'December', totalTransactions: '70,000 ETB', acceptedRequests: '12', rejectedRequests: '1', admins: '4', totalDiscounts: '7,000' },
];

const columns: Column<MonthlyRow>[] = [
  { key: 'month', label: 'Month' },
  { key: 'totalTransactions', label: 'Total Transactions' },
  { key: 'acceptedRequests', label: 'Accepted' },
  { key: 'rejectedRequests', label: 'Rejected' },
  { key: 'admins', label: 'Admins' },
  { key: 'totalDiscounts', label: 'Total Discounts' },
];

export default function MonthlyReportPage() {
  return (
    <SortableTable
      title="Monthly Report"
      columns={columns}
      data={data}
      onDownloadPdf
      rowKey={(row) => row.month}
    />
  );
}
