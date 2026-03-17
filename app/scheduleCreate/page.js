"use client";
import { useState, useEffect } from 'react';
import {
  TextInput,
  MultiSelect,
  Button,
  Group,
  Container,
  Title,
  Notification,
  Select,
  Loader,
  Overlay,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates'; 
import '@mantine/dates/styles.css'
import 'dayjs/locale/am';
import Cookies from 'js-cookie';
export default function ScheduleForm() {
  const [halls, setHalls] = useState([]);
  const [startTime, setStartTime] = useState(null); // Use null for DateTimePicker
  const [endTime, setEndTime] = useState(null); // Use null for DateTimePicker
  const [purpose, setPurpose] = useState('');
  const [requirements, setRequirements] = useState([]);
  const [hallId, setHallId] = useState('');
  const [notification, setNotification] = useState({ visible: false, message: '', color: '' });
  const [loading, setLoading] = useState(false); // Loading state
const userDataString = Cookies.get('userData');
const userData = userDataString ? JSON.parse(userDataString) : null;
  useEffect(() => {
    const fetchHalls = async () => {
      setLoading(true); // Start loading
      try {
        const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/hall',{
          headers: {
            Authorization: `Bearer ${userData?.access_token}`
          }
        }

        );
        const data = await response.json();
        setHalls(data);
      } catch (error) {
        console.error('Error fetching halls:', error);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchHalls();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation
    if (!startTime || !endTime || !purpose || !hallId) {
      setNotification({ visible: true, message: 'Please fill in all fields.', color: 'red' });
      return;
    }

    const body = [{
      startTime: startTime.toISOString(), // Convert to ISO string
      endTime: endTime.toISOString(), // Convert to ISO string
      purpose,
      requirements,
      hallId,
    }];

    setLoading(true); // Start loading
    try {
      const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/scheduler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
      Authorization: `Bearer ${userData?.access_token}`
       
       


        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        setNotification({ visible: true, message: data.message, color: 'green' });
        // Reset form fields if needed
        setStartTime(null);
        setEndTime(null);
        setPurpose('');
        setRequirements([]);
        setHallId('');
      } else {
        const errorData = await response.json();
        setNotification({ visible: true, message: `Error: ${errorData.message}`, color: 'red' });
      }
    } catch (error) {
      setNotification({ visible: true, message: 'Network error. Please try again.', color: 'red' });
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <Container style={{ marginTop: 40, alignSelf: "center" }}>
      <Title order={2}>Create Schedule</Title>
      {loading && (
        <Overlay opacity={0.7} color="#000" zIndex={1000} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader color="white" size="xl" />
        </Overlay>
      )}
      <form onSubmit={handleSubmit}>
        <DateTimePicker
        locale='am'
        timeInputProps={{ visible: true }} 
          label="Start Time"
          placeholder="Select start date and time"
          value={startTime}
          onChange={setStartTime}
          style={{ width: "50%", marginTop: 10 }}
          required
        />
        <DateTimePicker
       
        locale='am'
          label="End Time"
          placeholder="Select end date and time"
          value={endTime}
          onChange={setEndTime}
          style={{ width: "50%", marginTop: 10 }}
          required
        />
        <TextInput
          label="Purpose"
          placeholder="Enter the purpose of the booking"
          value={purpose}
          onChange={(event) => setPurpose(event.currentTarget.value)}
          style={{ width: "50%", marginTop: 10 }}
          required
        />
        <MultiSelect
          label="Requirements"
          placeholder="Select requirements"
          data={["Tv", "Projector"]}
          value={requirements}
          onChange={setRequirements}
          style={{ width: "50%", marginTop: 10 }}
        />
        <Select
          label="Select Hall"
          placeholder="Choose a hall"
          data={halls.map((hall) => ({ value: hall.id, label: hall.name }))}
          value={hallId}
          onChange={setHallId}
          required
          style={{ marginBottom: 20, maxWidth: 300 }}
        />
        <Group position="right" mt="md">
          <Button type="submit">Create Schedule</Button>
        </Group>
      </form>
      {notification.visible && (
        <Notification
          color={notification.color}
          onClose={() => setNotification({ ...notification, visible: false })}
          style={{ marginTop: 20 }}
        >
          {notification.message}
        </Notification>
      )}
    </Container>
  );
}