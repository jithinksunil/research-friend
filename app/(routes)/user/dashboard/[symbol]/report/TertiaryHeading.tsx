import { cn } from '@/lib';
import { ReactNode } from 'react';

export const TertiaryHeading = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <h1 className={cn('text-lg mb-1', className)}>{children}</h1>;
};
