'use server';

import { ROLES } from '@/app/generated/prisma/enums';
import { convertToErrorInstance } from '@/lib';
import prisma from '@/prisma';
import { getSession, requireRBAC } from '@/server';

export const registerVote = requireRBAC(ROLES.USER)(async ({
  symbol,
  vote,
}: {
  vote: boolean;
  symbol: string;
}) => {
  try {
    const userId = (await getSession())!.userId;
    const company = await prisma.company.upsert({
      where: { symbol },
      update: {},
      create: { symbol },
      select: { id: true },
    });
    await prisma.vote.upsert({
      where: {
        companyId_userId: { companyId: company.id, userId },
      },
      update: { positive: vote },
      create: { positive: vote, userId, companyId: company.id },
    });
    return { okay: true, data: null };
  } catch (error) {
    return { okay: false, error: convertToErrorInstance(error) };
  }
});
