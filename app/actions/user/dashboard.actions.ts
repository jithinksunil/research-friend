'use server';

import { ROLES } from '@/app/generated/prisma/enums';
import {
  BalanceSheetData,
  CompanyOverview,
  StockDashboardData,
} from '@/interfaces';
import { convertToErrorInstance, unauthorizedMessage } from '@/lib';
import prisma from '@/prisma';
import {
  getHistory,
  getQuickMetrics,
  getRiskMetrics,
  getSession,
  getStockDashboardData,
  requireRBAC,
} from '@/server';

export const getDashboardData = requireRBAC(ROLES.USER)<StockDashboardData>(
  async (symbol: string) => {
    try {
      const API_KEY = process.env.ALPHA_VANTAGE_API_KEY!;
      const BASE = 'https://www.alphavantage.co/query';
      const keyMetrics = await getStockDashboardData(symbol, API_KEY, BASE);
      const chartData = await getHistory(symbol);
      const quickMetrics = await getQuickMetrics(symbol);
      const riskMetrics=await getRiskMetrics(symbol);
      return {
        okay: true,
        data: {
          keyMetrics,
          chartData,
          quickMetrics,
          riskMetrics
        },
      };
    } catch (error) {
      return { okay: false, error: convertToErrorInstance(error) };
    }
  },
);

export const getOverview = requireRBAC(ROLES.USER)<CompanyOverview>(async (
  symbol: string,
) => {
  try {
    const trimmed = symbol.trim().toUpperCase();
    if (!trimmed) {
      return {
        okay: false,
        error: new Error('Symbol is required'),
      };
    }

    const url = `${process.env.ALPHA_VANTAGE_BASE_URL}?function=OVERVIEW&symbol=${encodeURIComponent(
      trimmed,
    )}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return {
        okay: false,
        error: new Error(`Request failed (${res.status})`),
      };
    }

    const json = (await res.json()) as
      | CompanyOverview
      | {
          Information?: string;
          Note?: string;
          'Error Message'?: string;
        }
      | undefined;

    if (!json) {
      return {
        okay: false,
        error: new Error('No data received from API'),
      };
    }

    // Alpha Vantage sometimes returns rate limit / error payloads
    const errorResponse = json as {
      Information?: string;
      Note?: string;
      'Error Message'?: string;
    };

    const apiMessage =
      errorResponse.Note ||
      errorResponse.Information ||
      errorResponse['Error Message'];
    if (apiMessage && !('Symbol' in json)) {
      return {
        okay: false,
        error: new Error(apiMessage),
      };
    }

    // Check if we have valid overview data
    if (!('Symbol' in json) || !(json as CompanyOverview).Symbol) {
      return {
        okay: false,
        error: new Error('Invalid response format from API'),
      };
    }

    return { okay: true, data: json as CompanyOverview };
  } catch (error) {
    return { okay: false, error: convertToErrorInstance(error) };
  }
});

export const getBalanceSheet = requireRBAC(ROLES.USER)<BalanceSheetData>(async (
  symbol: string,
) => {
  try {
    const trimmed = symbol.trim().toUpperCase();
    if (!trimmed) {
      return {
        okay: false,
        error: new Error('Symbol is required'),
      };
    }

    const url = `${process.env.ALPHA_VANTAGE_BASE_URL}?function=BALANCE_SHEET&symbol=${encodeURIComponent(
      trimmed,
    )}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return {
        okay: false,
        error: new Error(`Request failed (${res.status})`),
      };
    }

    const json = (await res.json()) as
      | BalanceSheetData
      | {
          Information?: string;
          Note?: string;
          'Error Message'?: string;
        }
      | undefined;

    if (!json) {
      return {
        okay: false,
        error: new Error('No data received from API'),
      };
    }

    // Alpha Vantage sometimes returns rate limit / error payloads
    const errorResponse = json as {
      Information?: string;
      Note?: string;
      'Error Message'?: string;
    };

    const apiMessage =
      errorResponse.Note ||
      errorResponse.Information ||
      errorResponse['Error Message'];
    if (apiMessage && !('symbol' in json)) {
      return {
        okay: false,
        error: new Error(apiMessage),
      };
    }

    // Check if we have valid balance sheet data
    if (!('symbol' in json) || !(json as BalanceSheetData).symbol) {
      return {
        okay: false,
        error: new Error('Invalid response format from API'),
      };
    }

    return { okay: true, data: json as BalanceSheetData };
  } catch (error) {
    return { okay: false, error: convertToErrorInstance(error) };
  }
});

export const registerVote = requireRBAC(ROLES.USER)(async ({
  symbol,
  vote,
}: {
  vote: boolean;
  symbol: string;
}) => {
  try {
    const user = await getSession();
    if (!user) {
      return { okay: false, error: new Error(unauthorizedMessage) };
    }
    console.log(user);

    const company = await prisma.company.upsert({
      where: { symbol },
      update: {},
      create: { symbol },
      select: { id: true },
    });
    await prisma.vote.upsert({
      where: {
        companyId_userId: { companyId: company.id, userId: user.userId },
      },
      update: { positive: vote },
      create: { positive: vote, userId: user.userId, companyId: company.id },
    });
    return { okay: true, data: null };
  } catch (error) {
    return { okay: false, error: convertToErrorInstance(error) };
  }
});

export const getVotes = requireRBAC(ROLES.USER)(async (symbol: string) => {
  try {
    const votes = await prisma.vote.findMany({
      where: { company: { symbol } },
      select: { positive: true },
    });
    return {
      okay: true,
      data: {
        upVotes: votes.filter((vote) => vote.positive).length,
        downVotes: votes.filter((vote) => !vote.positive).length,
      },
    };
  } catch (error) {
    return { okay: false, error: convertToErrorInstance(error) };
  }
});
