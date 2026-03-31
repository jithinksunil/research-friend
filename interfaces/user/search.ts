export interface SearchSuggestion {
  id: string;
  name: string;
  region: string;
  symbol: string;
}

export interface YahooSearchQuote {
  symbol?: string | null;
  shortname?: string | null;
  longname?: string | null;
  exchDisp?: string | null;
  exchange?: string | null;
}
