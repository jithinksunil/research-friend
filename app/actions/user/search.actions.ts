'use server';
import { ROLES } from '@/app/generated/prisma/enums';
import { SearchSuggestion } from '@/interfaces';
import { convertToErrorInstance } from '@/lib';
import { requireRBAC } from '@/server';

export const searchForCompanies = requireRBAC(ROLES.USER)<SearchSuggestion[]>(
  async (query: string) => {
    try {
      const trimmed = query.trim();
      if (!trimmed) return { okay: true, data: [] };

      const url = `${process.env.ALPHA_VANTAGE_BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(
        trimmed
      )}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;

      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        return {
          okay: false,
          error: new Error(`Request failed (${res.status})`),
        };
      }

      const json = (await res.json()) as
        | {
            bestMatches?: Array<Record<string, string>>;
            Information?: string;
            Note?: string;
            'Error Message'?: string;
          }
        | undefined;

      if (!json) return { okay: true, data: [] };

      // Alpha Vantage sometimes returns rate limit / error payloads without bestMatches
      const apiMessage = json.Note || json.Information || json['Error Message'];
      if (apiMessage && !json.bestMatches) {
        return {
          okay: false,
          error: new Error(apiMessage),
        };
      }

      const suggestions: SearchSuggestion[] = (json.bestMatches || []).map(
        (m) => {
          const symbol = (m['1. symbol'] || '').trim();
          const name = (m['2. name'] || '').trim();
          const region = (m['4. region'] || '').trim();

          return {
            id: `${symbol || name}-${region || 'unknown'}`,
            symbol,
            name,
            region,
          };
        }
      );

      return { okay: true, data: suggestions };
    } catch (error) {
      return { okay: false, error: convertToErrorInstance(error) };
    }
  }
);
