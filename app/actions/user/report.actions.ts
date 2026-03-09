'use server';
import { ROLES } from '@/app/generated/prisma/enums';
import { convertToErrorInstance } from '@/lib';
import { getReportDetails } from '@/lib/server-only/repot';
import { requireRBAC } from '@/server';

export const getReport = requireRBAC(ROLES.USER)(async (symbol: string) => {
  try {
    const company = await getReportDetails(symbol);
    return {
      okay: true,
      data: { ...company },
    };
  } catch (error) {
    return { okay: false, error: convertToErrorInstance(error) };
  }
});
