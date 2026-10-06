'use client';

import { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { ArrowUpDown, Banknote, Check, Search, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SkeletonRows } from '@/components/ui/skeleton-row';
import { Select } from '@/components/ui/select';
import { RadioGroup } from '@/components/ui/radio-group';
import { Pagination } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { handleUnauthorized } from '@/lib/api';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';
const ITEMS_PER_PAGE = 5;

const statusVariant: Record<string, 'default' | 'success' | 'destructive' | 'secondary' | 'warning'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  REJECTED: 'destructive',
  CANCELLED: 'secondary',
  COMPLETED: 'default',
};

const paymentStatusVariant: Record<string, 'default' | 'success' | 'destructive' | 'secondary' | 'warning'> = {
  PAID: 'success',
  PENDING: 'warning',
  UNPAID: 'destructive',
  PARTIAL: 'default',
};

interface Booking {
  id: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  finalPrice: number;
  amountPaid: number;
  startingBookingDate: string | null;
  bookingStatus: keyof typeof statusVariant | string;
  paymentStatus: keyof typeof paymentStatusVariant | string;
  member: boolean;
  createdAt: string;
}

function getAuthHeader() {
  const userDataString = Cookies.get('userData');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  return { Authorization: `Bearer ${userData?.access_token}` };
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'Not scheduled';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BookedPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentType, setPaymentType] = useState('FULL');
  const [amount, setAmount] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/book`, { headers: getAuthHeader() });
      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch bookings');
      setBookings(await response.json());
    } catch {
      toast.error('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${API_BASE}/book/confirm/${id}`, { method: 'PUT', headers: getAuthHeader() });
      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Booking accepted successfully!');
        fetchBookings();
      } else {
        toast.error(data.message || 'Failed to accept booking.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${API_BASE}/book/reject/${id}`, { method: 'PUT', headers: getAuthHeader() });
      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Booking rejected.');
        fetchBookings();
      } else {
        toast.error(data.message || 'Failed to reject booking.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePaymentClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setPaymentModalOpen(true);
    setAmount(booking.finalPrice?.toString() || '0');
    setPaymentMethod('');
    setPaymentType('FULL');
  };

  const confirmPayment = async () => {
    if (!selectedBooking) return;
    setPaymentProcessing(true);
    const body = {
      bookingId: selectedBooking.id,
      paymentMethod,
      paymentType,
      amount: paymentType === 'PARTIAL' ? parseFloat(amount).toString() : selectedBooking.finalPrice?.toString() || '0',
    };

    try {
      const response = await fetch(`${API_BASE}/payment/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(body),
      });
      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Payment confirmed successfully!');
        fetchBookings();
      } else {
        toast.error(data.message || 'Failed to confirm payment.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setPaymentProcessing(false);
      setPaymentModalOpen(false);
      setSelectedBooking(null);
    }
  };

  const filteredBookings = useMemo(() => {
    if (!search) return bookings;
    const q = search.toLowerCase();
    return bookings.filter(
      (b) =>
        b.customerName?.toLowerCase().includes(q) ||
        b.phoneNumber?.includes(search) ||
        b.email?.toLowerCase().includes(q) ||
        b.bookingStatus?.toLowerCase().includes(q) ||
        b.paymentStatus?.toLowerCase().includes(q) ||
        (b as any).hallName?.toLowerCase().includes(q)
    );
  }, [bookings, search]);

  const sortedBookings = useMemo(() => {
    if (!sortField) return filteredBookings;
    return [...filteredBookings].sort((a, b) => {
      let av: any = (a as any)[sortField];
      let bv: any = (b as any)[sortField];
      if (sortField === 'startingBookingDate' || sortField === 'createdAt') {
        av = av ? new Date(av).getTime() : 0;
        bv = bv ? new Date(bv).getTime() : 0;
      }
      if (av < bv) return sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredBookings, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = sortedBookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const needsPayment = (b: Booking) => ['UNPAID', 'PARTIAL', 'PENDING'].includes(b.paymentStatus);

  return (
    <>
      <Card className="animate-fade-in-up">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>Booking Requests</CardTitle>
          <Badge>Total: {filteredBookings.length} Bookings</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, email, or status..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="ps-9"
              />
            </div>
            <Select
              placeholder="Sort by"
              options={[
                { value: 'customerName', label: 'Customer Name' },
                { value: 'phoneNumber', label: 'Phone Number' },
                { value: 'email', label: 'Email' },
                { value: 'startingBookingDate', label: 'Booking Date' },
                { value: 'finalPrice', label: 'Price' },
                { value: 'createdAt', label: 'Created At' },
              ]}
              value={sortField || ''}
              onValueChange={(v) => {
                setSortField(v);
                setCurrentPage(1);
              }}
            />
          </div>

          {loading ? (
            <SkeletonRows rows={5} cols={7} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Final Price</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Booking Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBookings.length > 0 ? (
                  paginatedBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.customerName}</TableCell>
                      <TableCell>
                        <div className="text-sm">{booking.phoneNumber}</div>
                        <div className="text-xs text-muted-foreground">{booking.email}</div>
                      </TableCell>
                      <TableCell>{booking.finalPrice?.toLocaleString()}</TableCell>
                      <TableCell>{booking.amountPaid?.toLocaleString()}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{formatDate(booking.startingBookingDate)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[booking.bookingStatus] || 'secondary'}>{booking.bookingStatus}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={paymentStatusVariant[booking.paymentStatus] || 'secondary'}>
                          {booking.paymentStatus || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {needsPayment(booking) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePaymentClick(booking)}
                              loading={actionLoading === booking.id}
                              className="gap-1.5"
                            >
                              <Banknote className="h-3.5 w-3.5" />
                              Payment
                            </Button>
                          )}
                          {booking.bookingStatus === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAccept(booking.id)}
                                loading={actionLoading === booking.id}
                                className="gap-1.5"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(booking.id)}
                                loading={actionLoading === booking.id}
                                className="gap-1.5 text-destructive hover:bg-destructive/10"
                              >
                                <X className="h-3.5 w-3.5" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                      {search ? 'Try adjusting your search criteria' : 'There are no booking requests to display'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedBookings.length} of {filteredBookings.length} bookings
            </p>
            <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
          </div>
        </CardContent>
      </Card>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <p className="font-medium">Customer: {selectedBooking.customerName}</p>
                <p className="text-muted-foreground">Booking Status: {selectedBooking.bookingStatus}</p>
                <p>Total Price: {selectedBooking.finalPrice?.toLocaleString()}</p>
                <p>Amount Paid: {selectedBooking.amountPaid?.toLocaleString()}</p>
              </div>

              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <Select
                  options={[
                    { value: 'TELEBIRR', label: 'Telebirr' },
                    { value: 'CBE', label: 'CBE' },
                    { value: 'CASH', label: 'Cash' },
                    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
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
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmPayment}
              loading={paymentProcessing}
              disabled={!paymentMethod || (paymentType === 'PARTIAL' && (!amount || parseFloat(amount) <= 0))}
            >
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
