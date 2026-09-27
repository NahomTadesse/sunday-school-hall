'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

const LANGS: { code: 'en' | 'am'; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'EN' },
  { code: 'am', label: 'Amharic', native: 'አማ' },
];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  const current = LANGS.find((l) => l.code === locale) ?? LANGS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Globe className="h-4 w-4" />
          <span>{current.native}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGS.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={lang.code === locale ? 'bg-accent text-accent-foreground' : ''}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
