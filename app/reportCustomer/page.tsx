'use client';

import { SortableTable, type Column } from '@/components/shared/SortableTable';
import { Badge } from '@/components/ui/badge';

interface CustomerRow {
  Name: string;
  Date: string;
  Member: string;
  Amount: string;
  Discounts: string;
}

const data: CustomerRow[] = [
  { Name: 'Abebe Kebde', Date: 'Jan-12(Monday)', Member: 'NO', Amount: '1000 ETB', Discounts: '0' },
  { Name: 'Selam Hailu', Date: 'Feb-28(Tuesday)', Member: 'NO', Amount: '3000 ETB', Discounts: '0' },
  { Name: 'Nahom Tadesse', Date: 'Feb-1(Sunday)', Member: 'YES', Amount: '2000 ETB', Discounts: '300' },
  { Name: 'Tefera Abebe', Date: 'Jan-12(Monday)', Member: 'NO', Amount: '1000 ETB', Discounts: '300' },
  { Name: 'Kebde Solomon', Date: 'Jan-12(Monday)', Member: 'NO', Amount: '1000 ETB', Discounts: '0' },
  { Name: 'Kididst Kebde', Date: 'Jan-12(Monday)', Member: 'YES', Amount: '1000 ETB', Discounts: '150' },
  { Name: 'Desalegn Alazar', Date: 'Jan-12(Monday)', Member: 'YES', Amount: '1000 ETB', Discounts: '200' },
  { Name: 'Menassie Ermias', Date: 'Jan-12(Monday)', Member: 'NO', Amount: '1000 ETB', Discounts: '0' },
  { Name: 'Kidus Mikiyas', Date: 'Nov-12(Saturday)', Member: 'NO', Amount: '1000 ETB', Discounts: '100 ETB' },
  { Name: 'Yosef Zeleke', Date: 'Dec-12(Monday)', Member: 'YES', Amount: '3500 ETB', Discounts: '200 ETB' },
];

const columns: Column<CustomerRow>[] = [
  { key: 'Name', label: 'Name' },
  { key: 'Date', label: 'Date' },
  {
    key: 'Member',
    label: 'Member',
    render: (row) => <Badge variant={row.Member === 'YES' ? 'success' : 'secondary'}>{row.Member}</Badge>,
  },
  { key: 'Amount', label: 'Amount' },
  { key: 'Discounts', label: 'Discounts' },
];

export default function CustomerReportPage() {
  return (
    <SortableTable
      title="Customer Report"
      columns={columns}
      data={data}
      onDownloadPdf
      rowKey={(row) => row.Name}
    />
  );
}
