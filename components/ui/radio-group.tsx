'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: string;
}

export function RadioGroup({
  options,
  value,
  onChange,
  name,
  className,
}: {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {options.map((opt) => (
        <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm">
          <span className="relative flex h-4 w-4 items-center justify-center rounded-full border border-input">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <span className="hidden h-2 w-2 rounded-full bg-primary peer-checked:block" />
            {value === opt.value && <span className="h-2 w-2 rounded-full bg-primary" />}
          </span>
          {opt.label}
        </label>
      ))}
    </div>
  );
}
