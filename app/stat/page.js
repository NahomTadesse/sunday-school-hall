"use client";
import { useEffect, useState } from 'react';
import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';
import { Center, Group, Paper, RingProgress, SimpleGrid, Text,Loader } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip } from 'chart.js';
import { StatsGrid } from './statGrid';

const icons = {
  up: IconArrowUpRight,
  down: IconArrowDownRight,
};

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const MyChart = ({ data }) => {
  const chartData = {
    labels: ['Total Bookings', 'Confirmed', 'Rejected', 'Pending', 'Member', 'Non-Member'],
    datasets: [
      {
        label: 'Booking Summary',
        data: [
          data.totalBookings,
          data.confirmedBookings,
          data.rejectedBookings,
          data.pendingBookings,
          data.memberBookings,
          data.nonMemberBookings,
        ],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            return `Value: ${tooltipItem.raw}`;
          },
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default function StatsRing() {
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
    { label: 'Total Bookings', stats: summaryData.totalBookings || 0, progress: 100, color: 'teal', icon: 'up' },
    { label: 'Confirmed Bookings', stats: summaryData.confirmedBookings || 0, progress: 0, color: 'blue', icon: 'up' },
    { label: 'Rejected Bookings', stats: summaryData.rejectedBookings || 0, progress: 0, color: 'red', icon: 'down' },
    { label: 'Pending Bookings', stats: summaryData.pendingBookings || 0, progress: 0, color: 'orange', icon: 'down' },
    { label: 'Member Bookings', stats: summaryData.memberBookings || 0, progress: 0, color: 'purple', icon: 'up' },
    { label: 'Non-Member Bookings', stats: summaryData.nonMemberBookings || 0, progress: 0, color: 'cyan', icon: 'down' },
  ].map((stat) => {
    const Icon = icons[stat.icon];
    return (
      <div style={{ marginTop: 45 }} key={stat.label}>
        <Paper withBorder radius="md" p="xs">
          <Group>
            <RingProgress
              size={80}
              roundCaps
              thickness={8}
              sections={[{ value: stat.progress, color: stat.color }]}
              label={
                <Center>
                  <Icon size={20} stroke={1.5} />
                </Center>
              }
            />
            <div>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                {stat.label}
              </Text>
              <Text fw={700} size="xl">
                {stat.stats}
              </Text>
            </div>
          </Group>
        </Paper>
      </div>
    );
  });

  return (
    <div>
      <SimpleGrid cols={{ base: 1, sm: 3 }}>{stats}</SimpleGrid>
      <StatsGrid />
      <div style={{ width: '80%', height: '300px', marginLeft: 45 }}>
        {!loading && <MyChart data={summaryData} />}
        {loading && <Center style={{ height: '300px' }}><Loader /></Center>}
      </div>
    </div>
  );
}