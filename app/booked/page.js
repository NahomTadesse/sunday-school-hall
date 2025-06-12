"use client";
import { useEffect, useState } from 'react';
import {
  Button,
  Center,
  Group,
  Loader,
  ScrollArea,
  Table,
  Text,
  Title,
  Notification,
  Select,
  TextInput,
} from '@mantine/core';
import { IconCheck, IconX, IconSearch } from '@tabler/icons-react';
import Cookies from 'js-cookie';

const userDataString = Cookies.get('userData');
const userData = userDataString ? JSON.parse(userDataString) : null; 
export default function BookingTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // Loader for accept/reject actions
  const [notification, setNotification] = useState({ visible: false, message: '', color: '' });
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    console.log('userData',userData.access_token)
    setLoading(true); // Show loader while fetching bookings
    try {
      const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/book',{
        headers:{
          'Authorization': `Bearer ${userData.access_token}`
        }
      });
      const data = await response.json();
      console.log('data',data)
      setBookings(data);
    } catch (error) {
      console.log('ee',error)
      setNotification({ visible: true, message: 'Failed to fetch bookings.', color: 'red' });
    } finally {
      setLoading(false); // Hide loader after fetching
    }
  };

  const handleAccept = async (id) => {
    setActionLoading(true); // Show loader for accept action
    try {
      const response = await fetch(`https://hall-api.hohitebirhan.com/api/v1/book/confirm/${id}`, {
        method: 'PUT',
      });
  
      if (response.ok) {
        // Parse the JSON response
        const data = await response.json();
        // Access the message from the parsed data
        setNotification({ visible: true, message: data.message, color: 'green' });
        fetchBookings();
      } else {
        setNotification({ visible: true, message: 'Failed to accept booking.', color: 'red' });
      }
    } catch (error) {
      setNotification({ visible: true, message: 'Network error. Please try again.', color: 'red' });
    } finally {
      setActionLoading(false); // Hide loader after action
    }
  };

  const handleReject = async (id) => {
    setActionLoading(true); // Show loader for reject action
    try {
      const response = await fetch(`https://hall-api.hohitebirhan.com/api/v1/book/reject/${id}`, {
        method: 'PUT',
      });

      if (response.ok) {
        setNotification({ visible: true, message: 'Booking rejected.', color: 'red' });
        fetchBookings();
      } else {
        setNotification({ visible: true, message: 'Failed to reject booking.', color: 'red' });
      }
    } catch (error) {
      setNotification({ visible: true, message: 'Network error. Please try again.', color: 'red' });
    } finally {
      setActionLoading(false); // Hide loader after action
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    return (
      booking.customerName.toLowerCase().includes(search.toLowerCase()) ||
      booking.phoneNumber.includes(search) ||
      booking.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const sortedBookings = filteredBookings.sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const rows = sortedBookings.map((booking) => (
    <Table.Tr key={booking.id}>
      <Table.Td>{booking.customerName}</Table.Td>
      <Table.Td>{booking.phoneNumber}</Table.Td>
      <Table.Td>{booking.email}</Table.Td>
      <Table.Td>{booking.finalPrice}</Table.Td>
      <Table.Td>{booking.amountPaid}</Table.Td>
      {/* <Table.Td>
        <Select
          data={[
            { value: 'capacity', label: `Capacity: ${booking.hall.capacity}` },
            { value: 'availability', label: `Availability: ${booking.hall.availability ? 'Yes' : 'No'}` },
            { value: 'facilities', label: `Facilities: ${booking.hall.facilities.join(', ')}` },
          ]}
          placeholder={booking.hall.name}
          disabled
        />
      </Table.Td> */}
      <Table.Td>{booking.
startingBookingDate}</Table.Td>
      <Table.Td>{booking.bookingStatus}</Table.Td>
      <Table.Td>{booking.paymentStatus || 'N/A'}</Table.Td> {/* Displaying payment status */}
      <Table.Td>{booking.member ? 'Yes' : 'No'}</Table.Td> {/* Displaying member status */}
      <Table.Td>{new Date(booking.createdAt).toLocaleDateString()}</Table.Td> {/* Displaying created at date */}
      <Table.Td>
        {booking.bookingStatus === 'PENDING' && (
          <Group spacing="xs">
            <Button
              onClick={() => handleAccept(booking.id)}
              variant="light"
              color="green"
              leftIcon={<IconCheck />}
              loading={actionLoading} // Show loader on button while action is ongoing
            >
              Accept
            </Button>
            <Button
              onClick={() => handleReject(booking.id)}
              variant="light"
              color="red"
              leftIcon={<IconX />}
              loading={actionLoading} // Show loader on button while action is ongoing
            >
              Reject
            </Button>
          </Group>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea>
      <Title order={2} style={{ marginTop: 45, marginLeft: 20 }}>Booking Requests</Title>
      {notification.visible && (
        <Notification color={notification.color} onClose={() => setNotification({ ...notification, visible: false })}>
          {notification.message}
        </Notification>
      )}
      {loading || actionLoading ? (
        <Center style={{ height: '100vh' }}>
          <Loader />
        </Center>
      ) : (
        <>
          <Group position="apart" style={{ margin: '20px' }}>
            <TextInput
              placeholder="Search by name, phone number, or email"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              icon={<IconSearch size={16} />}
            />
            <Select
              placeholder="Sort by"
              data={[
                { value: 'customerName', label: 'Customer Name' },
                { value: 'phoneNumber', label: 'Phone Number' },
                { value: 'email', label: 'Email' },
                { value: 'bookingDate', label: 'Booking Date' },
              ]}
              onChange={(value) => setSortField(value)}
            />
            <Select
              placeholder="Sort Direction"
              data={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              onChange={(value) => setSortDirection(value)}
            />
          </Group>
          <Table horizontalSpacing="md" verticalSpacing="xs" miw={700}>
            <Table.Tbody>
              <Table.Tr>
                <Table.Th>Customer Name</Table.Th>
                <Table.Th>Phone Number</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Final Price</Table.Th>
                <Table.Th>Amount Paid</Table.Th>
                {/* <Table.Th>Hall</Table.Th> */}
                <Table.Th>Booking Date</Table.Th>
                <Table.Th>Booking Status</Table.Th>
                <Table.Th>Payment Status</Table.Th> {/* New column */}
                <Table.Th>Member</Table.Th> {/* New column */}
                <Table.Th>Created At</Table.Th> {/* New column */}
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={12}>
                    <Text fw={500} ta="center">
                      No bookings found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </>
      )}
    </ScrollArea>
  );
}