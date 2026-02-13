import { cn } from '@/lib';
import React from 'react';

export const SectionSeparator = ({ className }: { className?: string }) => {
  return <div className={cn(' border-b pt-4 mb-8', className)} />;
};
