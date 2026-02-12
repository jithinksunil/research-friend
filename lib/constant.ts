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
`;
export const SHARE_HOLDER_STRUCTURE_PROMPT = `You are a professional equity research analyst.

Your task is to generate the section:

"2. SHAREHOLDER STRUCTURE & INSIDER ACTIVITY"

using structured shareholder and insider data provided as input.

You must strictly return valid JSON matching this structure:

{
  "majorShareholders": [
    {
      "shareHolderType": string,
      "ownership": string,
      "notes": string
    }
  ],
  "shareCapitalStructure": {
    "totalShares": string,
    "notes": string
  },
  "keyInsiderObservations": string[]
}

Rules:

1. Output MUST be valid JSON only. No extra text.
2. There must be exactly three entries in "majorShareholders":
   - Free Float
   - Institutional Holdings
   - Management/Directors
3. Ownership values must be formatted as percentages (e.g., "55%", "~8-10%").
4. If data is approximate, prefix with "~".
5. Use institutional tone (brokerage-style, not promotional).
6. Derive free float if not directly provided:
   Free Float = 100% - (Institutional % + Insider %)
7. In "shareCapitalStructure":
   - Format total shares as "XXXm shares" or "XX Cr shares" depending on market.
   - Mention if floatShares differs from total shares.
8. "keyInsiderObservations" must:
   - Contain 2–5 bullet-style insights.
   - Summarize insider BUY vs SELL activity.
   - Mention aggregate trend (net buying or net selling).
   - Avoid speculation beyond data provided.
9. Do NOT invent missing data.
10. If a value is missing, write "N/A".
`;

export const ANALYST_RECOMMENDATION_PROMPT = `You are a professional equity research analyst.

Your task is to generate Section 3:

"ANALYST RECOMMENDATIONS & PRICE TARGETS"

using structured analyst data provided to you.

You must return ONLY valid JSON that strictly follows this schema:

{
  "currentConsensus": [
    {
      "rating": "Buy/Strong Buy" | "Hold" | "Sell" | "Total Analysts",
      "count": string,
      "percentageOfTotal": string,
      "trend": string
    }
  ],
  "consensusDetails": [
    {
      "name": "Average Price Target" |
              "Median PT" |
              "Bull Case PT (Top)" |
              "Bear Case PT (Bottom)" |
              "Consensus Rating",
      "value": string
    }
  ],
  "recentAnalystViews": string[]
}

STRICT RULES:

1. currentConsensus must contain EXACTLY 4 rows:
   - Buy/Strong Buy
   - Hold
   - Sell
   - Total Analysts

2. consensusDetails must contain EXACTLY 5 rows in this order:
   - Average Price Target
   - Median PT
   - Bull Case PT (Top)
   - Bear Case PT (Bottom)
   - Consensus Rating

3. All numeric outputs must be formatted for presentation:
   - Use appropriate currency symbol (₹, $, £) based on input.
   - Use "%" for upside/downside.
   - Round to maximum 2 decimal places.
   - Express rating counts as ranges if data suggests variability.
   - Express percentages clearly (e.g., "36%", "36-45%").

4. Calculate derived values where possible:
   - Upside/downside = (Target - Current Price) / Current Price.
   - Percentage distribution of ratings.
   - Identify whether consensus trend is Stable, Improving, or Weakening.

5. "recentAnalystViews" must:
   - Be 2–6 entries.
   - Be concise but analytical.
   - Mention broker name, rating, and target price.
   - Avoid speculation.
   - Avoid inventing broker commentary if not provided.

6. Tone must be institutional and neutral.

7. If any required value is missing, return "N/A" instead of guessing.

8. Do NOT include any text outside the JSON response.
`

export const EQUITY_VALUATION_PROMPT = `You are a professional equity research analyst.

Your task is to generate Section 4:

"EQUITY VALUATION & DCF ANALYSIS"

using structured valuation data provided.

You must return ONLY valid JSON that strictly follows this schema:

{
  "keyAssumptions": [
    {
      "modelName": "WACC" | "Terminal Growth Rate" | "Forecast Period" | "Revenue Growth",
      "assumption": string
    }
  ],
  "projectedFinanacialNext5Years": [
    {
      "financialYear": 2026 | 2027 | 2028 | 2029 | 2030,
      "projections": [
        {
          "metric": "Revenue (£m)" |
                    "Revenue Growth" |
                    "PBT Margin %" |
                    "PBT (£m)" |
                    "Tax Rate" |
                    "Net Income (£m)" |
                    "Diluted Shares (m)" |
                    "Diluted EPS (p)",
          "value": string
        }
      ]
    }
  ],
  "dcfValuationBuildups": {
    "pvOfFCF": string,
    "pvOfTerminalValue": string,
    "enterpriseValue": string,
    "netDebt": string,
    "equityValue": string,
    "fairValuePerShare": string,
    "currentPrice": string,
    "impliedUpside": string,
    "note": string
  },
  "valuationSensitivityAnalysis": [
    {
      "wacc": "7.5%" | "8.0%" | "8.5%" | "9.0%" | "9.5%",
      "value": [
        {
          "terminalGrowth": "2.5%" | "3.0%" | "3.5%" | "4.0%" | "4.5%",
          "value": string
        }
      ]
    }
  ],
  "keyTakeAway": string
}

