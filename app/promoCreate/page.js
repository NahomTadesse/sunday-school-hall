"use client";
import { useState } from 'react';
import {
  TextInput,
  Button,
  Container,
  Title,
  Notification,
  Checkbox,
} from '@mantine/core';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function CreatePromo() {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState();
  const [expiryDate, setExpiryDate] = useState(null);
  const [memberOnly, setMemberOnly] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: '', color: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate input
    if (!promoCode || discountPercentage <= 0 || discountPercentage > 99 || !expiryDate) {
      setNotification({ visible: true, message: 'Please fill in all fields correctly. Discount must be between 1 and 99%.', color: 'red' });
      return;
    }

    const body = {
      code: promoCode,
      discountPercentage: discountPercentage,
      expiryDate: expiryDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      memberOnly: memberOnly,
    };

    try {
      const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/code', {
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
        setPromoCode('');
        setDiscountPercentage();
        setExpiryDate(null);
        setMemberOnly(false);
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
      <Title style={{ marginBottom: 20 }} order={2}>Create Promo</Title>
      {notification.visible && (
        <Notification color={notification.color} onClose={() => setNotification({ ...notification, visible: false })}>
          {notification.message}
        </Notification>
      )}
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Promo Code"
          placeholder="Enter promo code"
          value={promoCode}
          onChange={(event) => setPromoCode(event.currentTarget.value)}
          required
          style={{ marginBottom: 20, maxWidth: 300 }}
        />
        <TextInput
          label="Discount Percentage"
          placeholder="Enter discount percentage"
          type="number"
          value={discountPercentage}
          onChange={(event) => {
            const value = Math.min(Math.max(event.currentTarget.value, 0), 99); // Limit value between 0 and 99
            setDiscountPercentage(value);
          }}
          required
          style={{ marginBottom: 20, maxWidth: 300 }}
        />
        <div style={{ marginBottom: 20, maxWidth: 300 }}>
          <DatePicker
            selected={expiryDate}
            onChange={(date) => setExpiryDate(date)}
            placeholderText="Select expiry date"
            dateFormat="yyyy/MM/dd"
            required
          />
        </div>
        <Checkbox
          label="Member Only"
          checked={memberOnly}
          onChange={(event) => setMemberOnly(event.currentTarget.checked)}
          style={{ marginBottom: 20 }}
        />
        <Button type="submit">Create Promo</Button>
      </form>
    </Container>
  );
}