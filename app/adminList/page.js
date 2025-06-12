"use client";
import { useEffect, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconSearch, IconSelector } from '@tabler/icons-react';
import {
  Center,
  Group,
  ScrollArea,
  Table,
  Text,
  TextInput,
  UnstyledButton,
  Title,
  Pagination,
} from '@mantine/core';
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

export default function TableSort() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/auth/all/paginated');
        const data = await response.json();
        setAdmins(data.content);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Failed to fetch admins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleSearchChange = (event) => {
    const { value } = event.currentTarget;
    setSearch(value);
  };

  const filteredAdmins = admins.filter(admin => {
    const fullName = `${admin.firstname} ${admin.lastname}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) || admin.email.toLowerCase().includes(search.toLowerCase());
  });

  const sortedAdmins = filteredAdmins.sort((a, b) => {
    if (!sortBy) return 0;

    const aValue = a[sortBy] || '';
    const bValue = b[sortBy] || '';

    if (aValue < bValue) return reverseSortDirection ? 1 : -1;
    if (aValue > bValue) return reverseSortDirection ? -1 : 1;
    return 0;
  });

  const rows = sortedAdmins.map(admin => (
    <Table.Tr key={admin.uuid}>
      <Table.Td>{`${admin.firstname} ${admin.lastname}`}</Table.Td>
      <Table.Td>{admin.email}</Table.Td>
      <Table.Td>{admin.phoneNumber}</Table.Td>
    </Table.Tr>
  ));

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <ScrollArea>
      <Title order={2} style={{ marginTop: 45, marginLeft: 20 }}>Admin List</Title>
      <div className={classes.searchContainer}>
        <TextInput
          placeholder="Search"
          mb="md"
          leftSection={<IconSearch size={16} stroke={1.5} />}
          value={search}
          onChange={handleSearchChange}
        />
      </div>
      {loading ? (
        <Center style={{ height: '100vh' }}>
          <Text>Loading...</Text>
        </Center>
      ) : (
        <>
          <Table horizontalSpacing="md" verticalSpacing="xs" miw={700}>
            <Table.Tbody>
              <Table.Tr>
                <Th sorted={sortBy === 'firstname'} reversed={reverseSortDirection} onSort={() => setSortBy('firstname')}>
                  Full Name
                </Th>
                <Th sorted={sortBy === 'email'} reversed={reverseSortDirection} onSort={() => setSortBy('email')}>
                  Email
                </Th>
                <Th sorted={sortBy === 'phoneNumber'} reversed={reverseSortDirection} onSort={() => setSortBy('phoneNumber')}>
                  Phone Number
                </Th>
              </Table.Tr>
            </Table.Tbody>
            <Table.Tbody>
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text fw={500} ta="center">
                      Nothing found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={handlePaginationChange}
            style={{ marginTop: 20, marginLeft: 20 }}
          />
        </>
      )}
    </ScrollArea>
  );
}