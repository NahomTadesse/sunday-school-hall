'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip as ChartTooltip,
} from 'chart.js';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAccessToken } from '@/app/utils/auth';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, ChartTooltip);

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

interface Summary {
  totalBookings?: number;
  confirmedBookings?: number;
  rejectedBookings?: number;
  pendingBookings?: number;
  memberBookings?: number;
  nonMemberBookings?: number;
}

export default function StatsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [summary, setSummary] = useState<Summary>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      const token = getAccessToken();
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const response = await fetch(`${API_BASE}/book/booking-summary`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        if (response.status === 401 || response.status === 403) {
          window.location.href = '/login';
          return;
        }

        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error('Error fetching booking summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [router]);

  const stats: { labelKey: keyof typeof labelMap; value: number; trend: 'up' | 'down' }[] = [
    { labelKey: 'dashboard.totalBookings', value: summary.totalBookings || 0, trend: 'up' },
    { labelKey: 'dashboard.confirmedBookings', value: summary.confirmedBookings || 0, trend: 'up' },
    { labelKey: 'dashboard.rejectedBookings', value: summary.rejectedBookings || 0, trend: 'down' },
    { labelKey: 'dashboard.pendingBookings', value: summary.pendingBookings || 0, trend: 'down' },
    { labelKey: 'dashboard.memberBookings', value: summary.memberBookings || 0, trend: 'up' },
    { labelKey: 'dashboard.nonMemberBookings', value: summary.nonMemberBookings || 0, trend: 'down' },
  ];

  const chartData = {
    labels: stats.map((s) => t(s.labelKey)),
    datasets: [
      {
        label: t('dashboard.bookingSummary'),
        data: stats.map((s) => s.value),
        fill: true,
        backgroundColor: 'hsla(168, 76%, 45%, 0.08)',
        borderColor: 'hsl(168, 76%, 40%)',
        pointBackgroundColor: 'hsl(168, 76%, 40%)',
        tension: 0.35,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } },
    plugins: { legend: { display: false } },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat, i) => {
              const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
              return (
                <Card
                  key={stat.labelKey}
                  className="animate-fade-in-up transition-shadow hover:shadow-md"
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'backwards' }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t(stat.labelKey)}
                    </CardTitle>
                    <span
                      className={
                        stat.trend === 'up'
                          ? 'flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15'
                          : 'flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15'
                      }
                    >
                      <TrendIcon className="h-4 w-4" />
                    </span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('dashboard.bookingSummary')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {loading ? <Skeleton className="h-full w-full" /> : <Line data={chartData} options={chartOptions} />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// keys used above, kept for type inference convenience
const labelMap = {
  'dashboard.totalBookings': 0,
  'dashboard.confirmedBookings': 0,
  'dashboard.rejectedBookings': 0,
  'dashboard.pendingBookings': 0,
  'dashboard.memberBookings': 0,
  'dashboard.nonMemberBookings': 0,
} as const;
