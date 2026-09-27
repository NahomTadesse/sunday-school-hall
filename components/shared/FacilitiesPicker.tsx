'use client';

import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

export interface FacilityOption {
  value: string;
  label: string;
}

export function FacilitiesPicker({
  options,
  value,
  onChange,
}: {
  options: FacilityOption[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (val: string) => {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((opt) => {
        const checked = value.includes(opt.value);
        return (
          <label
            key={opt.value}
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
              checked ? 'border-primary bg-accent text-accent-foreground' : 'border-input hover:bg-accent/50'
            )}
          >
            <Checkbox checked={checked} onCheckedChange={() => toggle(opt.value)} />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
