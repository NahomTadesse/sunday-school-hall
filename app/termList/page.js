"use client"
import { useEffect, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconSearch, IconSelector, IconDownload } from '@tabler/icons-react';
import {
  Center,
  Group,
  ScrollArea,
  Table,
  Text,
  TextInput,
  UnstyledButton,
  Title,
  ActionIcon,
  Box,
  Notification,
  Modal,
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

export default function TableSort() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ visible: false, message: '', color: '' });
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedTermText, setSelectedTermText] = useState('');

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/terms');
        const data = await response.json();
        setTerms(data);
      } catch (error) {
        setNotification({ visible: true, message: 'Failed to fetch terms.', color: 'red' });
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  const filteredTerms = terms.filter((term) => {
    return (
      term.hallName.toLowerCase().includes(search.toLowerCase()) ||
      term.termsText.toLowerCase().includes(search.toLowerCase())
    );
  });

  const sortedTerms = filteredTerms.sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const rows = sortedTerms.map((term) => (
    <Table.Tr key={term.id}>
      <Table.Td>{term.hallName}</Table.Td>
      <Table.Td onClick={() => { setSelectedTermText(term.termsText); setModalOpened(true); }} style={{ cursor: 'pointer' }}>
        {term.termsText.length > 50 ? `${term.termsText.substring(0, 50)}...` : term.termsText}
      </Table.Td>
    </Table.Tr>
  ));

  const downloadPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Hall Name', 'Term Values']],
      body: sortedTerms.map(term => [term.hallName, term.termsText]),
    });
    doc.save('terms-data.pdf');
  };

  return (
    <Box pos="relative">
      <ScrollArea style={{ height: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title order={2} style={{ marginTop: 45, marginLeft: 20 }}>Term List</Title>
          <ActionIcon style={{ marginRight: 20 }} onClick={downloadPDF} title="Download as PDF" color="blue" variant="light">
            <IconDownload size={20} />
          </ActionIcon>
        </div>
        <div className={classes.searchContainer}>
          <TextInput
            placeholder="Search"
            mb="md"
            leftSection={<IconSearch size={16} stroke={1.5} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
        </div>
        <Table horizontalSpacing="md" verticalSpacing="xs" miw={700}>
          <Table.Tbody>
            <Table.Tr>
              <Th sorted={sortField === 'hallName'} reversed={sortDirection === 'desc'} onSort={() => {
                setSortField('hallName');
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
              }}>
                Hall Name
              </Th>
              <Th sorted={sortField === 'termsText'} reversed={sortDirection === 'desc'} onSort={() => {
                setSortField('termsText');
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
              }}>
                Term Values
              </Th>
            </Table.Tr>
          </Table.Tbody>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={2}>
                  <Text fw={500} ta="center">
                    No terms found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
      {notification.visible && (
        <Notification color={notification.color} onClose={() => setNotification({ ...notification, visible: false })}>
          {notification.message}
        </Notification>
      )}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Term"
      >
        <Text>{selectedTermText}</Text>
      </Modal>
    </Box>
  );
}