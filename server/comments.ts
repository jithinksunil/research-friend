import 'server-only';

import prisma from '@/prisma';
import { getSession } from './auth';

export interface CompanyComment {
  id: number;
  text: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
  };
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function serializeComment(comment: {
  id: number;
  text: string;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
  };
}): CompanyComment {
  return {
    id: comment.id,
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
    user: {
      id: comment.user.id,
      firstName: comment.user.firstName,
      lastName: comment.user.lastName,
    },
  };
}

export async function listCompanyComments(symbol: string): Promise<CompanyComment[]> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const normalizedSymbol = normalizeSymbol(symbol);
  if (!normalizedSymbol) {
    throw new Error('Symbol is required');
  }

  const comments = await prisma.comment.findMany({
    where: {
      company: {
        symbol: normalizedSymbol,
      },
    },
    select: {
      id: true,
      text: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return comments.map(serializeComment);
}

export async function createCompanyComment(symbol: string, text: string): Promise<CompanyComment> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const normalizedSymbol = normalizeSymbol(symbol);
  const normalizedText = text.trim();

  if (!normalizedSymbol) {
    throw new Error('Symbol is required');
  }

  if (!normalizedText) {
    throw new Error('Comment is required');
  }

  if (normalizedText.length > 1000) {
    throw new Error('Comment must be 1000 characters or fewer');
  }

  const company = await prisma.company.upsert({
    where: { symbol: normalizedSymbol },
    update: {},
    create: { symbol: normalizedSymbol },
    select: { id: true },
  });

  const comment = await prisma.comment.create({
    data: {
      text: normalizedText,
      companyId: company.id,
      userId: session.userId,
    },
    select: {
      id: true,
      text: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return serializeComment(comment);
}
