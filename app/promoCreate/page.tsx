'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { handleUnauthorized } from '@/lib/api';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

export default function CreatePromoPage() {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [memberOnly, setMemberOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const discount = Number(discountPercentage);
    if (!promoCode || !discount || discount <= 0 || discount > 99 || !expiryDate) {
      toast.error('Please fill in all fields correctly. Discount must be between 1 and 99%.');
      return;
    }

    const userDataString = Cookies.get('userData');
    const userData = userDataString ? JSON.parse(userDataString) : null;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userData?.access_token}` },
        body: JSON.stringify({ code: promoCode, discountPercentage: discount, expiryDate, memberOnly }),
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        toast.success(data?.message || 'Promo created.');
        setPromoCode('');
        setDiscountPercentage('');
        setExpiryDate('');
        setMemberOnly(false);
      } else {
        toast.error(data?.message || 'Failed to create promo.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          Create Promo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="promoCode">Promo Code</Label>
            <Input id="promoCode" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="discount">Discount Percentage</Label>
            <Input
              id="discount"
              type="number"
              min={1}
              max={99}
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={memberOnly} onCheckedChange={(v) => setMemberOnly(!!v)} />
            Member Only
          </label>
          <Button type="submit" loading={loading} className="w-full">
            Create Promo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
