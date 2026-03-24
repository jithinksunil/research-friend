'use server';

import { ROLES } from '@/app/generated/prisma/enums';
import { SearchSuggestion } from '@/interfaces';
import { convertToErrorInstance } from '@/lib';
import { requireRBAC } from '@/server';

export const searchForCompanies = requireRBAC(ROLES.USER)<SearchSuggestion[]>(async (
  query: string,
) => {
  try {
    const trimmed = query.trim();
    if (!trimmed) return { okay: true, data: [] };

    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
      trimmed,
    )}&quotesCount=10&newsCount=0`;

    const res = await fetch(url, {
      next: { revalidate: 3600 }, // optional caching
    });

    if (!res.ok) throw new Error('Yahoo search failed');

    const data = await res.json();

    const quotes = Array.isArray(data?.quotes) ? data.quotes : [];

    const suggestions: SearchSuggestion[] = quotes
      .map((quote: any) => {
        const symbol = quote?.symbol?.trim();
        if (!symbol) return null;

        const name = quote?.shortname?.trim() || quote?.longname?.trim() || symbol;

        const region = quote?.exchDisp?.trim() || quote?.exchange?.trim() || '';

        return {
          id: `${symbol}-${region || 'unknown'}`,
          symbol,
          name,
          region,
        };
      })
      .filter(Boolean);

    return { okay: true, data: suggestions };
  } catch (error) {
    return { okay: false, error: convertToErrorInstance(error) };
  }
});