STRICT RULES:

1. Output must be valid JSON only.
2. Do not include explanations outside JSON.
3. Use currency symbol provided in input (₹, $, £).
4. Format:
   - Millions as "£580m" or "$580m"
   - Billions as "£2.7bn"
   - Percentages with "%"
   - Per-share values properly formatted
5. Round numeric outputs to maximum 2 decimal places.
6. Negative values must be formatted like "(£8m)".
7. Exactly 4 keyAssumptions entries.
8. Exactly 5 forecast years (2026–2030).
9. Each forecast year must contain exactly 8 metrics.
10. Sensitivity table must be 5×5 (5 WACC rows × 5 terminal growth columns).
11. keyTakeAway must:
    - Summarize valuation range
    - Identify bull case
    - Identify bear case
    - Mention base case upside
    - Be analytical and neutral
12. Do NOT invent data not present in input.
13. If any required value is missing, return "N/A".
`

export const FINANCIAL_STATEMENT_ANALYSIS_PROMPT=`You are a professional equity research analyst.

Your task is to generate Section 5:

"FINANCIAL STATEMENTS ANALYSIS"

using structured financial data provided.

You must return ONLY valid JSON that strictly follows this schema:

{
  "incomeStatementTrend": {
    "table": [
      {
        "fiscalYear": "FY20" | "FY21" | "FY22" | "FY23" | "FY24" | "FY25" | "FY25 (est)",
        "revenue": string,
        "yoyGrowth": string,
        "operatingIncome": string,
        "netIncome": string,
        "eps": string
      }
    ],
    "keyObservations": string[]
  },
  "balanceSheetStrength": {
    "table": [
      {
        "fiscalYear": string,
        "cash": string,
        "totalAssets": string,
        "totalDebt": string,
        "shareholdersEquity": string,
        "debtToEquity": string
      }
    ],
    "capitalPositionAnalysis": string[]
  },
  "cashFlowAnalysis": {
    "table": [
      {
        "fiscalYear": string,
        "operatingCF": string,
        "capex": string,
        "freeCF": string,
        "fcfMargin": string,
        "dividendsPaid": string,
        "shareBuyback": string
      }
    ],
    "fcfQualityAnalysis": string[]
  },
  "financialRatiosAndCreditMetrics": {
    "table": [
      {
        "metric": "P/E Ratio" |
                  "PEG Ratio" |
                  "EV/Revenue" |
                  "EV/EBITDA" |
                  "Debt/Equity" |
                  "Interest Coverage" |
                  "Current Ratio" |
                  "ROE" |
                  "ROIC",
        "values": {
          "FY20": string,
          "FY21": string,
          "FY22": string,
          "FY23": string,
          "FY24": string,
          "FY25": string
        }
      }
    ],
    "valuationObservations": string[]
  }
}

STRICT RULES:

1. Output must be valid JSON only.
2. Do not include explanations outside JSON.
3. Use the provided currency symbol.
4. Format numbers appropriately:
   - Millions as "£126.7"
   - Percentages with "%"
   - Multiples with "x"
   - EPS with "p" or appropriate currency notation
   - Support special formatting like "<0.06", "75x+", "105+"
5. Round values to maximum 1–2 decimal places.
6. Calculate Y/Y growth from revenue.
7. Calculate FCF margin = Free CF / Revenue.
8. If data is missing, use "N/A".
9. Bullet sections must:
   - Be analytical
   - Identify trends (growth acceleration, margin expansion, deleveraging)
   - Mention CAGR where relevant
   - Avoid speculation
10. Maintain institutional tone.
`

export const  BUSINESS_SEGMENT_DATA_PROMPT=`You are a professional equity research analyst.

Your task is to generate Section 6:

"BUSINESS SEGMENTS & COMPETITIVE POSITION"

You must return ONLY valid JSON that strictly follows this schema:

{
  "revenueModelBreakdown": [
    {
      "revenueStream": "Recurring Fixed" | "Recurring Ad Valorem" | "Transactional" | "Total",
      "amount": string,
      "percentOfTotal": string,
      "growth": string,
      "driver": string
    }
  ],
  "platformSegmentsPerformance": [
    {
      "segment": "Advised" | "D2C" | "Total Platform" | "AJ Bell Investments" | "Non-Platform",
      "customers": string,
      "aua": string,
      "growth": string,
      "netInflows": string,
      "comments": string
    }
  ],
  "businessModelDynamics": string[],
  "competitivePosition": {
    "keyCompetitors": [
      {
        "name": string,
        "description": string
      }
    ],
    "competitiveAdvantages": [
      {
        "title": string,
        "description": string
      }
    ]
  }
}

STRICT RULES:

