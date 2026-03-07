---
name: financial-report-dashboard
description: Builds financial research dashboards by fetching data section-by-section from yahoo-finance2, processing with OpenAI for structured output, and storing in PostgreSQL via Prisma. Use when implementing report sections, adding new dashboard sections, integrating yahoo-finance2 endpoints, or structuring OpenAI prompts for financial data.
---

# Financial Report Dashboard Pipeline

## Overview

The dashboard displays company research reports built via a **section-by-section pipeline**:

1. **Fetch** — Call yahoo-finance2 endpoints for the section
2. **Calculate** — Derive metrics (YoY growth, margins, ratios) from raw data
3. **Organize** — Send to OpenAI with a Zod schema to produce structured output
4. **Store** — Save structured data to PostgreSQL via Prisma
5. **Display** — Query and render on the dashboard

## Pipeline Pattern (Per Section)

```ts
// 1. Fetch raw data from yahoo-finance2
const rawData = await getTrimmed[Section]Data(symbol);

// 2. (Optional) Calculations done in getTrimmed* or before OpenAI
// e.g. revenueYoYGrowth = ((latest - previous) / previous) * 100

// 3. OpenAI structures the data
const structured = await fetchSection<z.infer<typeof SectionSchema>>({
  userPrompt: `Input: ${JSON.stringify(rawData)}`,
  systemPrompt: SECTION_PROMPT,
  schema: SectionSchema,
  schemaName: 'SectionSchema',
});

// 4. Save to Prisma (in report.actions.ts or similar)
await prisma.report.update({ ... });
```

## Complete Report Section Order (from sample report)

All sections in display order — implement in this sequence:

| # | Section | Sub-sections / Content |
|---|---------|------------------------|
| 1 | Executive Summary | Summary, Investment Thesis (Positives, Risks, Price/DCF/Consensus/Upside) |
| 2 | Company Overview & Stock Metrics | Key Statistics table, 52-Week Performance |
| 3 | Shareholder Structure & Insider Activity | Major Shareholders table, Share Capital, Key Insider Observations |
| 4 | Analyst Recommendations & Price Targets | Current Consensus table, Consensus Details, Recent Analyst Views |
| 5 | Equity Valuation & DCF Analysis | Key Assumptions, Projected Financials (FY26–FY30), DCF Build-up, Valuation Sensitivity, Key Takeaway |
| 6 | Financial Statements Analysis | Income Statement Trend, Key Observations, Balance Sheet Strength, Capital Position Analysis, Cash Flow Analysis, FCF Quality Analysis, Financial Ratios & Credit Metrics, Valuation Observations |
| 7 | Business Segments & Competitive Position | Revenue Model Breakdown (FY25), Platform Segments Performance table, Business Model Dynamics, Key Competitors & Market Share |
| 8 | Competitive Advantages | Brand, Dual-Channel, Technology, Cost Model, Regulatory Advantage (bullet list) |
| 9 | Interim Results & Quarterly Performance | FY25 Full-Year Results table, Key Positives, Key Negatives |
| 10 | Pressures and Outflows | Numbered list (Revenue margin, Cost base, Policy headwinds, Competitive pressure, Pension outflows) |
| 11 | Forward Guidance & Assumptions | Management Commentary (CEO), Analyst Consensus FY26E (Revenue, PBT, EPS, Dividend) |
| 12 | Contingent Liabilities & Regulatory Risks | Balance Sheet Contingencies table, Regulatory Environment (FCA, GDPR, Consumer Duty), Net Contingent Position |
| 13 | Recent News & Catalyst Analysis | Company news, FY results, market reaction |
| 14 | Industry News & Catalysts | UK ISA Reforms, Pension Tax, Platform Market Growth, Competitive Dynamics |
| 15 | Macro/Market Sentiment | 2026 Outlook (BoE rates, volatility, tailwinds) |
| 16 | Chairman's Statement & Shareholder Communications | Positive Themes, Cautionary Themes |
| 17 | Positives from FY25–26 Communications | Bullet list |
| 18 | Negatives from Communications & Market Realities | Bullet list |
| 19 | Forward Projections & Assumptions (Base Case) | Margin assumptions, Gross profit, OpEx, PBT margin, Tax, EPS, Share count |
| 20 | Forward Projections: P&L, Balance Sheet & Valuation | Projected Income Statement (FY26–FY30), Key Projection Drivers, Projected Balance Sheet |
| 21 | Projected Cash Flow & FCF | Operating CF, CapEx, Free CF, FCF Margin, Dividends, Buybacks, Key Observations |
| 22 | Credit Metrics Projection | Net Debt/EBITDA, Interest Coverage, Debt/Capitalization, Implied Credit Rating, Credit Outlook |
| 23 | DCF Valuation Recap & Price Target | Valuation Summary, Sensitivity Analysis, 12-Month Price Target, Rationale |
| 24 | Annual General Meeting & Shareholder Matters | Next AGM Details, Expected Voting Agenda, Special Resolutions, Key Governance Notes |
| 25 | Conclusion | Investment case summary, valuation, consensus |
| 26 | Investment Recommendation | Recommendation, Price Target, Expected Return, Time Horizon, Risk Profile, Catalysts (Upside/Downside), Disclaimer |

