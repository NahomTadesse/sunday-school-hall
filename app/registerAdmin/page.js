"use client";
import { useState } from 'react';
import { 
  Container, 
  TextInput, 
  Button, 
  Title, 
  Group, 
  Grid, 
  Notification, 
  Loader, 
  Overlay 
} from '@mantine/core';

export default function AdminRegistration() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [notification, setNotification] = useState({ visible: false, message: '', color: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Basic validation
    if (!name || !lastName || !username || !email || !password || !phone) {
      setNotification({ visible: true, message: 'Please fill in all fields.', color: 'red' });
      return;
    }

    setLoading(true); // Show loader

    const data = {
      firstName: name,
      lastName: lastName,
      userName: username,
      email: email,
      phoneNumber: phone,
      role: "ADMIN",
      status: "ACTIVE",
      password: password,
    };

    try {
      const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setNotification({ visible: true, message: result.message, color: 'green' });
      } else {
        const errorData = await response.json();
        setNotification({ visible: true, message: `Error: ${errorData.message}`, color: 'red' });
      }
    } catch (error) {
      setNotification({ visible: true, message: 'Network error. Please try again.', color: 'red' });
    } finally {
      setLoading(false); // Hide loader
    }
  };

  return (
    <Container style={{ marginTop: 45 }}>
      <Title order={2}>Admin Registration</Title>
      <form onSubmit={handleSubmit}>
        <Grid>
          <Grid.Col span={5}>
            <TextInput
              label="First Name"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              placeholder="Enter your first name"
              required
              style={{ maxWidth: 300, marginTop: 10 }}
            />
          </Grid.Col>
          <Grid.Col span={5}>
            <TextInput
              label="Last Name"
              value={lastName}
              onChange={(event) => setLastName(event.currentTarget.value)}
              placeholder="Enter your last name"
              required
              style={{ maxWidth: 300, marginTop: 10 }}
            />
          </Grid.Col>
          <Grid.Col span={5}>
            <TextInput
              label="Username"
              value={username}
              onChange={(event) => setUsername(event.currentTarget.value)}
              placeholder="Enter your username"
              required
              style={{ maxWidth: 300, marginTop: 10 }}
            />
          </Grid.Col>
          <Grid.Col span={5}>
            <TextInput
              label="Email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              placeholder="Enter your email"
              required
              type="email"
              style={{ maxWidth: 300, marginTop: 10 }}
            />
          </Grid.Col>
          <Grid.Col span={5}>
            <TextInput
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              placeholder="Enter your password"
              required
              type="password"
              style={{ maxWidth: 300, marginTop: 10 }}
            />
          </Grid.Col>
          <Grid.Col span={5}>
            <TextInput
              label="Phone Number"
              value={phone}
              onChange={(event) => setPhone(event.currentTarget.value)}
              placeholder="Enter your phone number"
              required
              style={{ maxWidth: 300, marginTop: 10 }}
            />
          </Grid.Col>
        </Grid>

        <Group position="right" mt="md">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader size="sm" /> : 'Register'}
          </Button>
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

      {/* Loader overlay */}
      {loading && (
        <Overlay color="white" opacity={0.5} zIndex={9999}>
          <Loader size="xl" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        </Overlay>
      )}
    </Container>
  );
}