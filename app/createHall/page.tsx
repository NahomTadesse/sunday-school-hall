'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FacilitiesPicker, type FacilityOption } from '@/components/shared/FacilitiesPicker';
import { useLanguage } from '@/contexts/LanguageContext';

const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

const FACILITY_VALUES = ['wifi', 'tv', 'projector', 'ac', 'generator', 'sound_system'] as const;

export default function CreateHallPage() {
  const { t } = useLanguage();
  const [hallName, setHallName] = useState('');
  const [hallCapacity, setHallCapacity] = useState('');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const facilitiesOptions: FacilityOption[] = FACILITY_VALUES.map((value) => ({
    value,
    label: value.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hallName || !hallCapacity || facilities.length === 0) {
      toast.error(t('hall.validationRequired'));
      return;
    }

    const capacity = parseInt(hallCapacity, 10);
    if (isNaN(capacity) || capacity <= 0) {
      toast.error(t('hall.validationCapacity'));
      return;
    }

    const userDataString = Cookies.get('userData');
    const userData = userDataString ? JSON.parse(userDataString) : null;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/hall`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userData?.access_token}`,
        },
        body: JSON.stringify({ name: hallName, capacity, availability: true, facilities }),
      });

      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login';
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        toast.success(data?.message || t('common.success'));
        setHallName('');
        setHallCapacity('');
        setFacilities([]);
      } else {
        toast.error(data?.message || t('common.error'));
      }
    } catch {
      toast.error(t('auth.networkError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-2xl animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          {t('hall.createTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="hallName">{t('hall.name')}</Label>
            <Input
              id="hallName"
              placeholder={t('hall.namePlaceholder')}
              value={hallName}
              onChange={(e) => setHallName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hallCapacity">{t('hall.capacity')}</Label>
            <Input
              id="hallCapacity"
              type="number"
              min={1}
              placeholder={t('hall.capacityPlaceholder')}
              value={hallCapacity}
              onChange={(e) => setHallCapacity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t('common.facilities')}</Label>
            <FacilitiesPicker options={facilitiesOptions} value={facilities} onChange={setFacilities} />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={submitting}>
              {submitting ? t('common.creating') : t('common.create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
