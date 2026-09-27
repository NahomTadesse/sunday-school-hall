'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Check, CreditCard, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SkeletonRows } from '@/components/ui/skeleton-row';
import { Select } from '@/components/ui/select';
import { RadioGroup } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

interface Payment {
  id: string;
  dayOfWeek: string;
  basePrice: number;
  memberPrice: number;
  createdAt: string;
}

function getAuthHeader() {
  const userDataString = Cookies.get('userData');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  return { Authorization: `Bearer ${userData?.access_token}` };
}

export default function PaymentRequestsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentType, setPaymentType] = useState('FULL');
  const [amount, setAmount] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/payment`, { headers: getAuthHeader() });
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login';
        return;
      }
      const data = await response.json();
      if (data.success) {
        setPayments(data.data);
      } else {
        toast.error('Failed to fetch payment configurations.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAccept = (payment: Payment) => {
    setSelectedPayment(payment);
    setModalOpen(true);
    setAmount(payment.basePrice?.toString() || '');
  };

  const confirmPayment = async () => {
    if (!selectedPayment) return;
    const queryParams = new URLSearchParams({
      bookingId: selectedPayment.id,
      paymentMethod,
      paymentType,
      amount: (paymentType === 'PARTIAL' ? parseFloat(amount) : selectedPayment.basePrice).toString(),
    }).toString();

    try {
      const response = await fetch(`${API_BASE}/payment/confirm?${queryParams}`, { headers: getAuthHeader() });
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login';
        return;
      }
      if (response.ok) {
        toast.success('Payment confirmed.');
        fetchPayments();
      } else {
        toast.error('Failed to confirm payment.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setModalOpen(false);
    }
  };

  return (
    <>
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonRows rows={5} cols={5} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day of Week</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Member Price</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.dayOfWeek}</TableCell>
                      <TableCell>{payment.basePrice}</TableCell>
                      <TableCell>{payment.memberPrice}</TableCell>
                      <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleAccept(payment)} className="gap-1.5">
                            <Check className="h-3.5 w-3.5" />
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:bg-destructive/10">
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No payment requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <Select
                options={[
                  { value: 'TELEBIRR', label: 'Telebirr' },
                  { value: 'CBE', label: 'CBE' },
                ]}
                placeholder="Select payment method"
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Type</Label>
              <RadioGroup
                name="paymentType"
                value={paymentType}
                onChange={setPaymentType}
                options={[
                  { value: 'FULL', label: 'Full Payment' },
                  { value: 'PARTIAL', label: 'Partial Payment' },
                ]}
              />
            </div>
            {paymentType === 'PARTIAL' && (
              <div className="space-y-1.5">
                <Label>Amount</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={confirmPayment}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
