'use server';
import { ROLES } from '@/app/generated/prisma/enums';
import { EXECUTIVE_PROMPT, OVERVIEW_PROMPT } from '@/lib';
import prisma from '@/prisma';
import {
  CompanyOverviewSchema,
  ExecutiveSchema,
  improveSection,
  requireRBAC,
} from '@/server';

export const enhanceExecutiveSection = requireRBAC(ROLES.USER)(async (
  symbol: string,
  improvementNeeded,
) => {
  const executiveData = (await prisma.executiveSummary.findFirst({
    where: { report: { company: { symbol } } },
  }))!;
  const executiveInfo = await improveSection({
    sectionDetails: ` ${JSON.stringify(executiveData)}`,
    systemPrompt: EXECUTIVE_PROMPT,
    schema: ExecutiveSchema,
    schemaName: 'ExecutiveSchema',
    improvementNeeded,
  });

  const executiveSummary = await prisma.executiveSummary.update({
    where: { id: executiveData.id },
    data: {
      analystConsensus: executiveInfo.investmentThesis.analystConsensus,
      positive: executiveInfo.investmentThesis.positives,
      risk: executiveInfo.investmentThesis.risks,
      summary: executiveInfo.executiveSummary,
      upside: executiveInfo.investmentThesis.upside,
      dcfFairValue: executiveInfo.investmentThesis.dcfFairValue,
      currentPrice: executiveInfo.investmentThesis.currentPrice,
    },
  });
  return {
    okay: true,
    data: executiveSummary,
  };
});

export const enhanceCompanyOverviewAndStockMetricsSection = requireRBAC(
  ROLES.USER,
)(async (symbol: string, improvementNeeded) => {
  const overviewData = (await prisma.overviewAndStockMetrics.findFirst({
    where: { report: { company: { symbol } } },
    select: { fiftyTwoWeekPerformance: true, stockMetrics: true, id: true },
  }))!;
  const overviewInfo = await improveSection({
    sectionDetails: ` ${JSON.stringify(overviewData)}`,
    systemPrompt: OVERVIEW_PROMPT,
    schema: CompanyOverviewSchema,
    schemaName: 'CompanyOverviewSchema',
    improvementNeeded,
  });

  const overView = await prisma.overviewAndStockMetrics.update({
    where: { id: overviewData.id },
    data: {
      fiftyTwoWeekPerformance: overviewInfo.fiftyTwoWeekPerformance,
      stockMetrics: {
        deleteMany: {},
        createMany: {
          data: overviewInfo.metrics.map((metric) => ({
            name: metric.name,
            note: metric.note,
            value: metric.value,
          })),
        },
      },
    },
    select: {
      stockMetrics: true,
      fiftyTwoWeekPerformance: true,
    },
  });
  return {
    okay: true,
    data: overView,
  };
});
