

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
//   Badge,
//   Card,

//   Pagination,
//   Paper,
//   Stack,

//   Tooltip,
// } from '@mantine/core';
// import { 
//   IconCheck, 
//   IconX, 
//   IconSearch, 

//   IconSortAscending,
//   IconSortDescending,
// } from '@tabler/icons-react';
// import Cookies from 'js-cookie';

// const userDataString = Cookies.get('userData');
// const userData = userDataString ? JSON.parse(userDataString) : null;

// // Status badge colors
// const statusColors = {
//   PENDING: 'yellow',
//   CONFIRMED: 'green',
//   REJECTED: 'red',
//   CANCELLED: 'gray',
//   COMPLETED: 'blue',
// };

// // Payment status colors
// const paymentStatusColors = {
//   PAID: 'green',
//   PENDING: 'orange',
//   UNPAID: 'red',
//   PARTIAL: 'cyan',
// };

// export default function BookingTable() {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState<string | null>(null); // Track which booking is being processed
//   const [notification, setNotification] = useState({ visible: false, message: '', color: '' });
//   const [search, setSearch] = useState('');
//   const [sortField, setSortField] = useState<string | null>(null);
//   const [sortDirection, setSortDirection] = useState('asc');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(5); // 5 items per page as requested

//   useEffect(() => {
//     fetchBookings();
//   }, []);

//   const fetchBookings = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/book', {
//         headers: {
//           'Authorization': `Bearer ${userData?.access_token}`,
//           'Content-Type': 'application/json',
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch bookings');
//       }
      
