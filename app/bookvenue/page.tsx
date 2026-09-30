'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { CalendarPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, type SelectOption } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { handleUnauthorized } from '@/lib/api';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';
const phoneNumberRegex = /^(?:\+251|\b251)\d{9}|\b(?:09|07)\d{8}\b(?![-.,])[^-.,]*$/;
const nameRegex = /^[A-Za-z\s]+$/;

interface Hall {
  id: string;
  name: string;
  terms: { id: string; termsText: string }[];
}

interface DayOption {
  value: string;
  label: string;
  basePrice: number;
  memberPrice: number;
}

export default function BookVenuePage() {
  const [fullName, setFullName] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [selectedDay, setSelectedDay] = useState<DayOption | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [alternativePhoneNumber, setAlternativePhoneNumber] = useState('');
  const [altPhoneError, setAltPhoneError] = useState('');
  const [email, setEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [price, setPrice] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [hallId, setHallId] = useState('');
  const [halls, setHalls] = useState<Hall[]>([]);
  const [daysOfWeek, setDaysOfWeek] = useState<DayOption[]>([]);
  const [promoCodes, setPromoCodes] = useState<SelectOption[]>([]);
  const [selectedPromoCode, setSelectedPromoCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedTerms, setSelectedTerms] = useState<{ id: string; termsText: string }[]>([]);
  const [purpose, setPurpose] = useState('');
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [dateError, setDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');

  const validatePhone = (phone: string) => !phone || phoneNumberRegex.test(phone);
  const validateFullName = (name: string) => !name || nameRegex.test(name);
  const isFutureDate = (date: string) => !date || dayjs(date).isSame(dayjs().startOf('day'), 'day') || dayjs(date).isAfter(dayjs().startOf('day'));

  useEffect(() => {
    const userDataString = Cookies.get('userData');
    const userData = userDataString ? JSON.parse(userDataString) : null;
    if (!userData?.access_token) return;

    const headers = { Authorization: `Bearer ${userData.access_token}` };

    const fetchHalls = async () => {
      try {
        const response = await fetch(`${API_BASE}/hall`, { headers });
        if (response.status === 401 || response.status === 403) {
          handleUnauthorized();
          return;
        }
        setHalls(await response.json());
      } catch {}
    };

    const fetchDaysOfWeek = async () => {
      try {
        const response = await fetch(`${API_BASE}/payment`, { headers });
        if (response.status === 401 || response.status === 403) return;
        const result = await response.json();
        if (result.success) {
          setDaysOfWeek(
            result.data.map((item: any) => ({
              value: item.id,
              label: item.dayOfWeek,
              basePrice: item.basePrice,
              memberPrice: item.memberPrice,
            }))
          );
        }
      } catch {}
    };

    const fetchPromoCodes = async () => {
      try {
        const response = await fetch(`${API_BASE}/code`, { headers });
        if (response.status === 401 || response.status === 403) return;
        const result = await response.json();
        if (result.success) {
          setPromoCodes(result.data.map((code: any) => ({ value: code.code, label: code.code })));
        }
      } catch {}
    };

    fetchHalls();
    fetchDaysOfWeek();
    fetchPromoCodes();
  }, []);

  const handleHallChange = (value: string) => {
    const selectedHall = halls.find((hall) => hall.id === value);
    if (selectedHall) {
      setHallId(value);
      setSelectedTerms(selectedHall.terms || []);
    }
  };

  const handleDayChange = (value: string) => {
    const selected = daysOfWeek.find((day) => day.value === value);
    if (selected) {
      setSelectedDay(selected);
      setPrice(String(isMember ? selected.memberPrice : selected.basePrice));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !selectedDay || !phoneNumber || !email || !hallId || !termsAccepted || !selectedDate || !endDate) {
      toast.error('Please fill in all required fields and accept the terms.');
      return;
    }
    if (!validateFullName(fullName)) {
      toast.error('Full name should only contain letters and spaces');
      return;
    }
    if (!validatePhone(phoneNumber)) {
      toast.error('Please enter a valid Ethiopian phone number');
      return;
    }
    if (alternativePhoneNumber && !validatePhone(alternativePhoneNumber)) {
      toast.error('Please enter a valid alternative phone number');
      return;
    }
    if (!isFutureDate(selectedDate)) {
      toast.error('Start date must be today or a future date');
      return;
    }
    if (dayjs(endDate).isBefore(dayjs(selectedDate))) {
      toast.error('End date must be on or after start date');
      return;
    }

    const userDataString = Cookies.get('userData');
    const userData = userDataString ? JSON.parse(userDataString) : null;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/book/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userData?.access_token}` },
        body: JSON.stringify({
          hallId,
          startDateTime: new Date(selectedDate).toISOString(),
          endDateTime: new Date(endDate).toISOString(),
          customerName: fullName,
          email,
          phone: phoneNumber,
          alternativePhoneNumber,
          specialRequests,
          termsAccepted,
          member: isMember,
          promoCode: isMember ? selectedPromoCode : '',
          userId: userData?.userId,
          purpose,
          eventName,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        toast.success(data?.message || 'Booking created successfully.');
        setFullName('');
        setSelectedDay(null);
        setSelectedDate('');
        setEndDate('');
        setPhoneNumber('');
        setAlternativePhoneNumber('');
        setEmail('');
        setSpecialRequests('');
        setIsMember(false);
        setHallId('');
        setSelectedPromoCode('');
        setTermsAccepted(false);
        setPurpose('');
        setEventName('');
        setPrice('');
      } else {
        toast.error(`Error: ${data?.message}`);
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hallOptions: SelectOption[] = halls.map((h) => ({ value: h.id, label: h.name }));

  return (
    <>
      <Card className="mx-auto max-w-3xl animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary" />
            Book Venue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setFullNameError(!validateFullName(e.target.value) ? 'Letters and spaces only' : '');
                  }}
                  required
                />
                {fullNameError && <p className="text-xs text-destructive">{fullNameError}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Select Hall</Label>
                <Select options={hallOptions} placeholder="Choose a hall" value={hallId} onValueChange={handleHallChange} required />
              </div>

              <div className="space-y-1.5">
                <Label>Select Day of the Week</Label>
                <Select
                  options={daysOfWeek}
                  placeholder="Select a day"
                  value={selectedDay?.value || ''}
                  onValueChange={handleDayChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setPhoneError(!validatePhone(e.target.value) ? 'Enter a valid Ethiopian phone number' : '');
                  }}
                  required
                />
                {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="altPhone">Alternative Phone Number</Label>
                <Input
                  id="altPhone"
                  value={alternativePhoneNumber}
                  onChange={(e) => {
                    setAlternativePhoneNumber(e.target.value);
                    setAltPhoneError(!validatePhone(e.target.value) ? 'Enter a valid phone number' : '');
                  }}
                />
                {altPhoneError && <p className="text-xs text-destructive">{altPhoneError}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Input id="specialRequests" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price">Price for the selected day</Label>
                <Input id="price" disabled value={price} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="purpose">Purpose of Booking</Label>
                <Input id="purpose" placeholder="e.g., Wedding, Conference" value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="eventName">Event Name</Label>
                <Input id="eventName" value={eventName} onChange={(e) => setEventName(e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start Date & Time</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setDateError(!isFutureDate(e.target.value) ? 'Start date must be today or later' : '');
                  }}
                  required
                />
                {dateError && <p className="text-xs text-destructive">{dateError}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endDate">End Date & Time</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setEndDateError(
                      e.target.value && selectedDate && dayjs(e.target.value).isBefore(dayjs(selectedDate))
                        ? 'End date must be on or after start date'
                        : ''
                    );
                  }}
                  required
                />
                {endDateError && <p className="text-xs text-destructive">{endDateError}</p>}
              </div>
            </div>

            <Button type="button" variant="outline" onClick={() => setModalOpened(true)}>
              View Terms
            </Button>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isMember}
                onCheckedChange={(checked) => {
                  const isChecked = !!checked;
                  setIsMember(isChecked);
                  setPrice(String(selectedDay ? (isChecked ? selectedDay.memberPrice : selectedDay.basePrice) : ''));
                }}
              />
              I&apos;m a member
            </label>

            {isMember && (
              <div className="max-w-xs space-y-1.5">
                <Label>Select Promo Code</Label>
                <Select options={promoCodes} placeholder="Choose a promo code" value={selectedPromoCode} onValueChange={setSelectedPromoCode} />
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" loading={loading}>
                Book
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={modalOpened} onOpenChange={setModalOpened}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 space-y-2 overflow-y-auto text-sm text-muted-foreground">
            {selectedTerms.length > 0 ? (
              selectedTerms.map((term) => <p key={term.id}>{term.termsText}</p>)
            ) : (
              <p>No terms available for the selected hall.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpened(false)}>
              Decline
            </Button>
            <Button
              onClick={() => {
                setTermsAccepted(true);
                setModalOpened(false);
              }}
            >
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
