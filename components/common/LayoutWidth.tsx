import { cn } from '@/lib';

interface LayoutWidthProps {
  children: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export function LayoutWidth({ children, ref, className }: LayoutWidthProps) {
  return (
    <div ref={ref} className={cn('max-w-[1220px] px-5 m-auto h-full', className)}>
      {children}
    </div>
  );
}
