import { productName } from '@/lib';
import { ReactNode } from 'react';
interface PropTypes {
  children: ReactNode;
}
export const AuthLayout = (props: PropTypes) => {
  return (
    <div className={`w-full flex justify-center bg-[#F4F4F0]`}>
      <div className='flex flex-col justify-between md:justify-start p-0 relative min-h-screen md:px-5 md:py-0 [&>div]:grow-0 md:[&>div]:grow'>
        <header className='px-8 py-3 md:px-0 md:py-10'>
          <div className='w-24 h-[34px]'>
            <a href='/organization/auth/signin'>
              <img
                alt='ABCXChange logo'
                src='/brand/abcx_logo.svg'
                className='w-full h-full object-contain'
                width={96}
                height={34}
              />
            </a>
          </div>
        </header>
        <div className='items-end md:items-stretch justify-center md:justify-start m-0 md:m-auto w-full min-h-[602px] flex md:grid authLayoutContainer gap-5 overflow-hidden bg-white rounded-xl'>
          {props.children}
        </div>
        <div className='bg-[#F4F4F0] py-2 hidden md:block'>
          <div className='flex'>
            <p className='text-[14px] font-bold text-[#222237] whitespace-nowrap'>
              © {productName} by ABCX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
