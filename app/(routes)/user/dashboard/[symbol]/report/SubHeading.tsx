import { cn } from '@/lib';
import React, { ReactNode } from 'react';

export const SubHeading = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <h1 className={cn('text-xl font-medium mb-1', className)}>{children}</h1>
  );
};
