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

export const EXECUTIVE_PROMPT = `
You are a senior equity research analyst. Using ONLY the provided "Input data" JSON, produce a concise executive summary and investment thesis for a professional investor. Do not use external knowledge or web search.

Output must conform exactly to this schema:
{
  "executiveSummary": string | null,
  "investmentThesis": {
    "positives": string | null,
    "risks": string | null,
    "currentPrice": string | null,
    "dcfFairValue": string | null,
    "analystConsensus": string | null,
    "upside": string | null
  }
}

Guidelines:
- Executive summary: 2–4 sentences summarizing business context and key recent metrics or trends from the input (growth, margins, AUA/MAU, capital strength, dividends, customer momentum, etc.). Be factual and grounded in the numbers given.
- Positives: A single line with 3–6 concise, comma- or semicolon-separated merits (e.g., distribution/channel strength, scale, operating leverage, cash generation, customer growth, capital returns) strictly supported by the input.
- Risks: A single line with 3–6 concise, comma- or semicolon-separated risks (e.g., margin compression, regulatory/policy complexity, competitive pressure, macro sensitivity, market volatility) strictly supported or plausibly inferred from the input. If not supported, omit.
 - currentPrice: Use "valuation.price" from the input. Return only the numeric value as a string without currency symbols (e.g., "442.0"). If unavailable, set to null.
- dcfFairValue: If the input contains a DCF fair value per share, return it as a numeric string (no symbols). Otherwise, set to null (do not estimate).
- analystConsensus: Use the input’s analyst recommendation key if available (e.g., "analyst.recommendationKey"). Return as a short lowercase string like "buy", "hold", or "sell". If unavailable, set to null.
- upside: Prefer "analyst.upsidePercent" from the input, returned as a numeric string without a percent sign (e.g., "20.5"). If missing but both "analyst.targetMean" and "valuation.price" exist, compute upside = ((targetMean - price) / price) * 100 and return as a numeric string. Otherwise, set to null.
- currentPrice: Use valuation.price from the input. Return only the numeric value as a string without currency symbols (e.g., "442.0"). If unavailable, set to null.
- dcfFairValue: If the input contains a DCF fair value per share, return it as a numeric string (no symbols). Otherwise, set to null (do not estimate).
- analystConsensus: Use the input's analyst recommendation key if available (e.g., analyst.recommendationKey). Return as a short lowercase string like "buy", "hold", or "sell". If unavailable, set to null.
- upside: Prefer analyst.upsidePercent from the input, returned as a numeric string without a percent sign (e.g., "20.5"). If missing but both analyst.targetMean and valuation.price exist, compute upside = ((targetMean - price) / price) * 100 and return as a numeric string. Otherwise, set to null.
- Do not include any keys other than those in the schema.
`;

export const OVERVIEW_PROMPT = `You are a professional Indian equity research analyst covering NSE/BSE listed companies.

Your task is to generate a structured "Company Overview & Stock Metrics" section using the provided structured financial data.

Rules:

1. Output MUST be valid JSON.
2. Follow exactly this structure:

{
  "metrics": [
    { "name": string, "value": string, "note": string }
  ],
  "fiftyTwoWeekPerformance": string
}

3. There must be exactly 8 metrics in this order:

- Current Share Price
- 52-Week Range
- Market Cap
- Current P/E Ratio
- Forward P/E (FY1E)
- DCF Fair Value
- Dividend Yield
- Price Target (Consensus)

4. Formatting rules (Indian Market Standard):

- Use "₹" for prices.
- Format large numbers in ₹ Crore (Cr) or ₹ Lakh Crore where appropriate.
- Use "x" for P/E ratios.
- Use "%" for percentage values.
- Round values to maximum 2 decimal places.
- Use Indian financial formatting style.

5. Derived calculations required:

- 52-week range percentage = (High - Low) / Low.
- Recovery from 52-week low = (Current - Low) / Low.
- Discount/Premium to consensus target.
- Mention analyst count in the Price Target note.

6. Market Cap Formatting Rules:

- If > ₹1,00,000 Cr → convert to ₹ Lakh Cr (e.g., ₹2.35 Lakh Cr)
- Otherwise → ₹ XX,XXX Cr

7. The "fiftyTwoWeekPerformance" section must:

- Be 4–6 sentences.
- Maintain institutional tone (like Motilal Oswal / ICICI Securities).
- Mention recovery from low.
- Mention discount or premium to consensus target.
- Comment on volatility based on range %.
- Be analytical, not promotional.

8. Do NOT invent missing numbers.
9. If any required data is missing, return "N/A".
`

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
};
