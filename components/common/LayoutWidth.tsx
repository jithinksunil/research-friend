import { cn } from '@/lib';
import React, { ReactNode } from 'react';
interface PropsType {
  children: ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}
export function LayoutWidth({ children, ref, className }: PropsType) {
  return (
    <div
      ref={ref}
      className={cn('max-w-[1220px] px-5 m-auto h-full', className)}
    >
      {children}
    </div>
  );
}
