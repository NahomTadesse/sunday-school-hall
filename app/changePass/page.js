"use client";
import { useState } from 'react';
import Cookies from 'js-cookie';
import {
  TextInput,
  Button,
  Container,
  Title,
  Notification,
  Loader,
  Overlay,
} from '@mantine/core';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [notification, setNotification] = useState({ visible: false, message: '', color: '' });
  const [loading, setLoading] = useState(false); // Loader state

  // State for password visibility
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate inputs
    if (!oldPassword || !newPassword || !repeatPassword) {
      setNotification({ visible: true, message: 'Please fill in all fields.', color: 'red' });
      return;
    }

    if (newPassword !== repeatPassword) {
      setNotification({ visible: true, message: 'New password and repeat password do not match.', color: 'red' });
      return;
    }

    const userDataString = Cookies.get('userData');
    const userData = userDataString ? JSON.parse(userDataString) : null; 

    const body = {
      userId: userData.userId,
      oldPassword: oldPassword,
      newPassword: newPassword,
    };

    setLoading(true); // Show loader

    try {
      const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/auth/changePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        setNotification({ visible: true, message: data.message, color: 'green' });
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
    <Container style={{ marginTop: 40 }}>
      <Title style={{ marginBottom: 20 }} order={2}>Change Password</Title>
      
      {notification.visible && (
        <Notification color={notification.color} onClose={() => setNotification({ ...notification, visible: false })}>
          {notification.message}
        </Notification>
      )}
      
      {loading && (
        <Overlay opacity={0.7} color="#000" zIndex={1000} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader color="white" size="xl" />
        </Overlay>
      )}
      
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Old Password"
          placeholder="Enter your old password"
          type={showOldPassword ? 'text' : 'password'}
          value={oldPassword}
          onChange={(event) => setOldPassword(event.currentTarget.value)}
          required
          style={{ marginBottom: 20, maxWidth: 300 }}
          rightSection={
            <Button variant="subtle" onClick={() => setShowOldPassword((prev) => !prev)} style={{ padding: 0 }}>
              {showOldPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </Button>
          }
        />
        <TextInput
          label="New Password"
          placeholder="Enter new password"
          type={showNewPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={(event) => setNewPassword(event.currentTarget.value)}
          required
          style={{ marginBottom: 20, maxWidth: 300 }}
          rightSection={
            <Button variant="subtle" onClick={() => setShowNewPassword((prev) => !prev)} style={{ padding: 0 }}>
              {showNewPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </Button>
          }
        />
        <TextInput
          label="Repeat New Password"
          placeholder="Repeat new password"
          type={showRepeatPassword ? 'text' : 'password'}
          value={repeatPassword}
          onChange={(event) => setRepeatPassword(event.currentTarget.value)}
          required
          style={{ marginBottom: 20, maxWidth: 300 }}
          rightSection={
            <Button variant="subtle" onClick={() => setShowRepeatPassword((prev) => !prev)} style={{ padding: 0 }}>
              {showRepeatPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </Button>
          }
        />
        <Button type="submit">Change Password</Button>
      </form>
    </Container>
  );
}