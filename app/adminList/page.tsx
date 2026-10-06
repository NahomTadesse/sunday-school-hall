'use client';

import { SortableTable, type Column } from '@/components/shared/SortableTable';
import { Badge } from '@/components/ui/badge';

interface AdminRow {
  name: string;
  email: string;
  date: string;
  status: string;
}

const data: AdminRow[] = [
  { name: 'Sara Kebede', date: '2024-03-12(Monday)', email: 'sara@yahoo.com', status: 'Active' },
  { name: 'Tilahun Ermias', date: '2024-11-30(Sunday)', email: 'tilahun@yahoo.com', status: 'Active' },
  { name: 'Girma Aseffa', date: '2024-04-06(Tuesday)', email: 'girma@hotmail.com', status: 'Inactive' },
  { name: 'Tesfaye Alemu', date: '2024-11-12(Sunday)', email: 'tesfaye@hotmail.com', status: 'Active' },
  { name: 'Abebe Kebede', date: '2024-12-02(Friday)', email: 'Abebe@yahoo.com', status: 'Active' },
];

const columns: Column<AdminRow>[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'date', label: 'Date' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'destructive'}>{row.status}</Badge>,
  },
];

export default function AdminListPage() {
  return <SortableTable title="Admins List" columns={columns} data={data} rowKey={(row) => row.email} />;
}
