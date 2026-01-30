import 'server-only';
import { readFileSync } from 'node:fs';
import * as docx from 'docx-templates';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { ZodType } from 'zod';
import { ZodTypeDef } from 'zod/v3';
import { SYSTEM_PROMPT } from '../constant';
import {
  AnalystConsensusSchema,
  CatalystsSchema,
  CompetitionSchema,
  ESGSchema,
  FinancialsSchema,
  GuidanceSchema,
  NewsSchema,
  OverviewSchema,
  ProjectionsSchema,
  RatiosSchema,
  RegulatorySchema,
  ScenariosSchema,
  SegmentsSchema,
  ShareholderSchema,
  ValuationSchema,
} from './schema';
import { readFile } from 'node:fs/promises';
import prisma from '@/prisma';

export async function createReportBuffer(data: Object): Promise<Buffer> {
  const template = readFileSync('./report_template.docx');
  const unit8Buffer = await docx.createReport({
    template: template,
    data,
  });
  const buffer = Buffer.from(unit8Buffer);
  return await convertToPdf(buffer);
}

async function convertToPdf(buffer: Buffer): Promise<Buffer> {
  const base64 = buffer.toString('base64');

  const response = await fetch(
    `${process.env.FILE_CONVERSION_ENGINE_URL}/api/convert-to-pdf`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file: base64 }),
    },
  );

  if (!response.ok) {
    throw new Error(`convertToPdf failed with status ${response.status}`);
  }

  const data = await response.json();
  return Buffer.from(data.file, 'base64');
}

async function fetchSection({
  companyName,
  symbol,
  schema,
  schemaName,
  prompt,
}: {
  companyName: string;
  symbol: string;
  schema: ZodType<any, ZodTypeDef, any>;
  schemaName: string;
  prompt: string;
}) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const response = await client.responses.create({
    model: 'gpt-5.2-2025-12-11',
    text: {
      format: zodTextFormat(schema, schemaName),
    },
    reasoning: { effort: 'low' },
    tools: [{ type: 'web_search', search_context_size: 'high' }],
    tool_choice: 'auto',
    input: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `${prompt}\n\nCompany: ${companyName}\n\nSymbol: ${symbol}`,
      },
    ],
  });
  return JSON.parse(response.output_text);
}

export async function fetchAllSections(companyName: string, symbol: string) {
  console.log({companyName,symbol});
  
  const company = await prisma.company.findUnique({
    where: { symbol },
    select: { data: true },
  });
  console.log(Boolean(company));
  if (company?.data) {

    return await createReportBuffer(company.data);
  }
  const overviewPromise = fetchSection({
    companyName: companyName,
    symbol,
    schema: OverviewSchema,
    schemaName: 'Overview',
    prompt: 'Extract company overview and stock metrics.',
  });

  const shareholdersPromise = fetchSection({
    companyName: companyName,
    symbol,
    schema: ShareholderSchema,
    schemaName: 'Shareholders',
    prompt: 'Extract shareholder structure and insider activity.',
  });

  const analystConsensusPromise = fetchSection({
    companyName: companyName,
    symbol,
    schema: AnalystConsensusSchema,
    schemaName: 'AnalystConsensus',
    prompt: 'Extract analyst recommendations and price targets.',
  });

  const financialsPromise = fetchSection({
    companyName: companyName,
    symbol,
    schema: FinancialsSchema,
    schemaName: 'Financials',
    prompt:
      'Extract historical financial statements (income, balance sheet, cash flow).',
  });

  const ratiosPromise = fetchSection({
    companyName: companyName,
    symbol,
    schema: RatiosSchema,
    schemaName: 'Ratios',
    prompt: 'Compute key financial ratios and credit metrics.',
  });

  const segmentsPromise = fetchSection({
    companyName: companyName,
    symbol,
    schema: SegmentsSchema,
    schemaName: 'Segments',
    prompt: 'Extract business segments and revenue breakdown.',
  });

  const competitionPromise = fetchSection({
    companyName: companyName,
    symbol,
    schema: CompetitionSchema,
    schemaName: 'Competition',
    prompt: 'Analyze competitive landscape and market position.',
  });

  const guidancePromise = fetchSection({
    companyName: companyName,
    symbol,
    schema: GuidanceSchema,
    schemaName: 'Guidance',
    prompt:
      'Extract latest earnings results, guidance, and management commentary.',
  });

  const regulatoryPromise = fetchSection({
    companyName: companyName,
    symbol,
    schema: RegulatorySchema,
    schemaName: 'Regulatory',
    prompt: 'Identify regulatory, legal, and policy risks.',
  });

  const newsPromise = fetchSection({
    companyName: companyName,
    symbol,
    schema: NewsSchema,
    schemaName: 'News',
    prompt: 'Extract recent news and corporate actions.',
  });

  const projectionsPromise = fetchSection({
    companyName: companyName,
    symbol,
    schema: ProjectionsSchema,
    schemaName: 'Projections',
    prompt: 'Generate forward projections and assumptions.',
  });

  const valuationPromise = fetchSection({
    companyName: companyName,
    symbol,
    schema: ValuationSchema,
    schemaName: 'Valuation',
    prompt: 'Produce a discounted cash flow valuation.',
  });

  const scenariosPromise = fetchSection({
    companyName: companyName,
    symbol,
    schema: ScenariosSchema,
    schemaName: 'Scenarios',
    prompt: 'Define bull, base, and bear valuation scenarios.',
  });

  const catalystsPromise = fetchSection({
    companyName: companyName,
    symbol,
    schema: CatalystsSchema,
    schemaName: 'Catalysts',
    prompt: 'Identify key upside and downside catalysts.',
  });

  const esgPromise = fetchSection({
    companyName: companyName,
    symbol,
    schema: ESGSchema,
    schemaName: 'ESG',
    prompt: 'Extract ESG and corporate governance highlights.',
  });

  const results = (
    await Promise.allSettled([
      overviewPromise,
      shareholdersPromise,
      analystConsensusPromise,
      financialsPromise,
      ratiosPromise,
      segmentsPromise,
      competitionPromise,
      guidancePromise,
      regulatoryPromise,
      newsPromise,
      projectionsPromise,
      valuationPromise,
      scenariosPromise,
      catalystsPromise,
      esgPromise,
    ])
  )
    .filter((promise) => promise.status == 'fulfilled')
    .map((promise) => promise.value);

  // const results = (await readJson())

  let data = {};
  for (const item of results) {
    data = { ...data, ...item };
  }

  const jsonResult = {
    companyName,
    reportDate: new Date().toISOString(),
    ...data,
  };
  await prisma.company.create({ data: { symbol, data: jsonResult } });

  return await createReportBuffer(jsonResult);
}

export async function fetchDummyReportBuffer(): Promise<Buffer> {
  const file = await readFile('./report_data.json', 'utf-8');
  const data = JSON.parse(file);
  return await createReportBuffer({
    ...data,
    reportDate: new Date().toISOString(),
  });
}