## Yahoo Finance 2 → Section Mapping

| Section | quoteSummary modules | Other endpoints | Key calculations |
|---------|----------------------|-----------------|------------------|
| Executive Summary | assetProfile, price, summaryDetail, financialData, defaultKeyStatistics, incomeStatementHistory, earningsTrend | chart (dividends, 1Y) | revenueYoY, netMargin, upside% |
| Company Overview | price, summaryDetail, defaultKeyStatistics, financialData | — | 52w range %, recovery from low |
| Shareholder Structure | defaultKeyStatistics, majorHoldersBreakdown, institutionOwnership, insiderTransactions | — | freeFloat = 100 - inst - insider |
| Analyst Recommendations | price, financialData, recommendationTrend | — | — |
| Financial Statements (6) | incomeStatementHistory, balanceSheetHistory, cashflowStatementHistory | — | YoY growth, margins, ratios |
| Equity Valuation / DCF | price, financialData, defaultKeyStatistics, incomeStatementHistory | — | PV of FCF, terminal value |
| Business Segments (7) | — | — | OpenAI + segment data if available |
| Competitive Advantages (8) | assetProfile, financialData | — | — |
| Interim Results (9) | incomeStatementHistoryQuarterly, earningsHistory | — | QoQ, YoY |
| Forward Guidance (11) | earningsTrend, financialData | — | — |
| Contingent Liabilities (12) | — | — | OpenAI synthesizes from context |
| Recent News (13) | — | — | OpenAI / news APIs |
| Industry News (14) | — | — | OpenAI synthesizes |
| Macro Sentiment (15) | — | — | OpenAI synthesizes |
| Chairman's Statement (16) | — | — | OpenAI synthesizes |
| Forward Projections (19–21) | incomeStatementHistory, cashflowStatementHistory | — | CAGR, margin evolution |
| Credit Metrics (22) | balanceSheetHistory, cashflowStatementHistory | — | Net Debt/EBITDA, coverage |
| AGM (24) | — | — | OpenAI / filings |
| Conclusion (25) | — | — | OpenAI synthesizes from full report |
| Investment Recommendation (26) | price, financialData | — | — |

**quoteSummary modules**: `assetProfile`, `price`, `summaryDetail`, `financialData`, `defaultKeyStatistics`, `incomeStatementHistory`, `incomeStatementHistoryQuarterly`, `balanceSheetHistory`, `cashflowStatementHistory`, `earningsTrend`, `earningsHistory`, `recommendationTrend`, `majorHoldersBreakdown`, `institutionOwnership`, `insiderTransactions`.

## OpenAI Integration

Use `fetchSection` from `@/server/common`:

