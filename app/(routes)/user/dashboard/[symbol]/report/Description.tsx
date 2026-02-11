import React, { ReactNode } from 'react';

export const Description = ({ children }: { children: ReactNode }) => {
  return <p className='mb-4'>{children}</p>;
};
