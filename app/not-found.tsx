// app/global-error.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function GlobalError() {
  const { push } = useRouter();
  return (
    <div className='h-screen flex justify-center items-center flex-col'>
      <h1 className='text-3xl'>404</h1>
      <p>Not Found</p>
      <button onClick={() => push('/')}>Go Home</button>
    </div>
  );
}
