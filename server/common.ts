import 'server-only';
import { ROLES } from '@/app/generated/prisma/enums';
import { redirect } from 'next/navigation';
import { getSession } from './auth';
import { forbiddenMessage, unauthorizedMessage } from '@/lib';
import z, { ZodObject, ZodRawShape } from 'zod';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod.mjs';

export async function requirePageLevelRBAC({ role }: { role: ROLES }): Promise<void> {
  const user = await getSession();
  if (!user) {
    return redirect(`/?message=${unauthorizedMessage}`);
  }
  if (user?.role !== role) {
    return redirect(`/?message=${forbiddenMessage}`);
  }
}

export async function fetchSection<T>({
  schema,
  schemaName,
  systemPrompt,
  userPrompt,
  options,
}: {
  schemaName: string;
  schema: ZodObject<ZodRawShape>;
  systemPrompt: string;
  userPrompt: string;
  options?: {
    enableWebSearch?: boolean;
  };
}): Promise<T> {
  const enableWebSearch = options?.enableWebSearch ?? false;
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const response = await client.responses.create({
    model: 'gpt-5.2-2025-12-11',
    text: {
      format: zodTextFormat(schema, schemaName),
    },
    reasoning: { effort: 'low' },
    ...(enableWebSearch
      ? {
          tools: [{ type: 'web_search' as const, search_context_size: 'high' as const }],
          tool_choice: 'auto' as const,
        }
      : {}),
    input: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });
  return JSON.parse(response.output_text);
}

export async function improveSection<T extends ZodRawShape>({
  schema,
  schemaName,
  systemPrompt,
  sectionDetails,
  improvementNeeded,
}: {
  schemaName: string;
  schema: ZodObject<T>;
  systemPrompt: string;
  sectionDetails: string;
  improvementNeeded: string;
}): Promise<z.infer<ZodObject<T>>> {
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
      {
        role: 'system',
        content:
          'You are a helpful assistant. Both data of a section and the previous prompts used to generate it are provided to you, you have to extract more information from internet and enhance a section.',
      },
      {
        role: 'user',
        content: `Input data:${sectionDetails}`,
      },
      { role: 'user', content: `Previous prompts: ${systemPrompt}` },
      {
        role: 'user',
        content: `Improvement needed: ${improvementNeeded}, Gather more information from internet and enhance the section.`,
      },
    ],
  });
  return JSON.parse(response.output_text);
}
