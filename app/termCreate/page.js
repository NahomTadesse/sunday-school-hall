"use client";
import { useState, useEffect } from 'react';
import {
  TextInput,
  Select,
  Button,
  Container,
  Title,
  Notification,
} from '@mantine/core';
import Cookies from 'js-cookie';
export default function CreateTerm() {
  const [halls, setHalls] = useState([]);
  const [selectedHallId, setSelectedHallId] = useState('');
  const [termText, setTermText] = useState('');
  const [notification, setNotification] = useState({ visible: false, message: '', color: '' });
const userDataString = Cookies.get('userData');
const userData = userDataString ? JSON.parse(userDataString) : null;
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/hall',{
          headers: {
            Authorization: `Bearer ${userData?.access_token}`
          }
        });

              if (response.status === 401 || response.status === 403 ) {
   
    window.location.href = '/login';
    throw new Error('Session expired');
  }

        const data = await response.json();
        setHalls(data);
      } catch (error) {
        console.error('Error fetching halls:', error);
      }
    };

    fetchHalls();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedHallId || !termText) {
      setNotification({ visible: true, message: 'Please select a hall and enter the term.', color: 'red' });
      return;
    }

    const body = {
      hallId: selectedHallId,
      termText: termText,
    };

    try {
      const response = await fetch(`https://hall-api.hohitebirhan.com/api/v1/terms/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
            Authorization: `Bearer ${userData?.access_token}`
          
    
        },
        body: JSON.stringify(body),
      });

            if (response.status === 401 || response.status === 403 ) {
   
    window.location.href = '/login';
    throw new Error('Session expired');
  }

      if (response.ok) {
        const data = await response.json();
        console.log("data",data)
        setNotification({ visible: true, message: data.message, color: 'green' });
        setTermText(''); 
        setSelectedHallId(''); 
      } else {
        const errorData = await response.json();
        setNotification({ visible: true, message: `Error: ${errorData.message}`, color: 'red' });
      }
    } catch (error) {
      setNotification({ visible: true, message: 'Network error. Please try again.', color: 'red' });
    }
  };

  return (
    <Container style={{ marginTop: 40 }}>
      <Title style={{marginBottom:20}} order={2}>Create Term</Title>
      {notification.visible && (
        <Notification color={notification.color} onClose={() => setNotification({ ...notification, visible: false })}>
          {notification.message}
        </Notification>
      )}
      <form onSubmit={handleSubmit}>
        <Select
          label="Select Hall"
          placeholder="Choose a hall"
          data={halls.map((hall) => ({ value: hall.id, label: hall.name }))}
          value={selectedHallId}
          onChange={setSelectedHallId}
          required
          style={{ marginBottom: 20 ,maxWidth:300}}
        />
        <TextInput
          label="Term and Condition"
          placeholder="Enter the term text"
          value={termText}
          aria-multiline
          onChange={(event) => setTermText(event.currentTarget.value)}
          required
          style={{ marginBottom: 20 ,maxWidth:300}}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Container>
  );
}