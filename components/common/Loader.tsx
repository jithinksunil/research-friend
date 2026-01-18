import { useMemo } from 'react';

interface PropTypes {
  color?: boolean;
  size?: number;
}

export function Loader(props: PropTypes) {
  const style = useMemo(
    () =>
      props.color
        ? {
            borderTopColor: 'var(--primary)',
            height: props.size,
            width: props.size,
          }
        : { borderTopColor: '#fff', height: props.size, width: props.size },
    [props.color]
  );

  return (
    <div className='h-full w-full flex items-center justify-center'>
      <span className='loader' style={style}></span>
    </div>
  );
}
