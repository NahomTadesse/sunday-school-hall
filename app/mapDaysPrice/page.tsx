'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { PencilLine, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SkeletonRows } from '@/components/ui/skeleton-row';
import { handleUnauthorized } from '@/lib/api';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

interface DayPrice {
  basePrice: string;
  memberPrice: string;
  id: string;
}

export default function SetPricesPage() {
  const [disabled, setDisabled] = useState(true);
  const [prices, setPrices] = useState<Record<string, DayPrice>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [submittingDay, setSubmittingDay] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      const userDataString = Cookies.get('userData');
      const userData = userDataString ? JSON.parse(userDataString) : null;
      try {
        const response = await fetch(`${API_BASE}/payment`, {
          headers: { Authorization: `Bearer ${userData?.access_token}` },
        });
        if (response.status === 401 || response.status === 403) {
          handleUnauthorized();
          return;
        }
        const result = await response.json();
        if (result.success) {
          const priceData: Record<string, DayPrice> = result.data.reduce(
            (acc: Record<string, DayPrice>, item: any) => {
              acc[item.dayOfWeek] = { basePrice: item.basePrice, memberPrice: item.memberPrice, id: item.id };
              return acc;
            },
            {}
          );
          setPrices(priceData);
        }
      } catch (error) {
        console.error('Error fetching prices:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrices();
  }, []);

  const handleChange = (day: string, type: 'basePrice' | 'memberPrice', value: string) => {
    setPrices((prev) => ({ ...prev, [day]: { ...prev[day], [type]: value } }));
  };

  const handleSubmit = async (day: string) => {
    const userDataString = Cookies.get('userData');
    const userData = userDataString ? JSON.parse(userDataString) : null;
    setSubmittingDay(day);
    const { basePrice, memberPrice, id } = prices[day];

    try {
      const response = await fetch(`${API_BASE}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userData?.access_token}` },
        body: JSON.stringify({ dayOfWeek: day, basePrice: parseFloat(basePrice), memberPrice: parseFloat(memberPrice), id }),
      });
      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }
      const result = await response.json();
      toast[result.success ? 'success' : 'error'](result.message);
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setSubmittingDay(null);
    }
  };

  return (
    <Card className="animate-fade-in-up">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Set Prices for Each Day of the Week
        </CardTitle>
        <Button variant="outline" size="icon" onClick={() => setDisabled((prev) => !prev)}>
          <PencilLine className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SkeletonRows rows={7} cols={2} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.keys(prices).map((day) => (
              <div key={day} className="rounded-lg border p-4">
                <Label className="mb-2 block">{day}</Label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    disabled={disabled}
                    value={prices[day].basePrice}
                    onChange={(e) => handleChange(day, 'basePrice', e.target.value)}
                    placeholder="Base price"
                  />
                  <Input
                    type="number"
                    disabled={disabled}
                    value={prices[day].memberPrice}
                    onChange={(e) => handleChange(day, 'memberPrice', e.target.value)}
                    placeholder="Member price"
                  />
                </div>
                <Button
                  onClick={() => handleSubmit(day)}
                  disabled={disabled}
                  loading={submittingDay === day}
                  size="sm"
                  className="mt-3 w-full"
                >
                  Submit
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
