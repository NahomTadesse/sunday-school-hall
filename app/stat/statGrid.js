"use client";
import { useEffect, useState } from 'react';
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconBan,
  IconCircleCheck,
  IconReceipt2,
  IconZoomMoney,
} from '@tabler/icons-react';
import { Group, Paper, SimpleGrid, Text , Loader} from '@mantine/core';
import classes from './StatsGrid.module.css';

const icons = {
  reject: IconBan,
  accepted: IconCircleCheck,
  receipt: IconReceipt2,
  unpaid: IconZoomMoney,
};

export function StatsGrid() {
  const [summaryData, setSummaryData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/book/booking-summary');
        const data = await response.json();
        setSummaryData(data);
      } catch (error) {
        console.error('Error fetching booking summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const stats = [
    {
      title: 'Total Revenue',
      icon: 'receipt',
      value: summaryData.totalRevenue ? summaryData.totalRevenue.toLocaleString() : '0',
      diff: 0, // Placeholder for difference calculation
    },
    {
      title: 'Unpaid Amount',
      icon: 'unpaid',
      value: summaryData.unpaidAmount ? summaryData.unpaidAmount.toLocaleString() : '0',
      diff: 0, // Placeholder for difference calculation
    },
    {
      title: 'Accepted Bookings',
      icon: 'accepted',
      value: summaryData.confirmedBookings || 0,
      diff: 0, // Placeholder for difference calculation
    },
    {
      title: 'Rejected Bookings',
      icon: 'reject',
      value: summaryData.rejectedBookings || 0,
      diff: 0, // Placeholder for difference calculation
    },
  ].map((stat) => {
    const Icon = icons[stat.icon];
    const DiffIcon = stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;

    return (
      <Paper withBorder p="md" radius="md" key={stat.title}>
        <Group justify="space-between">
          <Text size="xs" c="dimmed" className={classes.title}>
            {stat.title}
          </Text>
          <Icon className={classes.icon} size={22} stroke={1.5} />
        </Group>

        <Group align="flex-end" gap="xs" mt={25}>
          <Text className={classes.value}>{stat.value}</Text>
          <Text c={stat.diff > 0 ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>
            <span>{stat.diff}%</span>
            <DiffIcon size={16} stroke={1.5} />
          </Text>
        </Group>

        <Text fz="xs" c="dimmed" mt={7}>
          Compared to previous month
        </Text>
      </Paper>
    );
  });

  return (
    <div className={classes.root}>
      {loading ? (
        <Text>Loading...</Text> // Optional loading state
      ) : (
        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>{stats}</SimpleGrid>
      )}
    </div>
  );
}