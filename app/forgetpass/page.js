"use client"
import { useState } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import {
  Anchor,
  Box,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Paper,
  Text,
  TextInput,
  Title,
  Notification,
} from '@mantine/core';
import { useRouter } from 'next/navigation';
import classes from './ForgotPassword.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: '', color: '' });
const router = useRouter();
  const handleResetPassword = async () => {
    if (!email) {
      setNotification({ visible: true, message: 'Please enter your email', color: 'red' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://hall-api.hohitebirhan.com/api/v1/auth/forgot-password?principal=${email}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to send reset link');
      }

      setNotification({ visible: true, message: 'Reset link sent! Check your email.', color: 'green' });
      setEmail(''); // Clear the input after success
    } catch (error) {
      setNotification({ visible: true, message: error.message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={460} my={30}>
      <Title className={classes.title} ta="center">
        Forgot your password?
      </Title>
      <Text c="dimmed" fz="sm" ta="center">
        Enter your email to get a reset link
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <TextInput
          label="Your email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
        />
        <Group justify="space-between" mt="lg" className={classes.controls}>
          <Anchor c="dimmed" size="sm" className={classes.control} onClick={()=>{router.push('/')}} >
            <Center inline>
              <IconArrowLeft size={12} stroke={1.5} />
              <Box ml={5}>cancel</Box>
            </Center>
          </Anchor>
          <Button className={classes.control} onClick={handleResetPassword} disabled={loading}>
            {loading ? <Loader size={14} color="white" /> : 'Reset password'}
          </Button>
        </Group>
      </Paper>

      {notification.visible && (
        <Notification color={notification.color} onClose={() => setNotification({ ...notification, visible: false })}>
          {notification.message}
        </Notification>
      )}
    </Container>
  );
}