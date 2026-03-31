import { convertToErrorInstance } from '@/lib';
import prisma from '@/prisma';
import { getSession } from '@/server';

export async function registerVote({ symbol, vote }: { vote: boolean; symbol: string }) {
  try {
    const session = await getSession();
    if (!session) {
      throw new Error('Unauthorized');
    }

    const userId = session.userId;
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
}
