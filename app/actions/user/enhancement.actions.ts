'use server';
import { ROLES } from '@/app/generated/prisma/enums';
import { EXECUTIVE_PROMPT } from '@/lib';
import prisma from '@/prisma';
import { ExecutiveSchema, improveSection, requireRBAC } from '@/server';
import z from 'zod';

export const enhanceExecutiveSection = requireRBAC(ROLES.USER)(async (
  symbol: string,
  improvementNeeded,
) => {
  const executiveData = (await prisma.executiveSummary.findFirst({
    where: { report: { company: { symbol } } },
  }))!;
  const analysis = await improveSection<z.infer<typeof ExecutiveSchema>>({
    sectionDetails: ` ${JSON.stringify(executiveData)}`,
    systemPrompt: EXECUTIVE_PROMPT,
    schema: ExecutiveSchema,
    schemaName: 'ExecutiveSchema',
    improvementNeeded,
  });
  console.log(JSON.stringify(analysis,null,2));
  
  await prisma.executiveSummary.update({
    where: { id: executiveData.id },
    data: {},
  });
  return {
    okay: true,
    data: null,
  };
});
