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
  TextInput,
  Modal,
  Radio,
  Select,
  Overlay,
} from '@mantine/core';
import { IconCheck, IconX, IconSearch } from '@tabler/icons-react';
import Cookies from 'js-cookie';
export default function PaymentRequestsTable() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: '', color: '' });
  const [search, setSearch] = useState('');
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentType, setPaymentType] = useState('FULL');
  const [amount, setAmount] = useState('');
const userDataString = Cookies.get('userData');
const userData = userDataString ? JSON.parse(userDataString) : null;
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/payment', {
          headers: {
            Authorization: `Bearer ${userData?.access_token}`
          }
        });
      const data = await response.json();
      console.log('reuess',data)
      if (data.success) {
        setPayments(data.data);
      } else {
        setNotification({ visible: true, message: 'Failed to fetch payment configurations.', color: 'red' });
      }
    } catch (error) {
      setNotification({ visible: true, message: 'Network error. Please try again.', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (payment) => {
    setSelectedPayment(payment);
    setModalOpened(true);
    setAmount(payment.basePrice); // Set the amount to the base price when opening the modal
  };

  const confirmPayment = async () => {
    setActionLoading(true);
    const { id } = selectedPayment;
  
    // Construct query parameters
    const queryParams = new URLSearchParams({
      bookingId: id,
      paymentMethod: paymentMethod,
      paymentType: paymentType,
      amount: paymentType === 'PARTIAL' ? parseFloat(amount) : selectedPayment.basePrice,
    }).toString();
    console.log('qquer',queryParams)
  
    try {
      const response = await fetch(`https://hall-api.hohitebirhan.com/api/v1/payment/confirm?${queryParams}`, {
        method: 'GET', 
          headers: {
            Authorization: `Bearer ${userData?.access_token}`
          }
      });
  
      if (response.ok) {
        setNotification({ visible: true, message: 'Payment confirmed.', color: 'green' });
        fetchPayments();
        setModalOpened(false);
      } else {
        setNotification({ visible: true, message: 'Failed to confirm payment.', color: 'red' });
        setModalOpened(false);
      }
    } catch (error) {
      setNotification({ visible: true, message: 'Network error. Please try again.', color: 'red' });
      setModalOpened(false);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const lowerSearch = search.toLowerCase();
    return (
      payment.dayOfWeek.toLowerCase().includes(lowerSearch) ||
      payment.basePrice.toString().includes(lowerSearch) ||
      payment.memberPrice.toString().includes(lowerSearch) ||
      new Date(payment.createdAt).toLocaleDateString().includes(lowerSearch)
    );
  });

  const rows = filteredPayments.map((payment) => (
    <Table.Tr key={payment.id}>
      <Table.Td>{payment.dayOfWeek}</Table.Td>
      <Table.Td>{payment.basePrice}</Table.Td>
      <Table.Td>{payment.memberPrice}</Table.Td>
      <Table.Td>{new Date(payment.createdAt).toLocaleDateString()}</Table.Td>
      <Table.Td>
        <Group spacing="xs">
          <Button
            onClick={() => handleAccept(payment)}
            variant="light"
            color="green"
            leftIcon={<IconCheck />}
          >
            Accept
          </Button>
          <Button
            onClick={() => handleReject(payment.id)}
            variant="light"
            color="red"
            leftIcon={<IconX />}
          >
            Reject
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea>
      <Title order={2} style={{ marginTop: 45, marginLeft: 20 }}>Payment Requests</Title>
      {notification.visible && (
        <Notification color={notification.color} onClose={() => setNotification({ ...notification, visible: false })}>
          {notification.message}
        </Notification>
      )}
      {loading ? (
        <Center style={{ height: '100vh' }}>
          <Loader />
        </Center>
      ) : (
        <>
          <Group position="apart" style={{ margin: '20px' }}>
            <TextInput
              placeholder="Search by day, base price, member price, or created at"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              icon={<IconSearch size={16} />}
            />
          </Group>
          <Table horizontalSpacing="md" verticalSpacing="xs" miw={700}>
            <Table.Tbody>
              <Table.Tr>
                <Table.Th>Day of Week</Table.Th>
                <Table.Th>Base Price</Table.Th>
                <Table.Th>Member Price</Table.Th>
                <Table.Th>Created At</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text fw={500} ta="center">
                      No payment requests found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </>
      )}

      {/* Full-Screen Loader Overlay */}
      {actionLoading && (
        <Overlay opacity={0.7} color="#000" zIndex={1000} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader color="white" size="xl" />
        </Overlay>
      )}

      {/* Modal for Payment Confirmation */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Confirm Payment"
      >
        <Select
          label="Payment Method"
          placeholder="Select payment method"
          data={[
            { value: 'TELEBIRR', label: 'Telebirr' },
            { value: 'CBE', label: 'CBE' },
          ]}
          value={paymentMethod}
          onChange={setPaymentMethod}
          required
        />
        <Radio.Group
          label="Payment Type"
          value={paymentType}
          onChange={setPaymentType}
          style={{ marginTop: 10, marginBottom: 10 }}
          required
        >
          <Radio value="FULL" label="Full Payment" />
          <Radio value="PARTIAL" label="Partial Payment" />
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
        <Button onClick={confirmPayment} style={{ marginTop: '20px' }}>
          Confirm
        </Button>
      </Modal>
    </ScrollArea>
  );
}