// "use client";
// import { useEffect, useState } from 'react';
// import {
//   Button,
//   Center,
//   Group,
//   Loader,
//   ScrollArea,
//   Table,
//   Text,
//   Title,
//   Notification,
//   Select,
//   TextInput,
// } from '@mantine/core';
// import { IconCheck, IconX, IconSearch } from '@tabler/icons-react';
// import Cookies from 'js-cookie';

// const userDataString = Cookies.get('userData');
// const userData = userDataString ? JSON.parse(userDataString) : null; 
// export default function BookingTable() {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false); // Loader for accept/reject actions
//   const [notification, setNotification] = useState({ visible: false, message: '', color: '' });
//   const [search, setSearch] = useState('');
//   const [sortField, setSortField] = useState(null);
//   const [sortDirection, setSortDirection] = useState('asc');

//   useEffect(() => {
//     fetchBookings();
//   }, []);

//   const fetchBookings = async () => {
//     console.log('userData',userData.access_token)
//     setLoading(true); // Show loader while fetching bookings
//     try {
//       const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/book',{
//         headers:{
//           'Authorization': `Bearer ${userData.access_token}`
//         }
//       });
//       const data = await response.json();
//       console.log('data',data)
//       setBookings(data);
//     } catch (error) {
//       console.log('ee',error)
//       setNotification({ visible: true, message: 'Failed to fetch bookings.', color: 'red' });
//     } finally {
//       setLoading(false); // Hide loader after fetching
//     }
//   };

//   const handleAccept = async (id) => {
//     setActionLoading(true); // Show loader for accept action
//     try {
//       const response = await fetch(`https://hall-api.hohitebirhan.com/api/v1/book/confirm/${id}`, {
//         method: 'PUT',
//       });
  
//       if (response.ok) {
//         // Parse the JSON response
//         const data = await response.json();
//         // Access the message from the parsed data
//         setNotification({ visible: true, message: data.message, color: 'green' });
//         fetchBookings();
//       } else {
//         setNotification({ visible: true, message: 'Failed to accept booking.', color: 'red' });
//       }
//     } catch (error) {
//       setNotification({ visible: true, message: 'Network error. Please try again.', color: 'red' });
//     } finally {
//       setActionLoading(false); // Hide loader after action
//     }
//   };

//   const handleReject = async (id) => {
//     setActionLoading(true); // Show loader for reject action
//     try {
//       const response = await fetch(`https://hall-api.hohitebirhan.com/api/v1/book/reject/${id}`, {
//         method: 'PUT',
//       });

//       if (response.ok) {
//         setNotification({ visible: true, message: 'Booking rejected.', color: 'red' });
//         fetchBookings();
//       } else {
//         setNotification({ visible: true, message: 'Failed to reject booking.', color: 'red' });
//       }
//     } catch (error) {
//       setNotification({ visible: true, message: 'Network error. Please try again.', color: 'red' });
//     } finally {
//       setActionLoading(false); // Hide loader after action
//     }
//   };

//   const filteredBookings = bookings.filter((booking) => {
//     return (
//       booking.customerName.toLowerCase().includes(search.toLowerCase()) ||
//       booking.phoneNumber.includes(search) ||
//       booking.email.toLowerCase().includes(search.toLowerCase())
//     );
//   });

//   const sortedBookings = filteredBookings.sort((a, b) => {
//     if (!sortField) return 0;

//     const aValue = a[sortField];
//     const bValue = b[sortField];

//     if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
//     if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
//     return 0;
//   });

