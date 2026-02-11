'use server';
import { ROLES } from '@/app/generated/prisma/enums';
import { convertToErrorInstance } from '@/lib';
import prisma from '@/prisma';
import { getExecutiveInformationAboutCompany, requireRBAC } from '@/server';

export const getReport = requireRBAC(ROLES.USER)(async (symbol: string) => {
  try {
    let company = (await prisma.company.findUnique({
      where: { symbol },
      select: {
        executiveSummaries: true,
        id: true,
        data: true,
        companyName: true,
      },
    }))!;
    if (!company?.executiveSummaries) {
      const executiveInfo = await getExecutiveInformationAboutCompany(symbol);
      const newInfo = await prisma.company.upsert({
        where: { id: company.id },
        update: {
          companyName: executiveInfo.companyName,
          executiveSummaries: {
            create: {
              analystConsensus: executiveInfo.investmentThesis.analystConsensus,
              positive: executiveInfo.investmentThesis.positives,
              risk: executiveInfo.investmentThesis.risks,
              summary: executiveInfo.executiveSummary,
              upside: executiveInfo.investmentThesis.upside,
              dcfFairValue: executiveInfo.investmentThesis.dcfFairValue,
              currentPrice: executiveInfo.investmentThesis.currentPrice,
            },
          },
        },
        create: {
          symbol: symbol,
          companyName: executiveInfo.companyName,
          executiveSummaries: {
            create: {
              analystConsensus: executiveInfo.investmentThesis.analystConsensus,
              positive: executiveInfo.investmentThesis.positives,
              risk: executiveInfo.investmentThesis.risks,
              summary: executiveInfo.executiveSummary,
              upside: executiveInfo.investmentThesis.upside,
              dcfFairValue: executiveInfo.investmentThesis.dcfFairValue,
              currentPrice: executiveInfo.investmentThesis.currentPrice,
            },
          },
        },
        select: {
          executiveSummaries: true,
          id: true,
          data: true,
          companyName: true,
        },
      });
      company = { ...newInfo };
    }

    return { okay: true, data: company };
  } catch (error) {
    return { okay: false, error: convertToErrorInstance(error) };
  }
});
