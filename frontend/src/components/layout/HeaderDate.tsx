'use client';

import { useState, useEffect } from 'react';
import { formatHeaderToday } from '@/lib/dateUtils';

interface HeaderDateProps {
  className?: string;
}

export default function HeaderDate({ className = 'text-xs text-stone-500 font-medium' }: HeaderDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    setFormattedDate(formatHeaderToday());
  }, []);

  return (
    <p className={className} suppressHydrationWarning>
      {formattedDate}
    </p>
  );
}
