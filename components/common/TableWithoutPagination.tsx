import { FC } from 'react';

interface TableProps {
  headings?: React.ReactNode[];
  rows?: React.ReactNode[][];
  noData: string;
}

export const TableWithoutPagination: FC<TableProps> = ({ headings, rows, noData }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[640px]">
        {headings && (
          <thead>
            <tr className="bg-[#f4f4f0] border-[#E5E7EB]">
              {headings.map((heading, i) => (
                <th className="align-top text-left text-[14px]" key={i}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
        )}

        {rows?.length ? (
          <tbody className="relative">
            {rows.map((row, i) => (
              <tr key={i} className="border-[#E5E7EB] hover:bg-[#F3F4F6]">
                {row.map((el, j) => (
                  <td className="align-top px-[26px] py-[10px] text-left text-sm" key={j}>
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
                className="text-center py-4 text-sm md:text-base font-semibold"
              >
                {noData}
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
};
