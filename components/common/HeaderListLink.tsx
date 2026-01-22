import React, { ReactNode } from 'react';
interface PropsType {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}
export function HeaderListLink(props: PropsType) {
  return (
    <h1
      onClick={props.onClick}
      className={`text-[#4C4E65] text-base font-semibold leading-[35px] hover:cursor-pointer hover:text-primary ${props.className} px-5 hover:bg-slate-100`}
    >
      {props.children}
    </h1>
  );
}
