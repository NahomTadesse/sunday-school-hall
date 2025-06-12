"use client";
import { useState } from 'react';
import { Container, TextInput, Button, Title } from '@mantine/core';

export default function SetDiscount () {
  const [discount, setDiscount] = useState('');

  const handleChange = (event) => {
    setDiscount(event.currentTarget.value);
  };

  const handleSubmit = () => {
    console.log('Submitted Discount Percentage:', discount);
    
  };

  return (
    <Container style={{marginTop:45}}>
      <Title order={2}>Set Discount Percentage for All Members</Title>
      <TextInput
        label="Discount Percentage"
        value={discount}
        onChange={handleChange}
        placeholder="Enter discount percentage"
        type="number"
        min={0}
        max={100}
        style={{maxWidth:300 ,marginTop:20}}
      />
      <Button onClick={handleSubmit} mt="md">Apply Discount</Button>
    </Container>
  );
};

