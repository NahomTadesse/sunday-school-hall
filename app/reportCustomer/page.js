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

const data = [
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

  const rows = sortedData.map((row, index) => (
    <Table.Tr key={index}>
      <Table.Td>{row.Name}</Table.Td>
      <Table.Td>{row.Date}</Table.Td>
      <Table.Td>{row.Member}</Table.Td>
      <Table.Td>{row.Amount}</Table.Td>
      <Table.Td>{row.Discounts}</Table.Td>
    </Table.Tr>
  ));

  const downloadPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Date', 'Member', 'Amount', 'Discounts']],
      body: sortedData.map(row => [row.Name, row.Date, row.Member, row.Amount, row.Discounts]),
    });
    doc.save('table-data.pdf');
  };

  return (
    <Box pos="relative">
      <ScrollArea style={{ height: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title order={2} style={{ marginTop: 45, marginLeft: 20 }}>Customer Report</Title>
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
              <Th sorted={sortBy === 'Name'} reversed={reverseSortDirection} onSort={() => setSorting('Name')}>
                Name
              </Th>
              <Th sorted={sortBy === 'Date'} reversed={reverseSortDirection} onSort={() => setSorting('Date')}>
                Date
              </Th>
              <Th sorted={sortBy === 'Member'} reversed={reverseSortDirection} onSort={() => setSorting('Member')}>
                Member
              </Th>
              <Th sorted={sortBy === 'Amount'} reversed={reverseSortDirection} onSort={() => setSorting('Amount')}>
                Amount
              </Th>
              <Th sorted={sortBy === 'Discounts'} reversed={reverseSortDirection} onSort={() => setSorting('Discounts')}>
                Discounts
              </Th>
            </Table.Tr>
          </Table.Tbody>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5}>
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