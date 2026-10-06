'use client';
import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  placeholder?: string;
  onValueChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, onValueChange, onChange, value, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          value={value ?? ''}
          onChange={(e) => {
            onChange?.(e);
            onValueChange?.(e.target.value);
          }}
          className={cn(
            'flex h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 py-1 pe-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            !value && 'text-muted-foreground',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-foreground">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