//       const data = await response.json();
//       setBookings(data);
//     } catch (error) {
//       setNotification({ visible: true, message: 'Failed to fetch bookings.', color: 'red' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAccept = async (id: string) => {
//     setActionLoading(id);
//     try {
//       const response = await fetch(`https://hall-api.hohitebirhan.com/api/v1/book/confirm/${id}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${userData?.access_token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setNotification({ visible: true, message: data.message || 'Booking accepted successfully!', color: 'green' });
//         fetchBookings();
//       } else {
//         const errorData = await response.json();
//         setNotification({ visible: true, message: errorData.message || 'Failed to accept booking.', color: 'red' });
//       }
//     } catch (error) {
//       setNotification({ visible: true, message: 'Network error. Please try again.', color: 'red' });
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleReject = async (id: string) => {
//     setActionLoading(id);
//     try {
//       const response = await fetch(`https://hall-api.hohitebirhan.com/api/v1/book/reject/${id}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${userData?.access_token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setNotification({ visible: true, message: data.message || 'Booking rejected.', color: 'orange' });
//         fetchBookings();
//       } else {
//         const errorData = await response.json();
//         setNotification({ visible: true, message: errorData.message || 'Failed to reject booking.', color: 'red' });
//       }
//     } catch (error) {
//       setNotification({ visible: true, message: 'Network error. Please try again.', color: 'red' });
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   // Format date function
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   // Filter bookings based on search
//   const filteredBookings = bookings.filter((booking: any) => {
//     if (!search) return true;
    
//     const searchLower = search.toLowerCase();
//     return (
//       booking.customerName?.toLowerCase().includes(searchLower) ||
//       booking.phoneNumber?.includes(search) ||
//       booking.email?.toLowerCase().includes(searchLower) ||
//       booking.bookingStatus?.toLowerCase().includes(searchLower) ||
//       booking.paymentStatus?.toLowerCase().includes(searchLower)
//     );
//   });

//   // Sort bookings
//   const sortedBookings = [...filteredBookings].sort((a: any, b: any) => {
//     if (!sortField) return 0;

//     let aValue = a[sortField];
//     let bValue = b[sortField];

//     // Handle date fields
//     if (sortField === 'startingBookingDate' || sortField === 'createdAt') {
//       aValue = new Date(aValue).getTime();
//       bValue = new Date(bValue).getTime();
//     }

//     if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
//     if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
//     return 0;
//   });

//   // Pagination logic
//   const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);
//   const paginatedBookings = sortedBookings.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const rows = paginatedBookings.map((booking: any) => (
//     <Table.Tr key={booking.id} style={{ transition: 'background-color 0.2s' }}>
//       <Table.Td>
//         <Group gap="xs">
//           {/* <ThemeIcon variant="light" color="blue" size="sm" radius="xl">
//             <IconUser size={14} />
//           </ThemeIcon> */}
//           <Text size="sm" fw={500}>{booking.customerName}</Text>
//         </Group>
//       </Table.Td>
//       <Table.Td>
//         <Group gap="xs">
//           {/* <ThemeIcon variant="light" color="green" size="sm" radius="xl">
//             <IconPhone size={14} />
//           </ThemeIcon> */}
//           <Text size="sm">{booking.phoneNumber}</Text>
//         </Group>
//       </Table.Td>
//       <Table.Td>
//         <Group gap="xs">
//           {/* <ThemeIcon variant="light" color="grape" size="sm" radius="xl">
//             <IconMail size={14} />
//           </ThemeIcon> */}
//           <Text size="sm">{booking.email}</Text>
//         </Group>
//       </Table.Td>
//       <Table.Td>
//         <Group gap={4}>
//           {/* <IconCurrency size={14} /> */}
//           <Text size="sm" fw={500}>{booking.finalPrice?.toLocaleString()}</Text>
//         </Group>
//       </Table.Td>
//       <Table.Td>
//         <Group gap={4}>
//           {/* <IconCurrency size={14} /> */}
//           <Text size="sm" fw={500}>{booking.amountPaid?.toLocaleString()}</Text>
//         </Group>
//       </Table.Td>
//       <Table.Td>
//         <Group gap="xs">
//           {/* <ThemeIcon variant="light" color="cyan" size="sm" radius="xl">
//             <IconCalendar size={14} />
//           </ThemeIcon> */}
//           <Text size="sm">{formatDate(booking.startingBookingDate)}</Text>
//         </Group>
//       </Table.Td>
//       <Table.Td>
//         <Badge 
//           color={statusColors[booking.bookingStatus as keyof typeof statusColors] || 'gray'}
//           variant="light"
//           size="lg"
//           radius="sm"
//         >
//           {booking.bookingStatus}
//         </Badge>
//       </Table.Td>
//       <Table.Td>
//         <Badge 
//           color={paymentStatusColors[booking.paymentStatus as keyof typeof paymentStatusColors] || 'gray'}
//           variant="light"
//           size="lg"
//           radius="sm"
//         >
//           {booking.paymentStatus || 'N/A'}
//         </Badge>
//       </Table.Td>
//       <Table.Td>
//         <Badge 
//           color={booking.member ? 'teal' : 'gray'}
//           variant="light"
//           size="lg"
//           radius="sm"
//         >
//           {booking.member ? 'Yes' : 'No'}
//         </Badge>
//       </Table.Td>
//       <Table.Td>
//         <Group gap="xs">
//           {/* <ThemeIcon variant="light" color="gray" size="sm" radius="xl">
//             <IconClock size={14} />
//           </ThemeIcon> */}
//           <Text size="sm">{formatDate(booking.createdAt)}</Text>
//         </Group>
//       </Table.Td>
//       <Table.Td>
//         {booking.bookingStatus === 'PENDING' && (
//           <Group gap="xs">
//             <Tooltip label="Accept Booking">
//               <Button
//                 onClick={() => handleAccept(booking.id)}
//                 variant="light"
//                 color="green"
//                 size="xs"
//                 leftSection={<IconCheck size={14} />}
//                 loading={actionLoading === booking.id}
//                 loaderProps={{ type: 'dots' }}
//               >
//                 Accept
//               </Button>
//             </Tooltip>
//             <Tooltip label="Reject Booking">
//               <Button
//                 onClick={() => handleReject(booking.id)}
//                 variant="light"
//                 color="red"
//                 size="xs"
//                 leftSection={<IconX size={14} />}
//                 loading={actionLoading === booking.id}
//                 loaderProps={{ type: 'dots' }}
//               >
//                 Reject
//               </Button>
//             </Tooltip>
//           </Group>
//         )}
//         {booking.bookingStatus !== 'PENDING' && (
//           <Badge color="gray" variant="light" size="lg" radius="sm">
//             Processed
//           </Badge>
//         )}
//       </Table.Td>
//     </Table.Tr>
//   ));

//   if (loading) {
//     return (
//       <Center style={{ height: '100vh' }}>
//         <Stack align="center" gap="md">
//           <Loader size="xl" type="dots" />
//           <Text c="dimmed" size="sm">Loading bookings...</Text>
//         </Stack>
//       </Center>
//     );
//   }

//   return (
//     <Paper p="md" radius="md" withBorder style={{ margin: 20 }}>
//       <Stack gap="lg">
//         {/* Header */}
//         <Group justify="space-between" align="center">
//           <Title order={2} style={{ color: '#1c7ed6' }}>
//             Booking Requests
//           </Title>
//           <Badge size="lg" variant="filled" color="blue">
//             Total: {filteredBookings.length} Bookings
//           </Badge>
//         </Group>

//         {/* Notification */}
//         {notification.visible && (
//           <Notification 
//             color={notification.color} 
//             onClose={() => setNotification({ ...notification, visible: false })}
//             withBorder
//             radius="md"
//           >
//             {notification.message}
//           </Notification>
//         )}

//         {/* Search and Sort Controls */}
//         <Card withBorder radius="md" p="md">
//           <Grid>
//             <Grid.Col span={{ base: 12, md: 6 }}>
//               <TextInput
//                 placeholder="Search by name, phone, email, or status..."
//                 value={search}
//                 onChange={(event) => {
//                   setSearch(event.currentTarget.value);
//                   setCurrentPage(1); // Reset to first page on search
//                 }}
//                 leftSection={<IconSearch size={16} />}
//                 radius="md"
//               />
//             </Grid.Col>
//             <Grid.Col span={{ base: 6, md: 3 }}>
//               <Select
//                 placeholder="Sort by"
//                 data={[
//                   { value: 'customerName', label: 'Customer Name' },
//                   { value: 'phoneNumber', label: 'Phone Number' },
//                   { value: 'email', label: 'Email' },
//                   { value: 'startingBookingDate', label: 'Booking Date' },
//                   { value: 'finalPrice', label: 'Price' },
//                   { value: 'createdAt', label: 'Created At' },
//                 ]}
//                 onChange={(value) => {
//                   setSortField(value);
//                   setCurrentPage(1);
//                 }}
//                 clearable
//                 radius="md"
//                 leftSection={<IconSortAscending size={16} />}
//               />
//             </Grid.Col>
//             <Grid.Col span={{ base: 6, md: 3 }}>
//               <Select
//                 placeholder="Sort Direction"
//                 data={[
//                   { value: 'asc', label: 'Ascending' },
//                   { value: 'desc', label: 'Descending' },
//                 ]}
//                 onChange={(value) => {
//                   setSortDirection(value || 'asc');
//                   setCurrentPage(1);
//                 }}
//                 disabled={!sortField}
//                 radius="md"
//                 leftSection={<IconSortDescending size={16} />}
//               />
//             </Grid.Col>
//           </Grid>
//         </Card>

//         {/* Table */}
//         <ScrollArea>
//           <Table 
//             horizontalSpacing="md" 
//             verticalSpacing="md" 
//             miw={1200}
//             striped
//             highlightOnHover
//             withRowBorders
//             withColumnBorders={false}
//           >
//             <Table.Thead>
//               <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
//                 <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Customer</Table.Th>
//                 <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Phone</Table.Th>
//                 <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Email</Table.Th>
//                 <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Final Price</Table.Th>
//                 <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Amount Paid</Table.Th>
//                 <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Booking Date</Table.Th>
//                 <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Status</Table.Th>
//                 <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Payment</Table.Th>
//                 <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Member</Table.Th>
//                 <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Created</Table.Th>
//                 <Table.Th style={{ color: '#495057', fontWeight: 600 }}>Actions</Table.Th>
//               </Table.Tr>
//             </Table.Thead>
//             <Table.Tbody>
//               {rows.length > 0 ? (
//                 rows
//               ) : (
//                 <Table.Tr>
//                   <Table.Td colSpan={11}>
//                     <Stack align="center" py="xl">
//                       <Text fw={500} ta="center" size="lg" c="dimmed">
//                         No bookings found
//                       </Text>
//                       <Text size="sm" c="dimmed">
//                         {search ? 'Try adjusting your search criteria' : 'There are no booking requests to display'}
//                       </Text>
//                     </Stack>
//                   </Table.Td>
//                 </Table.Tr>
//               )}
//             </Table.Tbody>
//           </Table>
//         </ScrollArea>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <Group justify="center" mt="md">
//             <Pagination
//               total={totalPages}
//               value={currentPage}
//               onChange={setCurrentPage}
//               withEdges
//               radius="md"
//               size="sm"
//             />
//           </Group>
//         )}

//         {/* Items per page indicator */}
//         <Group justify="flex-end" mt="xs">
//           <Text size="sm" c="dimmed">
//             Showing {paginatedBookings.length} of {filteredBookings.length} bookings
//           </Text>
//         </Group>
//       </Stack>
//     </Paper>
//   );
// }

// // Helper Grid component since it wasn't imported
// const Grid = ({ children, ...props }) => (
//   <div style={{ display: 'grid', gap: '16px', ...props }}>{children}</div>
// );

// Grid.Col = ({ span, children }) => {
//   const getSpan = () => {
//     if (typeof span === 'object') {
//       return `span ${span.base || 12}`;
//     }
//     return `span ${span || 12}`;
//   };

//   return (
//     <div style={{ gridColumn: getSpan() }}>
//       {children}
//     </div>
//   );
// };

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
  Modal,
  Radio,
  Overlay,
} from '@mantine/core';
import { 
  IconCheck, 
  IconX, 
  IconSearch, 
  IconSortAscending,
  IconSortDescending,
  IconCash,
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState({ visible: false, message: '', color: '' });
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Payment confirmation modal state
  const [paymentModalOpened, setPaymentModalOpened] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentType, setPaymentType] = useState('FULL');
  const [amount, setAmount] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

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

  const handlePaymentClick = (booking: any) => {
    setSelectedBooking(booking);
    setPaymentModalOpened(true);
    setAmount(booking.finalPrice?.toString() || '0');
    setPaymentMethod('');
    setPaymentType('FULL');
  };

  const confirmPayment = async () => {
    if (!selectedBooking) return;
    
    setPaymentProcessing(true);
    const { id } = selectedBooking;
  
    // Construct query parameters
    const queryParams = new URLSearchParams({
      bookingId: id,
      paymentMethod: paymentMethod,
      paymentType: paymentType,
      amount: paymentType === 'PARTIAL' ? parseFloat(amount).toString() : selectedBooking.finalPrice?.toString() || '0',
    }).toString();
    const body = {
         bookingId: id,
      paymentMethod: paymentMethod,
      paymentType: paymentType,
      amount: paymentType === 'PARTIAL' ? parseFloat(amount).toString() : selectedBooking.finalPrice?.toString() || '0',
    }
  
    try {
      const response = await fetch(`https://hall-api.hohitebirhan.com/api/v1/payment/confirm`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
  
      if (response.ok) {
        const data = await response.json();
        setNotification({ visible: true, message: data.message || 'Payment confirmed successfully!', color: 'green' });
        fetchBookings();
        setPaymentModalOpened(false);
        setSelectedBooking(null);
      } else {
        const errorData = await response.json();
        setNotification({ visible: true, message: errorData.message || 'Failed to confirm payment.', color: 'red' });
        setPaymentModalOpened(false);
      }
    } catch (error) {
      setNotification({ visible: true, message: 'Network error. Please try again.', color: 'red' });
      setPaymentModalOpened(false);
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Format date function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
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
      booking.paymentStatus?.toLowerCase().includes(searchLower) ||
      booking.hallName?.toLowerCase().includes(searchLower)
    );
  });

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a: any, b: any) => {
    if (!sortField) return 0;

    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle date fields
    if (sortField === 'startingBookingDate' || sortField === 'createdAt') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
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
          <Text size="sm" fw={500}>{booking.customerName}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Text size="sm">{booking.phoneNumber}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Text size="sm">{booking.email}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          <Text size="sm" fw={500}>{booking.finalPrice?.toLocaleString()}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          <Text size="sm" fw={500}>{booking.amountPaid?.toLocaleString()}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
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
          <Text size="sm">{formatDate(booking.createdAt)}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Stack gap="xs">
          {/* Booking Actions - Only for PENDING bookings */}
                   {(booking.paymentStatus === 'UNPAID' || booking.paymentStatus === 'PARTIAL' || booking.paymentStatus === 'PENDING') && (
            <Tooltip label="Confirm Payment">
              <Button
                onClick={() => handlePaymentClick(booking)}
                variant="light"
                color="blue"
                size="xs"
                leftSection={<IconCash size={14} />}
                loading={actionLoading === booking.id}
                loaderProps={{ type: 'dots' }}
              >
                Process Payment
              </Button>
            </Tooltip>
          )}

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

          {/* Payment Actions - Only for UNPAID or PARTIAL payment status */}
          {/* {(booking.paymentStatus === 'UNPAID' || booking.paymentStatus === 'PARTIAL' || booking.paymentStatus === 'PENDING') && (
            <Tooltip label="Confirm Payment">
              <Button
                onClick={() => handlePaymentClick(booking)}
                variant="light"
                color="blue"
                size="xs"
                leftSection={<IconCash size={14} />}
                loading={actionLoading === booking.id}
                loaderProps={{ type: 'dots' }}
              >
                Process Payment
              </Button>
            </Tooltip>
          )} */}

          {/* Status Badge for processed bookings without payment needed */}
          {booking.bookingStatus !== 'PENDING' && 
           booking.paymentStatus !== 'UNPAID' && 
           booking.paymentStatus !== 'PARTIAL' && 
           booking.paymentStatus !== 'PENDING' && (
            <Badge color="gray" variant="light" size="lg" radius="sm">
              {booking.bookingStatus}
            </Badge>
          )}
        </Stack>
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
    <>
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
                    setCurrentPage(1);
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
              miw={1300}
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

      {/* Full-Screen Loader Overlay */}
      {paymentProcessing && (
        <Overlay opacity={0.7} color="#000" zIndex={1000} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader color="white" size="xl" />
        </Overlay>
      )}

      {/* Modal for Payment Confirmation */}
      <Modal
        opened={paymentModalOpened}
        onClose={() => {
          setPaymentModalOpened(false);
          setSelectedBooking(null);
        }}
        title="Confirm Payment"
        size="md"
      >
        {selectedBooking && (
          <Stack gap="md">
            <Text size="sm" fw={500}>Customer: {selectedBooking.customerName}</Text>
            <Text size="sm">Booking Status: {selectedBooking.bookingStatus}</Text>
            <Text size="sm" fw={500}>Total Price: {selectedBooking.finalPrice?.toLocaleString()}</Text>
            <Text size="sm">Amount Paid: {selectedBooking.amountPaid?.toLocaleString()}</Text>
            
            <Select
              label="Payment Method"
              placeholder="Select payment method"
              data={[
                { value: 'TELEBIRR', label: 'Telebirr' },
                { value: 'CBE', label: 'CBE' },
                { value: 'CASH', label: 'Cash' },
                { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
              ]}
              value={paymentMethod}
              onChange={(value) => setPaymentMethod(value || '')}
              required
            />
            
            <Radio.Group
              label="Payment Type"
              value={paymentType}
              onChange={setPaymentType}
              required
            >
              <Group mt="xs">
                <Radio value="FULL" label="Full Payment" />
                <Radio value="PARTIAL" label="Partial Payment" />
              </Group>
            </Radio.Group>
            
            {paymentType === 'PARTIAL' && (
              <TextInput
                label="Amount"
                placeholder="Enter amount"
                value={amount}
                onChange={(event) => setAmount(event.currentTarget.value)}
                required
                type="number"
              />
            )}
            
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setPaymentModalOpened(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmPayment}
                disabled={!paymentMethod || (paymentType === 'PARTIAL' && (!amount || parseFloat(amount) <= 0))}
              >
                Confirm Payment
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
}

// Helper Grid component
const Grid = ({ children, style, ...props }: any) => (
  <div style={{ display: 'grid', gap: '16px', ...style }} {...props}>{children}</div>
);

Grid.Col = ({ span, children }: any) => {
  const getSpan = () => {
    if (typeof span === 'object') {
      if (span.base) return `span ${span.base}`;
      return 'span 12';
    }
    return `span ${span || 12}`;
  };

  return (
    <div style={{ gridColumn: getSpan() }}>
      {children}
    </div>
  );
};