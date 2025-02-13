import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';
import { Center, Group, Paper, RingProgress, SimpleGrid, Text } from '@mantine/core';
// import { BarChart } from '@mantine/charts';
import {StatsGrid} from './statGrid'
import { PieChart, BarChart } from '@mantine/charts';
const icons = {
  up: IconArrowUpRight,
  down: IconArrowDownRight,
};

const data = [
  { label: 'Transactions', stats: '456,578', progress: 65, color: 'teal', icon: 'up' },
  { label: 'Booked Venue', stats: '2,550', progress: 72, color: 'blue', icon: 'up' },
  {
    label: 'Users',
    stats: '4,735',
    progress: 52,
    color: 'red',
    icon: 'down',
  },
] ;

const BarChartData = [
  { month: 'January', Smartphones: 1200, Laptops: 900, Tablets: 200 },
  { month: 'February', Smartphones: 1900, Laptops: 1200, Tablets: 400 },
  { month: 'March', Smartphones: 400, Laptops: 1000, Tablets: 200 },
  { month: 'April', Smartphones: 1000, Laptops: 200, Tablets: 800 },
  { month: 'May', Smartphones: 800, Laptops: 1400, Tablets: 1200 },
  { month: 'June', Smartphones: 750, Laptops: 600, Tablets: 1000 },
];

export default function StatsRing() {
  const stats = data.map((stat) => {
    const Icon = icons[stat.icon];
    return (
        <div style={{marginTop:45}}>


      <Paper withBorder radius="md" p="xs" key={stat.label}>
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

  return( 
  <div>
  <SimpleGrid cols={{ base: 1, sm: 3 }}>{stats}</SimpleGrid>
  <StatsGrid/>
  <StatsGrid/>
  {/* <BarChart
      h={300}
      data={BarChartData}
      dataKey="month"
      type="percent"
      series={[
        { name: 'Smartphones', color: 'violet.6' },
        { name: 'Laptops', color: 'blue.6' },
        { name: 'Tablets', color: 'teal.6' },
      ]}
    /> */}
  </div>
  )

}