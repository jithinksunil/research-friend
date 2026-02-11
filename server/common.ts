import 'server-only';
import { ROLES } from '@/app/generated/prisma/enums';
import { ServerActionResult } from '@/interfaces';
import { redirect } from 'next/navigation';
import { getSession } from './auth';
import { forbiddenMessage, unauthorizedMessage } from '@/lib';
import { ZodObject, ZodType } from 'zod';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod.mjs';

export function requireRBAC(role: ROLES) {
  return function <T>(
    action: (...args: any) => Promise<ServerActionResult<T>>,
  ) {
    return async (...args: any): Promise<ServerActionResult<T>> => {
      const user = await getSession();
      if (!user) {
        throw new Error(unauthorizedMessage);
      }
      if (user.role !== role) {
        throw new Error(forbiddenMessage);
      }
      return await action(...args);
    };
  };
}

export async function requirePageLevelRBAC(role: ROLES) {
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
  input,
  prompt,
}: {
  schemaName: string;
  schema: ZodObject<any>;
  input: string;
  prompt: string;
}): Promise<T> {
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
      { role: 'system', content: prompt },
      {
        role: 'user',
        content: `Input data: ${input}`,
      },
    ],
  });
  return JSON.parse(response.output_text);
}