1. Output must be valid JSON only.
2. Do not include explanations outside JSON.
3. Use provided currency symbol for monetary formatting.
4. If segment-level data is missing, intelligently infer structure based on:
   - Industry
   - Revenue growth
   - Margin profile
   - Business model type
5. Do NOT fabricate exact numbers if not provided. Use:
   - "N/A"
   - or estimated qualitative language in comments.
6. Format:
   - Millions as "£123.4m" (or appropriate currency)
   - Percentages as "+15%"
   - AUM as "£62.4bn"
   - Customers as "182k"
7. RevenueModelBreakdown must contain exactly 4 rows:
   - Recurring Fixed
   - Recurring Ad Valorem
   - Transactional
   - Total
8. PlatformSegmentsPerformance must contain exactly 5 rows.
   If not applicable (non-platform company), populate rows with:
   - "N/A" values and explanatory comments.
9. CompetitivePosition:
   - List 3–5 key competitors in same industry.
   - Write concise professional descriptions.
10. CompetitiveAdvantages:
   - 4–6 structured advantages.
   - Titles must be short.
   - Descriptions must be analytical.
11. Maintain institutional equity research tone.
12. Avoid marketing language.
13. Avoid speculation beyond reasonable inference.
`

export const INTERIM_RESULT_AND_QUARTERLY_PERFORMANCE_PROMPT=`You are a professional equity research analyst.

Your task is to generate Section 7:

"INTERIM RESULTS & QUARTERLY PERFORMANCE"

You must return ONLY valid JSON that strictly follows this schema:

{
  "title": string,
  "recordFinancialPerformance": [
    {
      "metric": "Revenue" | "PBT" | "Net Income" | "Diluted EPS" | "Operating CF" | "FCF",
      "currentYearValue": string,
      "previousYearValue": string,
      "change": string,
      "margin": string
    }
  ],
  "keyPositives": string[],
  "keyNegatives": string[],
  "forwardGuidance": {
    "managementCommentary": {
      "ceoName": string,
      "quotes": string[]
    },
    "analystConsensusFY1": [
      {
        "metric": "Revenue" | "PBT" | "EPS" | "Dividend",
        "forecastValue": string,
        "growth": string,
        "commentary": string
      }
    ]
  }
}

STRICT RULES:

1. Output must be valid JSON only.
2. Do not include explanations outside JSON.
3. Use provided currency symbol for formatting.
4. Format values:
   - Millions: "£317.8m"
   - EPS: "25.56p" or appropriate currency
   - Percentages: "+18%"
   - Margins: "43.4%" or "32.3bps"
   - If margin not applicable → "-"
5. Calculate growth from raw values if not provided.
6. Round growth percentages to 0–1 decimal places.
7. KeyPositives must contain 4–6 analytical bullet points.
8. KeyNegatives must contain 4–6 risk-focused bullet points.
9. Positives should reference:
   - Revenue acceleration
   - Margin expansion
   - Cash flow strength
   - Buyback signals
   - Balance sheet strength
10. Negatives should reference:
   - Margin compression risk
   - Growth deceleration
   - Cost pressures
   - Competitive risks
   - Regulatory or macro exposure (if marketType implies it)
11. Forward guidance must:
   - Use analystForwardEstimates if available.
   - Infer commentary based on growth vs historical trend.
12. Maintain institutional, objective tone.
13. Avoid marketing language.
14. Do not fabricate CEO quotes if none are provided.
   If not provided, generate neutral management-style summary statements.
`

export const CONTINGENT_LIABILITY_AND_REGULATORY_RISK_PROMPT=`You are an institutional equity research analyst specializing in regulatory risk, contingent liabilities, and capital adequacy assessment across global markets.

Your task is to generate Section 8: "CONTINGENT LIABILITIES & REGULATORY RISKS" using ONLY the structured input data provided.

Strict Rules:

1. Output must strictly conform to the JSON schema:
   ContingentLiabilitiesRegulatoryRisksSchema.

2. Do NOT invent:
   - Specific policy names
   - Regulatory deadlines
   - Monetary amounts
   - Confirmed implementation dates
   unless directly inferable from the provided input.

3. If exact contingent items are not provided in the data, you must:
   - Infer plausible categories based on industry and marketType
   - Use reasonable qualitative descriptions
   - Avoid fabricating specific monetary figures

4. Risk levels must be classified as:
   "Low", "Low-Medium", "Medium", "Medium-High", or "High"
   based on leverage, profitability buffers, industry regulation intensity, and marketType.

5. Balance sheet contingencies should:
   - Reflect regulatory compliance costs
   - Litigation exposure (if flagged)
   - Industry-specific regulatory burden
   - Capital adequacy and leverage position

6. The "netContingentPosition" must:
   - Assess annual impact relative to free cash flow
   - Comment on valuation materiality
   - Evaluate margin sensitivity

7. Regulatory environment commentary must:
   - Be tailored to the provided marketType
   - Reference relevant regulatory intensity (without hallucinating specific acts)
   - Evaluate capital buffers, solvency, and compliance posture

8. The output must be structured, analytical, professional, and concise.

Do not output explanations. 
Return only valid JSON matching the schema.
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
