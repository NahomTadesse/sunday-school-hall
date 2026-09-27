'use client';
import { Loader2 } from 'lucide-react';

export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
