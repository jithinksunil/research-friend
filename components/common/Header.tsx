'use client';
import { Logout, Menu } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useState } from 'react';
import { HeaderListLink } from './HeaderListLink';
import { Logo } from './Logo';
import { signOut } from 'next-auth/react';

interface PropTypes {
  disableLogo?: boolean;
}
export function Header(props: PropTypes) {
  const [show, setShow] = useState(false);
  const handleSignout = async () => {
    await signOut();
  };
  const handleShow = () => {
    setShow((prev) => !prev);
  };

  return (
    <div className='shadow-md py-3 md:py-5 bg-background w-full'>
      <div className='max-w-[1220px] m-auto'>
        <div className='flex justify-between items-center px-5'>
          <Logo disableLogo={props.disableLogo} />
          <div className='flex items-center'>
            <div className='hidden md:flex gap-1 items-center'>
              <span className='hidden md:flex'>
                <HeaderListLink
                  onClick={handleSignout}
                  className='!text-[14px] !leading-[28px] !font-medium hover:!font-semibold flex gap-1 items-center !rounded-md'
                >
                  <Logout fontSize='small' className='hover:!text-primary' />
                  Signout
                </HeaderListLink>
              </span>
            </div>
            <span className='md:hidden'>
              <IconButton onClick={handleShow}>
                <Menu />
              </IconButton>
            </span>
          </div>
        </div>
        <div
          className={`md:hidden w-full overflow-hidden ${
            show ? 'h-[160px] ' : 'h-0'
          }  duration-300`}
        >
          <div className='pt-5'>
            <HeaderListLink onClick={handleSignout}>Signout</HeaderListLink>
          </div>
        </div>
      </div>
    </div>
  );
}
