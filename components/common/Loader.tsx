import { useMemo } from 'react';

interface PropTypes {
  color?: boolean;
  size?: number;
}

export function Loader({ color, size }: PropTypes) {
  const style = useMemo(
    () => ({
      borderTopColor: color ? 'var(--primary)' : '#fff',
      height: size,
      width: size,
    }),
    [color, size],
  );

  return (
    <div className='h-full w-full flex items-center justify-center'>
      <span className='loader' style={style}></span>
    </div>
  );
}
