'use server';
import { ROLES } from '@/app/generated/prisma/enums';
import { convertToErrorInstance } from '@/lib';
import prisma from '@/prisma';
import {
  getExecutiveInformationAboutCompany,
  getOverviewMetricsAboutCompany,
  getShareholderStructureAboutCompany,
  requireRBAC,
} from '@/server';

export const getReport = requireRBAC(ROLES.USER)(async (symbol: string) => {
  try {
    const company = (await prisma.company.upsert({
      where: { symbol },
      create: { symbol },
      update: {},
      select: {
        executiveSummaries: true,
        id: true,
        data: true,
        companyName: true,
        overviewAndStockMetrics: {
          select: { fiftyTwoWeekPerformance: true, stockMetrics: true },
        },
      },
    }))!;
    // if (!company?.executiveSummaries) {
    //   const executiveInfo = await getExecutiveInformationAboutCompany(symbol);
    //   const overviewInfo = await getOverviewMetricsAboutCompany(symbol);
    //   const shareHoldersInfo =
    //     await getShareholderStructureAboutCompany(symbol);
    //   const newInfo = await prisma.company.update({
    //     where: { id: company.id },
    //     select: {
    //       executiveSummaries: true,
    //       id: true,
    //       data: true,
    //       companyName: true,
    //       overviewAndStockMetrics: {
    //         select: { fiftyTwoWeekPerformance: true, stockMetrics: true },
    //       },
    //     },
    //     data: {
    //       companyName: executiveInfo.companyName,
    //       executiveSummaries: {
    //         create: {
    //           analystConsensus: executiveInfo.investmentThesis.analystConsensus,
    //           positive: executiveInfo.investmentThesis.positives,
    //           risk: executiveInfo.investmentThesis.risks,
    //           summary: executiveInfo.executiveSummary,
    //           upside: executiveInfo.investmentThesis.upside,
    //           dcfFairValue: executiveInfo.investmentThesis.dcfFairValue,
    //           currentPrice: executiveInfo.investmentThesis.currentPrice,
    //         },
    //       },
    //       overviewAndStockMetrics: {
    //         create: {
    //           fiftyTwoWeekPerformance: overviewInfo.fiftyTwoWeekPerformance,
    //           stockMetrics: {
    //             createMany: {
    //               data: overviewInfo.metrics.map((metric) => ({
    //                 name: metric.name,
    //                 note: metric.note,
    //                 value: metric.value,
    //               })),
    //             },
    //           },
    //         },
    //       },
    //     },
    //   });
    //   company = { ...newInfo };
    // }
    const shareHoldersInfo = await getShareholderStructureAboutCompany(symbol);

    return { okay: true, data: { ...company, shareHoldersInfo } };
  } catch (error) {
    return { okay: false, error: convertToErrorInstance(error) };
  }
});
