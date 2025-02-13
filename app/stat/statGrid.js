"use client";
import {
    IconArrowDownRight,
    IconArrowUpRight,
    IconCoin,
    IconBan,
    IconReceipt2,
    IconZoomMoney,
    IconCircleCheck
    
  } from '@tabler/icons-react';
  import { Group, Paper, SimpleGrid, Text , Title, Container, Grid, Col } from '@mantine/core';



  import classes from './StatsGrid.module.css';
  
  const icons = {
    reject: IconBan,
    accepted: IconCircleCheck,
    receipt: IconReceipt2,
    unpaid: IconZoomMoney,
  };
  
  const data = [
    { title: 'Paid', icon: 'receipt', value: '13,456', diff: 34 },
    { title: 'Unpaid', icon: 'unpaid', value: '4,145', diff: -13 },
    { title: 'Accepted', icon: 'accepted', value: '745', diff: 18 },
    { title: 'Rejected', icon: 'reject', value: '188', diff: -30 },
  ] 
  
  export function StatsGrid() {
    const stats = data.map((stat) => {
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
        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>{stats}</SimpleGrid>
      </div>
    );
  }