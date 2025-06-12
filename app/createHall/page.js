"use client";
import { useState } from 'react';
import {
  TextInput,
  MultiSelect,
  Button,
  Group,
  Container,
  Title,
  Notification,
} from '@mantine/core';

const facilitiesOptions = [
  { value: 'wifi', label: 'WiFi' },
  { value: 'tv', label: 'TV' },
  { value: 'projector', label: 'Projector' },
  { value: 'ac', label: 'Air Conditioning' },
  { value: 'generator', label: 'Generator' },
  { value: 'sound_system', label: 'Sound System' },
];

export default function MyForm() {
  const [hallName, setHallName] = useState('');
  const [hallCapacity, setHallCapacity] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [notification, setNotification] = useState({ visible: false, message: '', color: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation
    if (!hallName || !hallCapacity || facilities.length === 0) {
      setNotification({ visible: true, message: 'Please fill in all fields.', color: 'red' });
      return;
    }

    const capacity = parseInt(hallCapacity);
    if (isNaN(capacity) || capacity <= 0) {
      setNotification({ visible: true, message: 'Capacity must be a positive number.', color: 'red' });
      return;
    }

    const body = {
      name: hallName,
      capacity: capacity,
      availability: true,
      facilities: facilities,
    };

    try {
      const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/hall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        setNotification({ visible: true, message: data.message, color: 'green' });
        // Reset form fields
        setHallName('');
        setHallCapacity('');
        setFacilities([]);
      } else {
        const errorData = await response.json();
        setNotification({ visible: true, message: `Error: ${errorData.message}`, color: 'red' });
      }
    } catch (error) {
      setNotification({ visible: true, message: 'Network error. Please try again.', color: 'red' });
    }
  };

  return (
    <Container style={{ marginTop: 40, alignSelf: "center" }}>
      <Title order={2}>Create Hall</Title>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Hall Name"
          placeholder="Enter the hall name"
          value={hallName}
          onChange={(event) => setHallName(event.currentTarget.value)}
          style={{ width: "50%", marginTop: 10 }}
          required
        />
        <TextInput
          label="Hall Capacity"
          placeholder="Enter the hall capacity"
          value={hallCapacity}
          onChange={(event) => setHallCapacity(event.currentTarget.value)}
          style={{ width: "50%", marginTop: 10 }}
          required
        />
        <MultiSelect
          label="Facilities"
          placeholder="Select facilities"
          data={facilitiesOptions}
          value={facilities}
          onChange={setFacilities}
          style={{ width: "50%", marginTop: 10 }}
          required
        />
        <Group position="right" mt="md">
          <Button type="submit">Create</Button>
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