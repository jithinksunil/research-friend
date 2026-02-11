import { cn } from '@/lib';
import React, { ReactNode } from 'react';

export const Heading = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <h1 className={cn('text-2xl font-bold mb-2', className)}>{children}</h1>
  );
};