//   const rows = sortedBookings.map((booking) => (
//     <Table.Tr key={booking.id}>
//       <Table.Td>{booking.customerName}</Table.Td>
//       <Table.Td>{booking.phoneNumber}</Table.Td>
//       <Table.Td>{booking.email}</Table.Td>
//       <Table.Td>{booking.finalPrice}</Table.Td>
//       <Table.Td>{booking.amountPaid}</Table.Td>
//       {/* <Table.Td>
//         <Select
//           data={[
//             { value: 'capacity', label: `Capacity: ${booking.hall.capacity}` },
//             { value: 'availability', label: `Availability: ${booking.hall.availability ? 'Yes' : 'No'}` },
//             { value: 'facilities', label: `Facilities: ${booking.hall.facilities.join(', ')}` },
//           ]}
//           placeholder={booking.hall.name}
//           disabled
//         />
//       </Table.Td> */}
//       <Table.Td>{booking.
// startingBookingDate}</Table.Td>
//       <Table.Td>{booking.bookingStatus}</Table.Td>
//       <Table.Td>{booking.paymentStatus || 'N/A'}</Table.Td> {/* Displaying payment status */}
//       <Table.Td>{booking.member ? 'Yes' : 'No'}</Table.Td> {/* Displaying member status */}
//       <Table.Td>{new Date(booking.createdAt).toLocaleDateString()}</Table.Td> {/* Displaying created at date */}
//       <Table.Td>
//         {booking.bookingStatus === 'PENDING' && (
//           <Group spacing="xs">
//             <Button
//               onClick={() => handleAccept(booking.id)}
//               variant="light"
//               color="green"
//               leftIcon={<IconCheck />}
//               loading={actionLoading} // Show loader on button while action is ongoing
//             >
//               Accept
//             </Button>
//             <Button
//               onClick={() => handleReject(booking.id)}
//               variant="light"
//               color="red"
//               leftIcon={<IconX />}
//               loading={actionLoading} // Show loader on button while action is ongoing
//             >
//               Reject
//             </Button>
//           </Group>
//         )}
//       </Table.Td>
//     </Table.Tr>
//   ));

