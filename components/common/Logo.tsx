'use client';
import { Tooltip } from '@mui/material';
import { useRouter } from 'next/navigation';
interface PropTypes {
  disableLogo?: boolean;
}
export function Logo({ disableLogo }: PropTypes) {
  const { push } = useRouter();
  const handleDashboard = () => {
    push('/user/search');
  };

  return (
    <Tooltip title='Home'>
      <span
        className={`${!disableLogo ? 'hover:cursor-pointer' : ''} flex gap-3`}
        onClick={!disableLogo ? handleDashboard : () => {}}
      >
        <img alt={'Abcx'} src={'/assets/abcx_logo.svg'} className='!h-[32px]' />
      </span>
    </Tooltip>
  );
}