```ts
import { fetchSection } from '@/server/common';
import { z } from 'zod';

const SectionSchema = z.object({
  summary: z.string().nullable(),
  table: z.array(z.object({ metric: z.string(), value: z.string() })),
});

const result = await fetchSection<z.infer<typeof SectionSchema>>({
  userPrompt: `Generate section from: ${JSON.stringify(rawData)}`,
  systemPrompt: `You are an equity research analyst. Output JSON matching the schema. Use ONLY the provided data.`,
  schema: SectionSchema,
  schemaName: 'SectionSchema',
});
```

**Guidelines**:
- System prompt: instruct analyst role, output format, and "use only provided data"
- User prompt: pass `JSON.stringify(rawData)` so model has full context
- Zod schema: define exact output shape; `fetchSection` uses `zodTextFormat` for structured generation

## Prisma Storage

- **Report** is the root; sections are relations (e.g. `executiveSummary`, `overviewAndStockMetrics`, `financialStatementAnalyasis`)
- Use `report.update` with nested `create`/`createMany` for new sections
- Store numeric-like values as `String` when formatting matters (e.g. "17.3x", "£317.8m", "43.4%")
- Formatting is market-dependent (e.g. £ for UK, ₹ for India, $ for US); include in system prompts
- Use enums for fixed sets (e.g. `FinancialStatementYear`, `RatingType`)

```prisma
model Report {
  companyId String @unique
  executiveSummary ExecutiveSummary?
  overviewAndStockMetrics OverviewAndStockMetrics?
  financialStatementAnalyasis FinancialStatementAnalyasis?
  // ...
}
```

## Dashboard Display

- **Route**: `app/(routes)/user/dashboard/[symbol]/report/page.tsx`
- **Data**: `getReport(symbol)` server action fetches full report with nested selects
- **Components**: Colocate in report folder; move to `components/` when reused
- **Tables**: Use `TableWithoutPagination` for metric tables; `List` for bullet lists
- **Sections**: Render in report order 1–26 (see Complete Report Section Order table above)

## Section Checklist (New Section)

When adding a new report section:

1. [ ] Identify yahoo-finance2 modules/endpoints
2. [ ] Create `getTrimmed[Section]Data(symbol)` with fetch + calculations
3. [ ] Define Zod schema for OpenAI output
4. [ ] Add system prompt in `lib/constant.ts`
5. [ ] Create `get[Section]AboutCompany(symbol)` that calls fetchSection
6. [ ] Add Prisma model(s) if needed; extend Report relations
7. [ ] Wire into report.actions.ts (fetch on demand, upsert to DB)
8. [ ] Add UI in report page with appropriate components

## Reference: Section Implementation Status

