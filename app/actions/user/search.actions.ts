'use server';
import { ROLES } from '@/app/generated/prisma/enums';
import { SearchSuggestion } from '@/interfaces';
import { convertToErrorInstance } from '@/lib';
import { requireRBAC } from '@/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export const searchForCompanies = requireRBAC(ROLES.USER)<SearchSuggestion[]>(
  async (query: string) => {
    try {
      const trimmed = query.trim();
      if (!trimmed) return { okay: true, data: [] };

      const results = await yahooFinance.search(trimmed, {
        quotesCount: 10,
        newsCount: 0,
        enableFuzzyQuery: true,
      });

      const quotes = Array.isArray(results?.quotes) ? results.quotes : [];
      const suggestions: SearchSuggestion[] = quotes
        .map((quote) => {
          if (!quote || typeof quote !== 'object') return null;

          const symbol =
            typeof (quote as { symbol?: unknown }).symbol === 'string'
              ? (quote as { symbol: string }).symbol.trim()
              : '';

          if (!symbol) return null;

          const name =
            (typeof (quote as { shortname?: unknown }).shortname === 'string'
              ? (quote as { shortname: string }).shortname.trim()
              : '') ||
            (typeof (quote as { longname?: unknown }).longname === 'string'
              ? (quote as { longname: string }).longname.trim()
              : '') ||
            symbol;

          const region =
            (typeof (quote as { exchDisp?: unknown }).exchDisp === 'string'
              ? (quote as { exchDisp: string }).exchDisp.trim()
              : '') ||
            (typeof (quote as { exchange?: unknown }).exchange === 'string'
              ? (quote as { exchange: string }).exchange.trim()
              : '');

          return {
            id: `${symbol}-${region || 'unknown'}`,
            symbol,
            name,
            region,
          };
        })
        .filter((item): item is SearchSuggestion => Boolean(item));

      return { okay: true, data: suggestions };
    } catch (error) {
      return { okay: false, error: convertToErrorInstance(error) };
    }
  }
);
