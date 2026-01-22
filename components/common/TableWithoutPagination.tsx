import { FC, ReactNode } from 'react';

interface TableProps {
  headings?: ReactNode[];
  rows?: ReactNode[][];
  noData: string;
}

export const TableWithoutPagination: FC<TableProps> = ({
  headings,
  rows,
  noData,
}) => {
  return (
    <>
      <table className='w-full'>
        {headings && (
          <thead>
            <tr className='bg-[#f4f4f0] border-[#E5E7EB]'>
              {headings.map((heading, i) => (
                <th className='text-left text-[14px]' key={i}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
        )}

        {rows?.length ? (
          <tbody className='relative'>
            {rows.map((row, i) => (
              <tr key={i} className='border-[#E5E7EB] hover:bg-[#F3F4F6]'>
                {row.map((el, j) => (
                  <td className='px-[20px] py-[10px] text-sm' key={j}>
                    {el}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td
                colSpan={headings?.length}
                className='text-center py-4 text-sm md:text-base font-semibold'
              >
                {noData}
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </>
  );
};