| # | Section | Server fn | Prisma model | Status |
|---|---------|-----------|--------------|--------|
| 1 | Executive Summary | getExecutiveInformationAboutCompany | ExecutiveSummary | ✅ |
| 2 | Company Overview | getOverviewMetricsAboutCompany | OverviewAndStockMetrics, StockMetric | ✅ |
| 3 | Shareholder Structure | getShareholderStructureAboutCompany | ShareHolderStructure, MajorShareholder | ✅ |
| 4 | Analyst Recommendations | getAnalystRecommendationsAboutCompany | AnalystRecommendation, CurrentConsensus, ConsensusDetail | ✅ |
| 5 | Equity Valuation / DCF | getEquityValuationAboutCompany | EquityValuationAndDcfAnalysis + nested | ✅ |
| 6 | Financial Statements Analysis | getFinancialStatementsAnalysisAboutCompany | FinancialStatementAnalyasis (Income Statement, Balance Sheet, Cash Flow, Capital Position, FCF Quality, Ratios, Valuation Obs) | ✅ |
| 7 | Business Segments & Competitive Position | getBusinessSegmentDataAboutCompany | (extend schema) | ⏳ |
| 8 | Competitive Advantages | — | (extend schema) | ❌ |
| 9 | Interim Results & Quarterly Performance | getInterimResultsAndQuarterlyPerformanceAboutCompany | (extend schema) | ⏳ |
| 10 | Pressures and Outflows | — | (extend schema) | ❌ |
| 11 | Forward Guidance & Assumptions | — | (extend schema) | ❌ |
| 12 | Contingent Liabilities & Regulatory Risks | getContingentLiabilitiesAndRegulatoryRiskAboutCompany | (extend schema) | ⏳ |
| 13 | Recent News & Catalyst Analysis | — | (extend schema) | ❌ |
| 14 | Industry News & Catalysts | — | (extend schema) | ❌ |
| 15 | Macro/Market Sentiment | — | (extend schema) | ❌ |
| 16 | Chairman's Statement & Shareholder Communications | — | (extend schema) | ❌ |
| 17 | Positives from FY25–26 Communications | — | (extend schema) | ❌ |
| 18 | Negatives from Communications & Market Realities | — | (extend schema) | ❌ |
| 19 | Forward Projections & Assumptions (Base Case) | — | (extend schema) | ❌ |
| 20 | Forward Projections: P&L, Balance Sheet & Valuation | — | (extend schema) | ❌ |
| 21 | Projected Cash Flow & FCF | — | (extend schema) | ❌ |
| 22 | Credit Metrics Projection | — | (extend schema) | ❌ |
| 23 | DCF Valuation Recap & Price Target | (part of Equity Valuation) | DcfValuationBuildup, ValuationSensitivity | ✅ |
| 24 | Annual General Meeting & Shareholder Matters | — | (extend schema) | ❌ |
| 25 | Conclusion | — | (extend schema) | ❌ |
| 26 | Investment Recommendation | — | (extend schema) | ❌ |

**Legend**: ✅ Implemented | ⏳ Partial / server fn exists | ❌ Not yet implemented

## Report Fetch Flow

- **Company first**: `prisma.company.upsert({ where: { symbol }, create: { symbol }, update: {} })` ensures company exists.
- **No report**: When `!company.report`, fetch sections 1–6 in parallel, then `company.update` with `report: { create: { executiveSummary: { create: ... }, ... } }`. Also set `companyName` from executive info.
- **Missing section**: When report exists but a section is null (e.g. `!report.financialStatementAnalyasis`), fetch that section and `report: { update: { financialStatementAnalyasis: { create: ... } } }`.

## Error Handling

- Server actions return `{ okay: true, data }` or `{ okay: false, error: { message } }`; callers check `!report.okay` and handle.
- Use `convertToErrorInstance(unknownError)` from `@/lib` when catching unknown errors.
- Yahoo Finance / OpenAI failures should be caught and surfaced via the error response.

## Environment & Dependencies

- **OPENAI_API_KEY**: Required for `fetchSection` (OpenAI client).
- **DATABASE_URL**: Required for Prisma (PostgreSQL).
- **yahoo-finance2**: `new YahooFinance()`; `quoteSummary`, `chart`, `quote`, `historical`.

## Report UI Components (colocated)

- `Heading`, `SubHeading`, `TertiaryHeading` — section titles
- `Description` — paragraph text
- `List` — bullet lists (supports HTML in items via `dangerouslySetInnerHTML`-style)
- `SectionSeparator` — horizontal divider between sections
- `TableWithoutPagination` — from `@/components/common`

## Additional Resources

- Yahoo Finance 2: `yahooFinance.quoteSummary(symbol, { modules: [...] })`; `yahooFinance.chart(symbol, { period1, period2, interval, events: 'div' })` for dividends; `yahooFinance.quote(symbol)`; `yahooFinance.historical(symbol, opts)`
- Prompts: `lib/constant.ts` (EXECUTIVE_PROMPT, OVERVIEW_PROMPT, etc.)
- Report server logic: `server/report.ts` (exported from `@/server`)
- Report actions: `app/actions/user/report.actions.ts`
