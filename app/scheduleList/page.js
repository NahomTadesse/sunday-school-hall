"use client";
import { useEffect, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconSearch, IconSelector, IconDownload, IconDots, IconCalendar, IconAlertCircle } from '@tabler/icons-react';
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
  Select,
  Menu,
  Modal,
  Button,
  Textarea,
  MultiSelect,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import classes from './TableSort.module.css';
import { DateTimePicker } from '@mantine/dates';
import '@mantine/dates/styles.css'
import 'dayjs/locale/am';

function Th({ children, reversed, sorted, onSort }) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">{children}</Text>
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

export default function ScheduleList() {
  const [halls, setHalls] = useState([]);
  const [selectedHallId, setSelectedHallId] = useState('');
  const [scheduleData, setScheduleData] = useState([]);
  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  // Modals and form states
  const [openedPostpone, { open: openPostpone, close: closePostpone }] = useDisclosure(false);
  const [openedUnexpected, { open: openUnexpected, close: closeUnexpected }] = useDisclosure(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [newStartTime, setNewStartTime] = useState(null);
  const [newEndTime, setNewEndTime] = useState(null);
  const [unexpectedStartTime, setUnexpectedStartTime] = useState(null);
  const [unexpectedEndTime, setUnexpectedEndTime] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [requirements, setRequirements] = useState([]);

  const fetchAllSchedules = async () => {
    try {
      const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/scheduler');
      const data = await response.json();
      const schedules = Array.isArray(data) ? data : data.schedules || data.data || [];
      setScheduleData(schedules);
      setSortedData(schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setScheduleData([]);
      setSortedData([]);
    }
  };

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/hall');
        const data = await response.json();
        setHalls(data);
      } catch (error) {
        console.error("Error fetching halls:", error);
      }
    };

    fetchHalls();
    fetchAllSchedules();
  }, []);

  useEffect(() => {
    if (selectedHallId) {
      const fetchSchedules = async () => {
        try {
          const response = await fetch(`https://hall-api.hohitebirhan.com/api/v1/scheduler/${selectedHallId}`);
          const data = await response.json();
          setScheduleData(data);
          console.log('data',data)
          setSortedData(data);
        } catch (error) {
          console.error("Error fetching schedules:", error);
        }
      };

      fetchSchedules();
    }
  }, [selectedHallId]);

  const setSorting = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(scheduleData, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(sortData(scheduleData, { sortBy, reversed: reverseSortDirection, search: value }));
  };

  const handlePostpone = async () => {
    try {
      const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/scheduler/postpone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newStartTime: newStartTime.toISOString(),
          newEndTime: newEndTime.toISOString(),
          scheduleId: selectedScheduleId,
        }),
      });
console.log(newStartTime.toISOString())
console.log(newEndTime.toISOString())
console.log(selectedScheduleId)
console.log(response)
      if (response.ok) {
        alert('Schedule postponed successfully!');
        closePostpone();
      } else {
        alert('Failed to postpone schedule.');
      }
    } catch (error) {
      console.error('Error postponing schedule:', error);
    }
  };

  const handleUnexpected = async () => {
    try {
      const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/scheduler/unexpected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: unexpectedStartTime.toISOString(),
          endTime: unexpectedEndTime.toISOString(),
          purpose: purpose,
          requirements: requirements,
          hallId: selectedHallId,
        }),
      });
