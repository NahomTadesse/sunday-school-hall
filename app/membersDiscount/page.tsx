'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function SetDiscountPage() {
  const [discount, setDiscount] = useState('');

  const handleSubmit = () => {
    toast.success(`Discount set to ${discount}%`);
  };

  return (
    <Card className="mx-auto max-w-md animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-primary" />
          Set Discount Percentage for All Members
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="discount">Discount Percentage</Label>
          <Input
            id="discount"
            type="number"
            min={0}
            max={100}
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="Enter discount percentage"
          />
        </div>
        <Button onClick={handleSubmit}>Apply Discount</Button>
      </CardContent>
    </Card>
  );
}
