"use client";
import { Anchor, Group, Table, ActionIcon, Text, Container ,Title} from '@mantine/core';
import { IconTrash, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';

const initialBookings = [
  {
    name: 'Abebe Kebded',
    phone: '123-456-7890',
    date: '2025-01-01',
    status: 'Pending',
    member : 'NO'
  },
  {
    name: 'Selam Alemu',
    phone: '987-654-3210',
    date: '2025-01-02',
    status: 'Confirmed',
    member : 'YES'
  },
  {
    name: 'Tesfaye Nigussie',
    phone: '555-555-5555',
    date: '2025-01-03',
    status: 'Pending',
    member : 'YES'
  },
  {
    name: 'Abreham Teklu',
    phone: '444-444-4444',
    date: '2025-01-04',
    status: 'Confirmed',
    member : 'NO'
  },
];

export default function BookingTable() {
  const [bookings, setBookings] = useState(initialBookings);

  const handleConfirm = (index) => {
    const updatedBookings = bookings.map((booking, i) =>
      i === index ? { ...booking, status: 'Confirmed' } : booking
    );
    setBookings(updatedBookings);
  };

  const handleDelete = (index) => {
    const updatedBookings = bookings.filter((_, i) => i !== index);
    setBookings(updatedBookings);
  };

  const rows = bookings.map((booking, index) => (
    <Table.Tr key={index}>
      <Table.Td>  <Text fz="sm" >{booking.name}  </Text></Table.Td>
      <Table.Td> <Text fz="sm" >{booking.phone} </Text> </Table.Td>
      <Table.Td> <Text fz="sm">{booking.date} </Text></Table.Td>
      <Table.Td 
      style={{ textAlign: 'left',fontWeight:"500" ,color: booking.member === 'YES' ? '#39FF14' : 'inherit' }}>{booking.member} </Table.Td>
      <Table.Td style={{ textAlign: 'left',fontWeight:"700" ,color: booking.status === 'Confirmed' ? '#39FF14' : 'inherit' }}>
        {booking.status}
      </Table.Td>
      <Table.Td>
        <Group position="right">
          <ActionIcon color="#39FF14" onClick={() => handleConfirm(index)} title="Confirm">
            <IconCheck size={16} />
          </ActionIcon>
          <ActionIcon color="red" onClick={() => handleDelete(index)} title="Delete">
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container style={{ maxWidth: '100%', margin: '0 auto' ,marginTop:45}}>
         <Title order={2} style={{marginBottom:10}}>VENUE REQUESTS</Title>
      <Table striped style={{ width: '100%' }} verticalSpacing="md" >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Booker's Name</Table.Th>
            <Table.Th>Phone Number</Table.Th>
            <Table.Th>Date to be Booked</Table.Th>
            <Table.Th>Member</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Container>
  );
}












// "use client"
// import {
//     IconDots,
//     IconMessages,
//     IconNote,
//     IconPencil,
//     IconReportAnalytics,
//     IconTrash,
//   } from '@tabler/icons-react';
//   import { ActionIcon, Avatar, Group, Menu, Table, Text } from '@mantine/core';
  
//   const data = [
//     {
//       avatar:
//         'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png',
//       name: 'Robert Wolfkisser',
//       job: 'Engineer',
//       email: 'rob_wolf@gmail.com',
//       rate: 22,
//     },
//     {
//       avatar:
//         'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-5.png',
//       name: 'Jill Jailbreaker',
//       job: 'Engineer',
//       email: 'jj@breaker.com',
//       rate: 45,
//     },
//     {
//       avatar:
//         'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-3.png',
//       name: 'Henry Silkeater',
//       job: 'Designer',
//       email: 'henry@silkeater.io',
//       rate: 76,
//     },
//     {
//       avatar:
//         'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-3.png',
//       name: 'Bill Horsefighter',
//       job: 'Designer',
//       email: 'bhorsefighter@gmail.com',
//       rate: 15,
//     },
//     {
//       avatar:
//         'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png',
//       name: 'Jeremy Footviewer',
//       job: 'Manager',
//       email: 'jeremy@foot.dev',
//       rate: 98,
//     },
//   ];
  
//   export default function UsersStack() {
//     const rows = data.map((item) => (
//       <Table.Tr key={item.name}>
//         <Table.Td>
//           <Group gap="sm">
//             <Avatar size={40} src={item.avatar} radius={40} />
//             <div>
//               <Text fz="sm" fw={500}>
//                 {item.name}
//               </Text>
//               <Text c="dimmed" fz="xs">
//                 {item.job}
//               </Text>
//             </div>
//           </Group>
//         </Table.Td>
//         <Table.Td>
//           <Text fz="sm">{item.email}</Text>
//           <Text fz="xs" c="dimmed">
//             Email
//           </Text>
//         </Table.Td>
//         <Table.Td>
//           <Text fz="sm">${item.rate.toFixed(1)} / hr</Text>
//           <Text fz="xs" c="dimmed">
//             Rate
//           </Text>
//         </Table.Td>
//         <Table.Td>
//           <Group gap={0} justify="flex-end">
//             <ActionIcon variant="subtle" color="gray">
//               <IconPencil size={16} stroke={1.5} />
//             </ActionIcon>
//             <Menu
//               transitionProps={{ transition: 'pop' }}
//               withArrow
//               position="bottom-end"
//               withinPortal
//             >
//               <Menu.Target>
//                 <ActionIcon variant="subtle" color="gray">
//                   <IconDots size={16} stroke={1.5} />
//                 </ActionIcon>
//               </Menu.Target>
//               <Menu.Dropdown>
//                 <Menu.Item leftSection={<IconMessages size={16} stroke={1.5} />}>
//                   Send message
//                 </Menu.Item>
//                 <Menu.Item leftSection={<IconNote size={16} stroke={1.5} />}>Add note</Menu.Item>
//                 <Menu.Item leftSection={<IconReportAnalytics size={16} stroke={1.5} />}>
//                   Analytics
//                 </Menu.Item>
//                 <Menu.Item leftSection={<IconTrash size={16} stroke={1.5} />} color="red">
//                   Terminate contract
//                 </Menu.Item>
//               </Menu.Dropdown>
//             </Menu>
//           </Group>
//         </Table.Td>
//       </Table.Tr>
//     ));
  
//     return (
//       <Table.ScrollContainer minWidth={800}>
//         <Table verticalSpacing="md">
//           <Table.Tbody>{rows}</Table.Tbody>
//         </Table>
//       </Table.ScrollContainer>
//     );
//   }