import { ROLES } from '@/app/generated/prisma/enums';
import { Header, LayoutWidth } from '@/components/common';
import { requirePageLevelRBAC } from '@/server';
export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageLevelRBAC(ROLES.USER);
  return (
    <div className='flex flex-col h-screen bg-background relative'>
      <span className='sticky top-0 w-full z-[60] h-[64px] md:h-20'>
        <Header />
      </span>
      <div className='flex-grow overflow-y-scroll overflow-x-hidden [&::-webkit-scrollbar]:w-1 md:[&::-webkit-scrollbar]:w-2 pb-5'>
        <LayoutWidth>{children}</LayoutWidth>
      </div>
    </div>
  );
}
