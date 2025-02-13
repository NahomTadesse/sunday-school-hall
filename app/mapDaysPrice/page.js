"use client";
import { useState } from 'react';
import { Container, TextInput, Button, Grid, Title } from '@mantine/core';

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function SetPrices() {

    const [disabled , setDisabled] = useState(true)
  const [prices, setPrices] = useState(
    daysOfWeek.reduce((acc, day) => {
      acc[day] = '';
      return acc;
    }, {})
  );

  const handleChange = (day, value) => {
    setPrices((prev) => ({ ...prev, [day]: value }));
  };

  const handleSubmit = () => {
    console.log('Submitted Prices:', prices);
    // Here you can handle the submission, e.g., send to an API
  };

  return (
    <Container style={{marginTop:45}}>
      <Title order={2}>Set Prices for Each Day of the Week</Title>
      <Grid>
        {daysOfWeek.map((day) => (
          <Grid.Col span={4} key={day}>
            <TextInput
              label={day}
              disabled={disabled}
              value={prices[day]}
              onChange={(event) => handleChange(day, event.currentTarget.value)}
              placeholder="Enter price"
              type="number"
            />
          </Grid.Col>
        ))}
      </Grid>
      <Button onClick={()=>{setDisabled(false)}} mt="md" style={{marginRight:10}}
      
      >Edit Prices</Button>
      <Button onClick={handleSubmit} mt="md">Submit Prices</Button>
    </Container>
  );
};

