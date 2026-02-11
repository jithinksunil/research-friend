import React from 'react';

export const List = ({ items }: { items: string[] }) => {
  return (
    <ul className='list-disc pl-4 flex flex-col gap-2 mb-8'>
      {items.map((item, index) => (
        <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
      ))}
    </ul>
  );
};
