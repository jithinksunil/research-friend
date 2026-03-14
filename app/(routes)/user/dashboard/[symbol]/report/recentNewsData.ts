export type NewsItem = {
  title: string;
  description: string;
  link?: string;
};

export type CatalystItem = {
  title: string;
  bullets: string[];
};

export const companyRelatedNews: NewsItem[] = [
  {
    title: 'FY25 Final Results (Dec 3, 2025)',
    link: 'https://www.ajbell.co.uk/group/sites/ajbell.co.uk/files/accounts/FY25-results-announcement.pdf',
    description:
      'Record revenue £317.8m (+18%), PBT £137.8m (+22%), DPS 14.25p (+14%). Market reaction: -7% on margin guidance and ISA cost concerns.',
  },
  {
    title: 'Platinum SIPP/SSAS Sale Completion (Nov 3, 2025)',
    description:
      'Sold to InvestAcc Group for up to £25m (£18.5m upfront + £6.5m deferred). Simplifies business model; enables focus on core platform. Strategic positive.',
  },
  {
    title: 'AGM & £50m Buyback Announcement (Dec 2025)',
    link: 'https://www.ajbell.co.uk/group/investor-relations/market-announcements/notice-agm-2',
    description:
      'AGM scheduled Feb 4, 2026. New buyback authorization reflects confidence and strong capital position. Shareholder-friendly capital allocation policy.',
  },
  {
    title: 'Board Changes (Dec 2025)',
    description:
      'Evelyn Bourke (Senior Independent Director) stepping down Feb 4, 2026. Fiona Fry appointed as new SID. Succession planning underway; stable governance expected.',
  },
  {
    title: 'Gilt MPS Range Expansion (Recent)',
    description:
      'Launched Gilt MPS 4 portfolio; AJ Bell Investcentre trusts for IHT planning. Product innovation ongoing; demonstrates response to customer needs.',
  },
];

export const industryNewsAndCatalysts: CatalystItem[] = [
  {
    title: 'UK ISA Reforms (Announced Oct 2024, Effective April 2027)',
    bullets: [
      'Cash ISA cap £12,000 for under-65s (from unlimited)',
      'Stocks & Shares ISA: HMRC cash charge planned (mechanism unclear)',
      'Likely to reduce retail investing volumes 5-10% near-term; AJ Bell exposed to D2C ISA portion (~40% of D2C assets)',
      'Management Response: Advocating for simplification; confidence in ability to navigate complexity',
    ],
  },
  {
    title: 'Pension Tax Uncertainty (Ongoing)',
    bullets: [
      'Lump sum entitlement changes under pressure; April 2027 IHT rule change imminent',
      'Elevated pension withdrawals in FY25 (hedging against policy changes) likely to normalize FY26',
      'AJ Bell Exposure: Advised segment (£62.4bn AUA) concentrated in pension pots; sensitive to tax policy',
    ],
  },
  {
    title: 'Platform Market Growth (Structural)',
    bullets: [
      'UK platform AUA estimated £700bn+ (FCA data); TAM £3.7tn (~2/3 off-platform)',
      'Annual inflows to platforms: £30-40bn; compound growth ~15% CAGR',
      'Opportunity: AJ Bell at 2.5-3% market share; potential to reach 4-5% by FY30',
    ],
  },
  {
    title: 'Competitive Dynamics',
    bullets: [
      'Interactive Investor (largest competitor) has maintained scale; recent margin pressure',
      'Hargreaves Lansdown (legacy platform) facing technology debt; slower growth',
      'Emerging fintech (Freetrade, Trading 212) gaining volume but low profitability',
      'AJ Bell Positioning: Differentiated via dual-channel + brand; less price-competitive than emergents but higher-quality service',
    ],
  },
  {
    title: 'Macro/Market Sentiment (2026 Outlook)',
    bullets: [
      'Bank of England likely to maintain 4.75% base rate into H2 2026; some easing expected H2',
      'Stock market volatility expected; political uncertainty (next UK election likely 2025-26); retail investor sentiment mixed',
      'Tailwind: Gilt yields (4-5%+) make equities attractive relative to cash; potential boost to equity platform flows',
    ],
  },
];
