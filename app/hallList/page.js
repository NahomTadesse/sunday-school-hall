"use client";
import { useEffect, useState } from 'react';
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
  Box,
} from '@mantine/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import classes from './TableSort.module.css';
import Cookies from 'js-cookie';
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
    keys(item).some((key) => {
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

export default function TableSort() {
  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
const userDataString = Cookies.get('userData');
const userData = userDataString ? JSON.parse(userDataString) : null;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/hall', {
          headers: {
            Authorization: `Bearer ${userData?.access_token}`
          }
        });
        const data = await response.json();
        setSortedData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const setSorting = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(sortedData, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(sortData(sortedData, { sortBy, reversed: reverseSortDirection, search: value }));
  };

  const rows = sortedData.map((row) => (
    <Table.Tr key={row.id}>
      <Table.Td>{row.name}</Table.Td>
      <Table.Td>{row.capacity}</Table.Td>
      <Table.Td>{row.availability ? 'Available' : 'Not Available'}</Table.Td>
      <Table.Td>{row.facilities.join(', ')}</Table.Td>
    </Table.Tr>
  ));

  const downloadPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Capacity', 'Availability', 'Facilities']],
      body: sortedData.map(row => [row.name, row.capacity, row.availability ? 'Available' : 'Not Available', row.facilities.join(', ')]),
    });
    doc.save('hall-data.pdf');
  };

  return (
    <Box pos="relative">
      <ScrollArea >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title order={2} style={{ marginTop: 45, marginLeft: 20 }}>Hall Report</Title>
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
        <Table horizontalSpacing="md" verticalSpacing="xs" miw={700} >  
          <Table.Tbody>
            <Table.Tr>
              <Th sorted={sortBy === 'name'} reversed={reverseSortDirection} onSort={() => setSorting('name')}>
                Name
              </Th>
              <Th sorted={sortBy === 'capacity'} reversed={reverseSortDirection} onSort={() => setSorting('capacity')}>
                Capacity
              </Th>
              <Th sorted={sortBy === 'availability'} reversed={reverseSortDirection} onSort={() => setSorting('availability')}>
                Availability
              </Th>
              <Th sorted={sortBy === 'facilities'} reversed={reverseSortDirection} onSort={() => setSorting('facilities')}>
                Facilities
              </Th>
            </Table.Tr>
          </Table.Tbody>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4}>
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