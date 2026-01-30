export const productName = 'AI.Fred Research Assistant';
export const unauthorizedMessage = 'Unauthorized';
export const forbiddenMessage = 'Forbidden';
export const ACCESS_TOKEN_EXPIRATION_S = 60 * 30; //30 minutes
export const REFRESH_TOKEN_EXPIRATION_S = 60 * 60 * 24 * 30; //30 days
export const brandingColors = {
  primary: '#6F0652',
  secondary: '#F9E7EA',
  background: '#FFFFFF',
  foreground: '#171717',
  // background: '#171717',
  // foreground: '#FFFFFF',
};
export const SYSTEM_PROMPT = `
You are a senior equity research analyst at a global investment bank.

Rules:
- Use only verified public information
- Be conservative with assumptions
- Separate facts vs estimates
- Output JSON ONLY
- Follow the schema strictly
`;

export const company = {
    tickName: 'AAPL',
    companyName: 'Apple Inc.',
    businessDescription: `Apple Inc. is a preeminent American multinational technology company renowned for its innovative consumer electronics, software, and online services. With a staggering revenue of $274.5 billion in 2020, it stands as the world's most valuable publicly traded company, significantly influencing the global technology sector. Its flagship products—iPhone, iPad, and Mac—continue to define consumer expectations and set industry benchmarks, securing its position as a leader in both the smartphone and personal computer markets. As a key player among the "Big Five" technology firms, Apple remains at the forefront of technological advancements and consumer engagement strategies.`,
    overview: [
      {
        label: 'Market Cap',
        value: 1834000000000,
        unit: 'USD',
        format: 'currencyCompact',
        id: 'marketCap',
      },
      {
        label: 'P/E Ratio',
        value: 54.23,
        unit: null,
        format: 'number',
        id: 'peRatio',
      },
      {
        label: '52 Week High',
        value: 188.65,
        unit: 'USD',
        format: 'currency',
        id: 'week52High',
      },
      {
        label: '52 Week Low',
        value: 118.35,
        unit: 'USD',
        format: 'currency',
        id: 'week52Low',
      },
      {
        label: 'Average Volume',
        value: 56234890,
        unit: 'shares',
        format: 'compact',
        id: 'avgVolume',
      },
      {
        label: 'Beta',
        value: 1.19,
        unit: null,
        format: 'number',
        id: 'beta',
      },
      {
        label: 'EPS (TTM)',
        value: 2.9,
        unit: 'USD',
        format: 'currency',
        id: 'epsTTM',
      },
      {
        label: 'YTD Return',
        value: 6.73,
        unit: '%',
        format: 'percentage',
        id: 'ytdReturn',
      },
    ],
    fundamentalsMetrics: [
      {
        id: 'revenueTTM',
        label: 'Revenue (TTM)',
        value: 574800000000,
        unit: 'USD',
        format: 'currencyCompact',
      },
      {
        id: 'revenueGrowth',
        label: 'Revenue Growth',
        value: 12.4,
        unit: '%',
        format: 'percentage',
      },
      {
        id: 'netIncomeTTM',
        label: 'Net Income (TTM)',
        value: 30400000000,
        unit: 'USD',
        format: 'currencyCompact',
      },
      {
        id: 'freeCashFlowTTM',
        label: 'Free Cash Flow (TTM)',
        value: 35300000000,
        unit: 'USD',
        format: 'currencyCompact',
      },
      {
        id: 'operatingMargin',
        label: 'Operating Margin',
        value: 9.1,
        unit: '%',
        format: 'percentage',
      },
      {
        id: 'debtEquity',
        label: 'Debt / Equity',
        value: 1.12,
        unit: null,
        format: 'number',
      },
      {
        id: 'roe',
        label: 'ROE',
        value: 19.3,
        unit: '%',
        format: 'percentage',
      },
      {
        id: 'roa',
        label: 'ROA',
        value: 6.8,
        unit: '%',
        format: 'percentage',
      },
    ],
    riskMetrics: [
      {
        id: 'beta',
        label: 'Beta',
        value: 1.19,
        unit: null,
        format: 'number',
        description:
          'Measures how volatile the stock is compared to the overall market. Beta > 1 means higher risk.',
      },
      {
        id: 'volatility1Y',
        label: 'Volatility (1Y)',
        value: 28.4,
        unit: '%',
        format: 'percentage',
        description:
          'Annualized price fluctuation over the past year. Higher volatility means larger price swings.',
      },
      {
        id: 'maxDrawdown1Y',
        label: 'Max Drawdown (1Y)',
        value: -34.7,
        unit: '%',
        format: 'percentage',
        description:
          'Maximum observed loss from peak to trough over the past year.',
      },
      {
        id: 'debtRatio',
        label: 'Debt Ratio',
        value: 0.61,
        unit: null,
        format: 'number',
        description:
          'Proportion of assets financed by debt. Higher values indicate higher financial leverage.',
      },
    ],
    companyProfile: [
      {
        label: 'Sector',
        value: 'Consumer Cyclical',
      },
      {
        label: 'Industry',
        value: 'Internet Retail',
      },
      {
        label: 'Country',
        value: 'United States',
      },
    ],
  }