//   return (
//     <ScrollArea>
//       <Title order={2} style={{ marginTop: 45, marginLeft: 20 }}>Booking Requests</Title>
//       {notification.visible && (
//         <Notification color={notification.color} onClose={() => setNotification({ ...notification, visible: false })}>
//           {notification.message}
//         </Notification>
//       )}
//       {loading || actionLoading ? (
//         <Center style={{ height: '100vh' }}>
//           <Loader />
//         </Center>
//       ) : (
//         <>
//           <Group position="apart" style={{ margin: '20px' }}>
//             <TextInput
//               placeholder="Search by name, phone number, or email"
//               value={search}
//               onChange={(event) => setSearch(event.currentTarget.value)}
//               icon={<IconSearch size={16} />}
//             />
//             <Select
//               placeholder="Sort by"
//               data={[
//                 { value: 'customerName', label: 'Customer Name' },
//                 { value: 'phoneNumber', label: 'Phone Number' },
//                 { value: 'email', label: 'Email' },
//                 { value: 'bookingDate', label: 'Booking Date' },
//               ]}
//               onChange={(value) => setSortField(value)}
//             />
//             <Select
//               placeholder="Sort Direction"
//               data={[
//                 { value: 'asc', label: 'Ascending' },
//                 { value: 'desc', label: 'Descending' },
//               ]}
//               onChange={(value) => setSortDirection(value)}
//             />
//           </Group>
//           <Table horizontalSpacing="md" verticalSpacing="xs" miw={700}>
//             <Table.Tbody>
//               <Table.Tr>
//                 <Table.Th>Customer Name</Table.Th>
//                 <Table.Th>Phone Number</Table.Th>
//                 <Table.Th>Email</Table.Th>
//                 <Table.Th>Final Price</Table.Th>
//                 <Table.Th>Amount Paid</Table.Th>
//                 {/* <Table.Th>Hall</Table.Th> */}
//                 <Table.Th>Booking Date</Table.Th>
//                 <Table.Th>Booking Status</Table.Th>
//                 <Table.Th>Payment Status</Table.Th> {/* New column */}
//                 <Table.Th>Member</Table.Th> {/* New column */}
//                 <Table.Th>Created At</Table.Th> {/* New column */}
//                 <Table.Th>Actions</Table.Th>
//               </Table.Tr>
//               {rows.length > 0 ? (
//                 rows
//               ) : (
//                 <Table.Tr>
//                   <Table.Td colSpan={12}>
//                     <Text fw={500} ta="center">
//                       No bookings found
//                     </Text>
//                   </Table.Td>
//                 </Table.Tr>
//               )}
//             </Table.Tbody>
//           </Table>
//         </>
//       )}
//     </ScrollArea>
//   );
// }

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
  Badge,
  Card,

  Pagination,
  Paper,
  Stack,

  Tooltip,
} from '@mantine/core';
import { 
  IconCheck, 
  IconX, 
  IconSearch, 

  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react';
import Cookies from 'js-cookie';

const userDataString = Cookies.get('userData');
const userData = userDataString ? JSON.parse(userDataString) : null;

// Status badge colors
const statusColors = {
  PENDING: 'yellow',
  CONFIRMED: 'green',
  REJECTED: 'red',
  CANCELLED: 'gray',
  COMPLETED: 'blue',
};

// Payment status colors
const paymentStatusColors = {
  PAID: 'green',
  PENDING: 'orange',
  UNPAID: 'red',
  PARTIAL: 'cyan',
};

export default function BookingTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Track which booking is being processed
  const [notification, setNotification] = useState({ visible: false, message: '', color: '' });
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // 5 items per page as requested

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/book', {
        headers: {
          'Authorization': `Bearer ${userData?.access_token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      setNotification({ visible: true, message: 'Failed to fetch bookings.', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`https://hall-api.hohitebirhan.com/api/v1/book/confirm/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userData?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotification({ visible: true, message: data.message || 'Booking accepted successfully!', color: 'green' });
        fetchBookings();
      } else {
        const errorData = await response.json();
        setNotification({ visible: true, message: errorData.message || 'Failed to accept booking.', color: 'red' });
      }
    } catch (error) {
      setNotification({ visible: true, message: 'Network error. Please try again.', color: 'red' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`https://hall-api.hohitebirhan.com/api/v1/book/reject/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userData?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotification({ visible: true, message: data.message || 'Booking rejected.', color: 'orange' });
        fetchBookings();
      } else {
        const errorData = await response.json();
        setNotification({ visible: true, message: errorData.message || 'Failed to reject booking.', color: 'red' });
      }
    } catch (error) {
      setNotification({ visible: true, message: 'Network error. Please try again.', color: 'red' });
    } finally {
      setActionLoading(null);
    }
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter bookings based on search
  const filteredBookings = bookings.filter((booking: any) => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      booking.customerName?.toLowerCase().includes(searchLower) ||
      booking.phoneNumber?.includes(search) ||
      booking.email?.toLowerCase().includes(searchLower) ||
      booking.bookingStatus?.toLowerCase().includes(searchLower) ||
      booking.paymentStatus?.toLowerCase().includes(searchLower)
    );
  });

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a: any, b: any) => {
    if (!sortField) return 0;

    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle date fields
    if (sortField === 'startingBookingDate' || sortField === 'createdAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);
  const paginatedBookings = sortedBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const rows = paginatedBookings.map((booking: any) => (
    <Table.Tr key={booking.id} style={{ transition: 'background-color 0.2s' }}>
      <Table.Td>
        <Group gap="xs">
          {/* <ThemeIcon variant="light" color="blue" size="sm" radius="xl">
            <IconUser size={14} />
          </ThemeIcon> */}
          <Text size="sm" fw={500}>{booking.customerName}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {/* <ThemeIcon variant="light" color="green" size="sm" radius="xl">
            <IconPhone size={14} />
          </ThemeIcon> */}
          <Text size="sm">{booking.phoneNumber}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {/* <ThemeIcon variant="light" color="grape" size="sm" radius="xl">
            <IconMail size={14} />
          </ThemeIcon> */}
          <Text size="sm">{booking.email}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          {/* <IconCurrency size={14} /> */}
          <Text size="sm" fw={500}>{booking.finalPrice?.toLocaleString()}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          {/* <IconCurrency size={14} /> */}
          <Text size="sm" fw={500}>{booking.amountPaid?.toLocaleString()}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {/* <ThemeIcon variant="light" color="cyan" size="sm" radius="xl">
            <IconCalendar size={14} />
          </ThemeIcon> */}
          <Text size="sm">{formatDate(booking.startingBookingDate)}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge 
          color={statusColors[booking.bookingStatus as keyof typeof statusColors] || 'gray'}
          variant="light"
          size="lg"
          radius="sm"
        >
          {booking.bookingStatus}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge 
          color={paymentStatusColors[booking.paymentStatus as keyof typeof paymentStatusColors] || 'gray'}
          variant="light"
          size="lg"
          radius="sm"
        >
          {booking.paymentStatus || 'N/A'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge 
          color={booking.member ? 'teal' : 'gray'}
          variant="light"
          size="lg"
          radius="sm"
        >
          {booking.member ? 'Yes' : 'No'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {/* <ThemeIcon variant="light" color="gray" size="sm" radius="xl">
            <IconClock size={14} />
          </ThemeIcon> */}
          <Text size="sm">{formatDate(booking.createdAt)}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        {booking.bookingStatus === 'PENDING' && (
          <Group gap="xs">
            <Tooltip label="Accept Booking">
              <Button
                onClick={() => handleAccept(booking.id)}
                variant="light"
                color="green"
                size="xs"
                leftSection={<IconCheck size={14} />}
                loading={actionLoading === booking.id}
                loaderProps={{ type: 'dots' }}
              >
                Accept
              </Button>
            </Tooltip>
            <Tooltip label="Reject Booking">
              <Button
                onClick={() => handleReject(booking.id)}
                variant="light"
                color="red"
                size="xs"
                leftSection={<IconX size={14} />}
                loading={actionLoading === booking.id}
                loaderProps={{ type: 'dots' }}
              >
                Reject
              </Button>
            </Tooltip>
          </Group>
        )}
        {booking.bookingStatus !== 'PENDING' && (
          <Badge color="gray" variant="light" size="lg" radius="sm">
            Processed
          </Badge>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  if (loading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Stack align="center" gap="md">
          <Loader size="xl" type="dots" />
          <Text c="dimmed" size="sm">Loading bookings...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Paper p="md" radius="md" withBorder style={{ margin: 20 }}>
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Title order={2} style={{ color: '#1c7ed6' }}>
            Booking Requests
          </Title>
          <Badge size="lg" variant="filled" color="blue">
            Total: {filteredBookings.length} Bookings
          </Badge>
        </Group>

        {/* Notification */}
        {notification.visible && (
          <Notification 
            color={notification.color} 
            onClose={() => setNotification({ ...notification, visible: false })}
            withBorder
            radius="md"
          >
            {notification.message}
          </Notification>
        )}

        {/* Search and Sort Controls */}
        <Card withBorder radius="md" p="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                placeholder="Search by name, phone, email, or status..."
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                leftSection={<IconSearch size={16} />}
                radius="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 3 }}>
              <Select
                placeholder="Sort by"
                data={[
                  { value: 'customerName', label: 'Customer Name' },
                  { value: 'phoneNumber', label: 'Phone Number' },
                  { value: 'email', label: 'Email' },
                  { value: 'startingBookingDate', label: 'Booking Date' },
                  { value: 'finalPrice', label: 'Price' },
                  { value: 'createdAt', label: 'Created At' },
                ]}
                onChange={(value) => {
                  setSortField(value);
                  setCurrentPage(1);
                }}
                clearable
                radius="md"
                leftSection={<IconSortAscending size={16} />}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 3 }}>
              <Select
                placeholder="Sort Direction"
                data={[
                  { value: 'asc', label: 'Ascending' },
                  { value: 'desc', label: 'Descending' },
                ]}
                onChange={(value) => {
                  setSortDirection(value || 'asc');
                  setCurrentPage(1);
                }}
                disabled={!sortField}
                radius="md"
                leftSection={<IconSortDescending size={16} />}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Table */}
        <ScrollArea>
          <Table 
            horizontalSpacing="md" 
            verticalSpacing="md" 
            miw={1200}
            striped
            highlightOnHover
            withRowBorders
            withColumnBorders={false}
          >
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Customer</Table.Th>
                <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Phone</Table.Th>
                <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Email</Table.Th>
                <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Final Price</Table.Th>
                <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Amount Paid</Table.Th>
                <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Booking Date</Table.Th>
                <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Status</Table.Th>
                <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Payment</Table.Th>
                <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Member</Table.Th>
                <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Created</Table.Th>
                <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={11}>
                    <Stack align="center" py="xl">
                      <Text fw={500} ta="center" size="lg" c="dimmed">
                        No bookings found
                      </Text>
                      <Text size="sm" c="dimmed">
                        {search ? 'Try adjusting your search criteria' : 'There are no booking requests to display'}
                      </Text>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination
              total={totalPages}
              value={currentPage}
              onChange={setCurrentPage}
              withEdges
              radius="md"
              size="sm"
            />
          </Group>
        )}

        {/* Items per page indicator */}
        <Group justify="flex-end" mt="xs">
          <Text size="sm" c="dimmed">
            Showing {paginatedBookings.length} of {filteredBookings.length} bookings
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}

// Helper Grid component since it wasn't imported
const Grid = ({ children, ...props }) => (
  <div style={{ display: 'grid', gap: '16px', ...props }}>{children}</div>
);

Grid.Col = ({ span, children }) => {
  const getSpan = () => {
    if (typeof span === 'object') {
      return `span ${span.base || 12}`;
    }
    return `span ${span || 12}`;
  };

  return (
    <div style={{ gridColumn: getSpan() }}>
      {children}
    </div>
  );
};