'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Badge } from '@/components/ui/badge';
import { SortableTable, type Column } from '@/components/shared/SortableTable';
import { handleUnauthorized } from '@/lib/api';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

interface PromoRow {
  id: string;
  code: string;
  discountPercentage: number;
  expiryDate: string;
  memberOnly: boolean;
}

export default function PromoCodeListPage() {
  const [data, setData] = useState<PromoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userDataString = Cookies.get('userData');
      const userData = userDataString ? JSON.parse(userDataString) : null;
      try {
        const response = await fetch(`${API_BASE}/code`, {
          headers: { Authorization: `Bearer ${userData?.access_token}` },
        });
        if (response.status === 401 || response.status === 403) {
          handleUnauthorized();
          return;
        }
        const { data } = await response.json();
        setData(data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: Column<PromoRow>[] = [
    { key: 'code', label: 'Code' },
    { key: 'discountPercentage', label: 'Discount %' },
    { key: 'expiryDate', label: 'Expiry Date' },
    {
      key: 'memberOnly',
      label: 'Member Only',
      render: (row) => <Badge variant={row.memberOnly ? 'success' : 'secondary'}>{row.memberOnly ? 'Yes' : 'No'}</Badge>,
    },
  ];

  return (
    <SortableTable
      title="Promo Code List"
      columns={columns}
      data={data}
      loading={loading}
      onDownloadPdf
      rowKey={(row) => row.id}
    />
  );
}
