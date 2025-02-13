"use client";
import { useState } from 'react';
import {
  TextInput,
  Select,
  Textarea,
  Checkbox,
  Button,
  Group,
  Container,
  Title,
} from '@mantine/core';
import { ColorSchemeToggle } from '../../components/ColorSchemeToggle/ColorSchemeToggle';

const availableDates = [
  { value: '2025-01-01', label: 'January 1, 2025 (Sunday)' },
  { value: '2025-01-02', label: 'January 2, 2025 (Monday)' },
  { value: '2025-01-03', label: 'January 3, 2025 (Thursday)' },
  // Add more dates as needed
];

export default function MyForm() {
  const [fullName, setFullName] = useState('');
  const [date, setDate] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isMember, setIsMember] = useState(false);

  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');
  const floating = value.trim().length !== 0 || focused || undefined


  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log({ fullName, date, phoneNumber, email, isMember });
  };

  return (
    <Container style={{marginTop:40,alignSelf:"center"}}>
      <Title order={2}>BOOK VENUE</Title>


    
      <form onSubmit={handleSubmit}>

      {/* <TextInput
      label="Floating label"
      placeholder="OMG, it also has a placeholder"
      required
      classNames={classes}
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      mt="md"
      autoComplete="nope"
      data-floating={floating}
      labelProps={{ 'data-floating': floating }}
    />  */}
    
        <TextInput
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(event) => setFullName(event.currentTarget.value)}
          style={{width:"50%",marginTop:10}}
          styles={{ input: { height: '40px' } }}
          required
        />
        <Select
          label="Available Date"
          placeholder="Select a date"
          data={availableDates}
          value={date}
          onChange={setDate}
          style={{width:"50%",marginTop:10}}
          styles={{ input: { height: '40px' } }}
          required
        />
        <TextInput
          label="Phone Number"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.currentTarget.value)}
          style={{width:"50%",marginTop:10}}
          styles={{ input: { height: '40px' } }}
          required
        />
        <TextInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          required
          type="email"
          style={{width:"50%",marginTop:10}}
          styles={{ input: { height: '40px' } }}
        />
        <Checkbox
          label="I'm a member"
          checked={isMember}
          onChange={(event) => setIsMember(event.currentTarget.checked)}
          style={{marginTop:20}}
        />
        <Group position="right" mt="md">
          <Button type="submit">BOOK</Button>
        </Group>
      </form>
   
    </Container>
  );
}