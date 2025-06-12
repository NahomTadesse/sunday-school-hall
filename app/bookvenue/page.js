"use client";
import { useState, useEffect } from 'react';
import {
  TextInput,
  Select,
  Button,
  Group,
  Container,
  Title,
  Notification,
  Grid,
  Text,
  Loader,
  Modal,
  Checkbox,
} from '@mantine/core';


import { DateTimePicker } from '@mantine/dates';
import '@mantine/dates/styles.css'
import 'dayjs/locale/am';
import Cookies from 'js-cookie';

const userDataString = Cookies.get('userData');
const userDataA = userDataString ? JSON.parse(userDataString) : null; 
export default function MyForm() {
  const [fullName, setFullName] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); 

  const [endDate, setEndDate] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [alternativePhoneNumber, setAlternativePhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [price, setPrice] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [hallId, setHallId] = useState('');
  const [halls, setHalls] = useState([]);
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [selectedPromoCode, setSelectedPromoCode] = useState('');
  const [notification, setNotification] = useState({ visible: false, message: '', color: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedTerms, setSelectedTerms] = useState([]);
  const [purpose, setPurpose] = useState('');
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(false); // Loader state
  const [modalOpened, setModalOpened] = useState(false); // Modal state

  useEffect(() => {
    const fetchHalls = async () => {
      setLoading(true); // Show loader
      console.log('tokennnn',userDataA.access_token)
      try {
        const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/hall',{
          headers:{
            'Authorization': `Bearer ${userDataA.access_token}`
          }
        });
        const data = await response.json();
        setHalls(data);
      } catch (error) {
        console.error('Error fetching halls:', error);
      } finally {
        setLoading(false); // Hide loader
      }
    };

    const fetchDaysOfWeek = async () => {
      setLoading(true); // Show loader
      try {
        const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/payment',{
          headers:{
            'Authorization': `Bearer ${userDataA.access_token}`
          }
        });
        const result = await response.json();
        if (result.success) {
          const days = result.data.map(item => ({
            value: item.id,
            label: item.dayOfWeek,
            basePrice: item.basePrice,
            memberPrice: item.memberPrice,
          }));
          setDaysOfWeek(days);
        }
      } catch (error) {
        console.error('Error fetching days of week:', error);
      } finally {
        setLoading(false); // Hide loader
      }
    };

    const fetchPromoCodes = async () => {
      setLoading(true); // Show loader
      try {
        const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/code',{
          headers:{
            'Authorization': `Bearer ${userDataA.access_token}`
          }
        });
        const result = await response.json();
        if (result.success) {
          const codes = result.data.map(code => ({
            value: code.code,
            label: code.code,
          }));
          setPromoCodes(codes);
        }
      } catch (error) {
        console.error('Error fetching promo codes:', error);
      } finally {
        setLoading(false); // Hide loader
      }
    };

    fetchHalls();
    fetchDaysOfWeek();
    fetchPromoCodes();
  }, []);

  const handleHallChange = (value) => {
    const selectedHall = halls.find(hall => hall.id === value);
    if (selectedHall) {
      setHallId(value);
      setSelectedTerms(selectedHall.terms);
      setPrice(isMember ? selectedDay.memberPrice : selectedDay.basePrice);
    }
  };

  const handleDayChange = (value) => {
    const selected = daysOfWeek.find(day => day.value === value);
    if (selected) {
      setSelectedDay(selected);
      setPrice(isMember ? selected.memberPrice : selected.basePrice);
    }
  };

  const userDataString = Cookies.get('userData');
  const userData = userDataString ? JSON.parse(userDataString) : null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation
    if (!fullName || !selectedDay || !phoneNumber || !email || !hallId || !termsAccepted || !selectedDate) {
      setNotification({ visible: true, message: 'Please fill in all fields and accept the terms.', color: 'red' });
      return;
    }

    if (!selectedDate || !endDate) {
      setNotification({ 
        visible: true, 
        message: 'Please select both start and end dates', 
        color: 'red' 
      });
      return;
    }
  
    // Check end date is after start date
    if (endDate <= selectedDate) {
      setNotification({ 
        visible: true, 
        message: 'End date must be after start date', 
        color: 'red' 
      });
      return;
    }

    setLoading(true); // Show loader
    const body = {
      hallId: hallId,
      startDateTime: selectedDate.toISOString(),
      endDateTime: endDate.toISOString(),
      customerName: fullName,
      email: email,
      phone: phoneNumber,
      alternativePhoneNumber: alternativePhoneNumber,
      specialRequests: specialRequests,
      termsAccepted: termsAccepted,
      member: isMember,
      promoCode: isMember ? selectedPromoCode : '',
      userId: userData.userId,
      purpose: purpose,
      eventName: eventName,
    };
    console.log('bodyyy',body)

    try {
      const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/book/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userDataA.access_token}`
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
    <Container style={{ marginTop: 40, alignSelf: "center" }}>
      <Title order={2}>BOOK VENUE</Title>
      {notification.visible && (
        <Notification color={notification.color} onClose={() => setNotification({ ...notification, visible: false })}>
          {notification.message}
        </Notification>
      )}
      {loading && (
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
      <form onSubmit={handleSubmit}>
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(event) => setFullName(event.currentTarget.value)}
              style={{ marginTop: 10, maxWidth: 300 }}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Select Hall"
              placeholder="Choose a hall"
              data={halls.map((hall) => ({ value: hall.id, label: hall.name }))}
              value={hallId}
              onChange={handleHallChange}
              style={{ marginTop: 10, maxWidth: 300 }}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Select Day of the Week"
              placeholder="Select a day"
              data={daysOfWeek}
              value={selectedDay?.value}
              onChange={handleDayChange}
              style={{ marginTop: 10, maxWidth: 300 }}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Phone Number"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.currentTarget.value)}
              style={{ marginTop: 10, maxWidth: 300 }}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Alternative Phone Number"
              placeholder="Enter alternative phone number"
              value={alternativePhoneNumber}
              onChange={(event) => setAlternativePhoneNumber(event.currentTarget.value)}
              style={{ marginTop: 10, maxWidth: 300 }}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              required
              type="email"
              style={{ marginTop: 10, maxWidth: 300 }}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Special Requests"
              placeholder="Any special requests?"
              value={specialRequests}
              onChange={(event) => setSpecialRequests(event.currentTarget.value)}
              style={{ marginTop: 10, maxWidth: 300 }}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Price for the selected day"
              placeholder="Price"
              disabled
              value={price}
              style={{ marginTop: 10, maxWidth: 300 }}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Purpose of Booking"
              placeholder="e.g., Wedding, Conference"
              value={purpose}
              onChange={(event) => setPurpose(event.currentTarget.value)}
              style={{ marginTop: 10, maxWidth: 300 }}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Event Name"
              placeholder="e.g., Ato Abel and Wro Chini Wedding"
              value={eventName}
              onChange={(event) => setEventName(event.currentTarget.value)}
              style={{ marginTop: 10, maxWidth: 300 }}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
    <DateTimePicker
     locale='am'
      label="Start Date"
      placeholder="Select start date"
      value={selectedDate}
      onChange={setSelectedDate}
      style={{ marginTop: 10, maxWidth: 300 }}
      required
    />
  </Grid.Col>
  
  <Grid.Col span={6}>
    <DateTimePicker
     locale='am'
      label="End Date"
      placeholder="Select end date"
      value={endDate}
      onChange={setEndDate}
      style={{ marginTop: 10, maxWidth: 300 }}
      required
      minDate={selectedDate} // Ensures end date can't be before start date
    />
  </Grid.Col>
        </Grid>

        

   

        <div style={{ marginTop: 20 }}>
          <Button onClick={() => setModalOpened(true)}>View Terms</Button>
        </div>

        <Checkbox
          label="I'm a member"
          checked={isMember}
          onChange={(event) => {
            const isChecked = event.currentTarget.checked;
            setIsMember(isChecked);
            setPrice(isChecked && selectedDay ? selectedDay.memberPrice : selectedDay ? selectedDay.basePrice : '2000ETB');
          }}
          style={{ marginTop: 20 }}
        />

        {isMember && (
          <Select
            label="Select Promo Code"
            placeholder="Choose a promo code"
            data={promoCodes}
            value={selectedPromoCode}
            onChange={setSelectedPromoCode}
            style={{ marginTop: 10, maxWidth: 300 }}
          />
        )}

        <Group position="right" mt="md">
          <Button type="submit">BOOK</Button>
        </Group>
      </form>

      {/* Modal for Terms and Conditions */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Terms and Conditions"
        size="lg"
      >
        {selectedTerms.length > 0 ? (
          selectedTerms.map((term) => (
            <Text key={term.id}>{term.termsText}</Text>
          ))
        ) : (
          <Text>No terms available for the selected hall.</Text>
        )}
        <Group position="right" mt="md">
          <Button onClick={() => {
            setTermsAccepted(true);
            setModalOpened(false);
          }}>Accept</Button>
          <Button onClick={() => setModalOpened(false)}>Decline</Button>
        </Group>
      </Modal>
    </Container>
  );
}