console.log('hall',selectedHallId,)
      if (response.ok) {
        alert('Unexpected schedule created successfully!');
        closeUnexpected();
      } else {
        alert('Failed to create unexpected schedule.');
      }
    } catch (error) {
      console.error('Error creating unexpected schedule:', error);
    }
  };

  const rows = sortedData && sortedData.map((row) => (
    <Table.Tr key={row.id}>
      <Table.Td>{row.startTime}</Table.Td>
      <Table.Td>{row.endTime}</Table.Td>
      <Table.Td>{row.purpose}</Table.Td>
      <Table.Td>{row.requirements.join(', ')}</Table.Td>
      <Table.Td>{row.hall.name}</Table.Td>
      <Table.Td>{row.status}</Table.Td>
      <Table.Td>
        <Menu>
          <Menu.Target>
            <ActionIcon variant="transparent">
              <IconDots size={20} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconCalendar size={16} />} onClick={() => { setSelectedScheduleId(row.id); openPostpone(); }}>
              Postpone
            </Menu.Item>
            <Menu.Item leftSection={<IconAlertCircle size={16} />} onClick={openUnexpected}>
              Unexpected
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  ));

  const downloadPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Start Time', 'End Time', 'Purpose', 'Requirements', 'Hall Name', 'Status']],
      body: sortedData.map(row => [
        row.startTime, 
        row.endTime, 
        row.purpose, 
        row.requirements.join(', '), 
        row.hall.name, 
        row.status
      ]),
    });
    doc.save('schedules.pdf');
  };

  return (
    <Box pos="relative">
      <ScrollArea style={{ height: '700px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title order={2} style={{ marginTop: 45, marginLeft: 20 }}>Schedule List</Title>
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
        <Select
          placeholder="Choose a hall"
          data={halls.map((hall) => ({ value: hall.id, label: hall.name }))}
          value={selectedHallId}
          onChange={setSelectedHallId}
          style={{ marginBottom: 20, maxWidth: 300, marginLeft: 20, marginTop: 10 }}
        />
        <Table horizontalSpacing="md" verticalSpacing="xs" miw={700}>
          <Table.Tbody>
            <Table.Tr>
              <Th sorted={sortBy === 'startTime'} reversed={reverseSortDirection} onSort={() => setSorting('startTime')}>
                Start Time
              </Th>
              <Th sorted={sortBy === 'endTime'} reversed={reverseSortDirection} onSort={() => setSorting('endTime')}>
                End Time
              </Th>
              <Th sorted={sortBy === 'purpose'} reversed={reverseSortDirection} onSort={() => setSorting('purpose')}>
                Purpose
              </Th>
              <Th sorted={sortBy === 'requirements'} reversed={reverseSortDirection} onSort={() => setSorting('requirements')}>
                Requirements
              </Th>
              <Th sorted={sortBy === 'hall.name'} reversed={reverseSortDirection} onSort={() => setSorting('hall.name')}>
                Hall Name
              </Th>
              <Th sorted={sortBy === 'status'} reversed={reverseSortDirection} onSort={() => setSorting('status')}>
                Status
              </Th>
              <Th>Actions</Th>
            </Table.Tr>
          </Table.Tbody>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text fw={500} ta="center">
                    Nothing found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {/* Postpone Modal */}
      <Modal opened={openedPostpone} onClose={closePostpone} title="Postpone Schedule">
        <DateTimePicker
        locale='am'
          label="New Start Time"
          value={newStartTime}
          onChange={setNewStartTime}
          required
        />
        <DateTimePicker
        locale='am'
          label="New End Time"
          value={newEndTime}
          onChange={setNewEndTime}
          required
        />
        <Button onClick={handlePostpone} mt="md">
          Postpone
        </Button>
      </Modal>

      {/* Unexpected Modal */}
      <Modal opened={openedUnexpected} onClose={closeUnexpected} title="Create Unexpected Schedule">
        <DateTimePicker
        locale='am'
          label="Start Time"
          value={unexpectedStartTime}
          onChange={setUnexpectedStartTime}
          required
        />
        <DateTimePicker
        locale='am'
          label="End Time"
          value={unexpectedEndTime}
          onChange={setUnexpectedEndTime}
          required
        />
        <TextInput
          label="Purpose"
          value={purpose}
          onChange={(event) => setPurpose(event.currentTarget.value)}
          required
        />
        <MultiSelect
          label="Requirements"
          data={['Projector', 'Microphone', 'Whiteboard', 'Chairs', 'Tables']}
          value={requirements}
          onChange={setRequirements}
          required
        />
        <Button onClick={handleUnexpected} mt="md">
          Create
        </Button>
      </Modal>
    </Box>
  );
}