
"use client";
import { useState } from 'react';
import { IconChevronDown, IconChevronUp, IconSearch, IconSelector, IconDownload } from '@tabler/icons-react';
import {
  Center,
  Group,
  keys,
  ScrollArea,
  Table,
  Text,
  TextInput,
  UnstyledButton,
  Title,
  ActionIcon,
  Box
} from '@mantine/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import classes from './TableSort.module.css';

function Th({ children, reversed, sorted, onSort }) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size={16} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

function filterData(data, search) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    keys(data[0]).some((key) => {
      const value = item[key];
      return value && value.toString().toLowerCase().includes(query);
    })
  );
}

function sortData(data, payload) {
  const { sortBy, reversed } = payload;

  if (!sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...data].sort((a, b) => {
      if (reversed) {
        return b[sortBy].localeCompare(a[sortBy]);
      }
      return a[sortBy].localeCompare(b[sortBy]);
    }),
    payload.search
  );
}

// Updated data for each month
const data = [
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

export default function TableSort() {
  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState(data);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(data, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search: value }));
  };

  const rows = sortedData.map((row) => (
    <Table.Tr key={row.month}>
      <Table.Td>{row.month}</Table.Td>
      <Table.Td>{row.totalTransactions}</Table.Td>
      <Table.Td>{row.acceptedRequests}</Table.Td>
      <Table.Td>{row.rejectedRequests}</Table.Td>
      <Table.Td>{row.admins}</Table.Td>
      <Table.Td>{row.totalDiscounts}</Table.Td>
    </Table.Tr>
  ));

  const downloadPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Month', 'Total Transactions', 'Accepted Requests', 'Rejected Requests', 'Admins', 'Total Discounts']],
      body: sortedData.map(row => [row.month, row.totalTransactions, row.acceptedRequests, row.rejectedRequests, row.admins, row.totalDiscounts]),
    });
    doc.save('table-data.pdf');
  };

  return (
    <Box pos="relative">
      <ScrollArea style={{ height: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title order={2} style={{ marginTop: 45, marginLeft: 20 }}>Monthly Report</Title>
          <ActionIcon style={{ marginRight: 20 }} onClick={downloadPDF} title="Download as PDF" color="blue" variant="light">
            <IconDownload size={20} />
          </ActionIcon>
        </div>
        <div className={classes.searchContainer}>
          <TextInput
            placeholder="Search by any field"
            mb="md"
            leftSection={<IconSearch size={16} stroke={1.5} />}
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <Table horizontalSpacing="md" verticalSpacing="xs" miw={700}>
          <Table.Tbody>
            <Table.Tr>
              <Th sorted={sortBy === 'month'} reversed={reverseSortDirection} onSort={() => setSorting('month')}>
                Month
              </Th>
              <Th sorted={sortBy === 'totalTransactions'} reversed={reverseSortDirection} onSort={() => setSorting('totalTransactions')}>
                Total Transactions
              </Th>
              <Th sorted={sortBy === 'acceptedRequests'} reversed={reverseSortDirection} onSort={() => setSorting('acceptedRequests')}>
                Accepted Requests
              </Th>
              <Th sorted={sortBy === 'rejectedRequests'} reversed={reverseSortDirection} onSort={() => setSorting('rejectedRequests')}>
                Rejected Requests
              </Th>
              <Th sorted={sortBy === 'admins'} reversed={reverseSortDirection} onSort={() => setSorting('admins')}>
                Admins
              </Th>
              <Th sorted={sortBy === 'totalDiscounts'} reversed={reverseSortDirection} onSort={() => setSorting('totalDiscounts')}>
                Total Discounts
              </Th>
            </Table.Tr>
          </Table.Tbody>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text fw={500} ta="center">
                    Nothing found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Box>
  );
}