import { useMemo } from 'react';

interface LoaderProps {
  color?: boolean;
  size?: number;
}

export function Loader({ color, size }: LoaderProps) {
  const style = useMemo(
    () => ({
      borderTopColor: color ? 'var(--primary)' : '#fff',
      height: size,
      width: size,
    }),
    [color, size],
  );

  return (
    <div className="h-full w-full flex items-center justify-center">
      <span className="loader" style={style}></span>
    </div>
  );
}
