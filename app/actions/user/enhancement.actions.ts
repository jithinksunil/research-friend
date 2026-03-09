'use server';
import { ROLES } from '@/app/generated/prisma/enums';
import { EXECUTIVE_PROMPT } from '@/lib';
import prisma from '@/prisma';
import { ExecutiveSchema, improveSection, requireRBAC } from '@/server';

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
