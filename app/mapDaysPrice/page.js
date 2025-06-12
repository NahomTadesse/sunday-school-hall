"use client";
import { useEffect, useState } from 'react';
import { Container, TextInput, Button, Grid, Title, Loader, Notification,Group,ActionIcon} from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';

export default function SetPrices() {
  const [disabled, setDisabled] = useState(true);
  const [prices, setPrices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submission loader
  const [notification, setNotification] = useState(null); // State for notification

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/payment');
        const result = await response.json();
        
        if (result.success) {
          const priceData = result.data.reduce((acc, item) => {
            acc[item.dayOfWeek] = {
              basePrice: item.basePrice,
              memberPrice: item.memberPrice,
              id: item.id,
            };
            return acc;
          }, {});
          setPrices(priceData);
        }
      } catch (error) {
        console.error('Error fetching prices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, []);

  const handleChange = (day, type, value) => {
    setPrices((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value,
      },
    }));
  };

  const handleSubmit = async (day) => {
    setIsSubmitting(true); // Show loader
    const { basePrice, memberPrice, id } = prices[day];
    
    try {
      const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dayOfWeek: day,
          basePrice: parseFloat(basePrice),
          memberPrice: parseFloat(memberPrice),
          id,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setNotification({ message: result.message, color: 'green' });
      } else {
        setNotification({ message: result.message, color: 'red' });
      }
    } catch (error) {
      console.error('Error submitting prices:', error);
      setNotification({ message: 'An unexpected error occurred. Please try again.', color: 'red' });
    } finally {
      setIsSubmitting(false); // Hide loader
    }
  };

  if (isLoading) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container style={{ marginTop: 45 }}>
      <Group position="apart" style={{ marginBottom: 30 }}>
        <Title order={2}>Set Prices for Each Day of the Week</Title>
        <ActionIcon onClick={() => setDisabled((prev) => !prev)}>
          <IconEdit size={20} />
        </ActionIcon>
      </Group>
      <Grid>
        {Object.keys(prices).map((day) => (
          <Grid.Col span={5} key={day}>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label={`${day}`}
                  disabled={disabled}
                  value={prices[day].basePrice}
                  onChange={(event) => handleChange(day, 'basePrice', event.currentTarget.value)}
                  placeholder="Enter base price"
                  type="number"
                />
              </Grid.Col>
            </Grid>
            <Button onClick={() => handleSubmit(day)} mt="md" disabled={disabled}>
              Submit
            </Button>
          </Grid.Col>
        ))}
      </Grid>

      {/* Loader Overlay */}
      {isSubmitting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <Loader size="xl" />
        </div>
      )}

      {/* Notification */}
      {notification && (
        <Notification
          title={notification.color === 'green' ? 'Success' : 'Error'}
          color={notification.color}
          onClose={() => setNotification(null)}
          style={{ marginTop: 20 }}
        >
          {notification.message}
        </Notification>
      )}
    </Container>
  );
}