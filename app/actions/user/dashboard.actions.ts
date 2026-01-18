'use server';

import { ROLES } from '@/app/generated/prisma/enums';
import { requireRBAC } from '@/lib';

export const getDashboardData = requireRBAC(ROLES.USER)(
  async (name: string) => ({ okay: true, data: name })
);
