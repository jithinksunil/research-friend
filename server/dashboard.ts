import 'server-only'
import { requireRBAC } from './common';
import { ROLES } from '@/app/generated/prisma/enums';
import { KeyMetrics, StockDashboardData, TimeSeriesDailyResponse } from '@/interfaces';


export async function getStockDashboardData(symbol: string,API_KEY:string,BASE:string):Promise<KeyMetrics> {
    const safeFetch = async (url: string) => {
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (json?.Note || json?.Error || Object.keys(json).length === 0) {
          return null;
        }
        return json;
      } catch {
        return null;
      }
    };
  
    // -----------------------------
    // 1. Fetch all endpoints safely
    // -----------------------------
    const [
      overview,
      prices,
      income,
      balance,
      cashflow,
    ] = await Promise.all([
      safeFetch(`${BASE}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`),
      safeFetch(`${BASE}?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=${API_KEY}`),
      safeFetch(`${BASE}?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${API_KEY}`),
      safeFetch(`${BASE}?function=BALANCE_SHEET&symbol=${symbol}&apikey=${API_KEY}`),
      safeFetch(`${BASE}?function=CASH_FLOW&symbol=${symbol}&apikey=${API_KEY}`),
    ]);
  
    const timeSeries = prices?.['Time Series (Daily)'] ?? null;
    const incomeQ = income?.quarterlyReports ?? null;
    const balanceQ = balance?.quarterlyReports ?? null;
    const cashflowQ = cashflow?.quarterlyReports ?? null;
  
    // -----------------------------
    // 2. Safe helpers
    // -----------------------------
    const safeNumber = (v: any) =>
      v === undefined || v === null || v === 'None' ? null : Number(v);
  
    const ttm = (reports: any[] | null, field: string) => {
      if (!reports || reports.length < 4) return null;
      return reports
        .slice(0, 4)
        .reduce((s, r) => s + safeNumber(r[field])!, 0);
    };
  
    const calcYTD = () => {
      if (!timeSeries) return null;
      const entries = Object.entries(timeSeries);
      //@ts-ignore
      const current = safeNumber(entries[0][1]['4. close']);
      const jan = entries.find(([d]) =>
        d.startsWith(new Date().getFullYear().toString())
      );
      if (!current || !jan) return null;
      //@ts-ignore
      const janPrice = safeNumber(jan[1]['4. close']);
      return janPrice ? ((current - janPrice) / janPrice) * 100 : null;
    };
  
    const calcVolatility = () => {
      if (!timeSeries) return null;
      const prices = Object.values(timeSeries)
        .slice(0, 252)
        .map((d: any) => safeNumber(d['4. close']))
        .filter(Boolean) as number[];
      if (prices.length < 2) return null;
      const returns = prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      return (
        Math.sqrt(
          returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length
        ) * 100
      );
    };
  
    const calcMaxDrawdown = () => {
      if (!timeSeries) return null;
      const prices = Object.values(timeSeries)
        .slice(0, 252)
        .map((d: any) => safeNumber(d['4. close']))
        .filter(Boolean)
        .reverse() as number[];
      if (!prices.length) return null;
      let peak = prices[0];
      let max = 0;
      for (const p of prices) {
        if (p > peak) peak = p;
        max = Math.min(max, (p - peak) / peak);
      }
      return max * 100;
    };
  
    // -----------------------------
    // 3. UI-ready response
    // -----------------------------
    return {
      header: {
        symbol,
        name: overview?.Name ?? null,
        exchange: overview?.Exchange ?? null,
      },
      
  
      keyMetrics: [
        { label: 'Market Cap', value: safeNumber(overview?.MarketCapitalization), unit: 'USD', format: 'currencyCompact' },
        { label: 'P/E Ratio', value: safeNumber(overview?.PERatio), format: 'number' },
        { label: '52W High', value: safeNumber(overview?.['52WeekHigh']), unit: 'USD', format: 'currency' },
        { label: '52W Low', value: safeNumber(overview?.['52WeekLow']), unit: 'USD', format: 'currency' },
        { label: 'Avg Volume', value: safeNumber(overview?.AverageVolume), format: 'compact' },
        { label: 'EPS (TTM)', value: safeNumber(overview?.EPS), unit: 'USD', format: 'currency' },
        { label: 'YTD Return', value: calcYTD(), unit: '%', format: 'percentage' },
      ],
  
      fundamentals: [
        { label: 'Revenue (TTM)', value: ttm(incomeQ, 'totalRevenue'), unit: 'USD', format: 'currencyCompact' },
        { label: 'Net Income (TTM)', value: ttm(incomeQ, 'netIncome'), unit: 'USD', format: 'currencyCompact' },
        { label: 'Free Cash Flow', value: cashflowQ ? ttm(cashflowQ, 'operatingCashflow')! - ttm(cashflowQ, 'capitalExpenditures')! : null, unit: 'USD', format: 'currencyCompact' },
        { label: 'Operating Margin', value: incomeQ ? (ttm(incomeQ, 'operatingIncome')! / ttm(incomeQ, 'totalRevenue')!) * 100 : null, unit: '%', format: 'percentage' },
        { label: 'Debt / Equity', value: balanceQ ? safeNumber(balanceQ[0]?.totalLiabilities)! / safeNumber(balanceQ[0]?.totalShareholderEquity)! : null, format: 'number' },
      ],
  
      riskMetrics: [
        { label: 'Beta', value: safeNumber(overview?.Beta), format: 'number',description:'Measures how volatile the stock is compared to the overall market. Beta > 1 means higher risk.' },
        { label: 'Volatility (1Y)', value: calcVolatility(), unit: '%', format: 'percentage' ,description:'Annualized price fluctuation over the past year. Higher volatility means larger price swings.'},
        { label: 'Max Drawdown (1Y)', value: calcMaxDrawdown(), unit: '%', format: 'percentage',description:'Maximum observed loss from peak to trough over the past year.' },
        { label: 'Debt Ratio', value: balanceQ ? safeNumber(balanceQ[0]?.totalLiabilities)! / safeNumber(balanceQ[0]?.totalAssets)! : null, format: 'number' ,description:'Proportion of assets financed by debt. Higher values indicate higher financial leverage.'},
      ],
  
      companyProfile: {
        description: overview?.Description ?? null,
        sector: overview?.Sector ?? null,
        industry: overview?.Industry ?? null,
        country: overview?.Country ?? null,
        name:overview?.Name ?? null
      },
    };
  }
  
export async function getChartData(
  symbol: string,
  API_KEY:string,BASE:string,
  outputSize: 'compact' | 'full' = 'compact',
): Promise<TimeSeriesDailyResponse | null> {

  try {
    const res = await fetch(
      `${BASE}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=${outputSize}&apikey=${API_KEY}`
    );

    const data = await res.json();

    // Handle Alpha Vantage throttling / errors
    if (data?.Note || data?.Error || !data['Time Series (Daily)']) {
      return null;
    }

    return data as TimeSeriesDailyResponse;
  } catch {
    return null;
  }
}