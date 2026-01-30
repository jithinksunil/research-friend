import 'server-only'
import { z } from "zod";
export const OverviewSchema = z.object({
    company_overview: z.object({
      business_description: z.string().nullable(),
      headquarters: z.string().nullable(),
      founded_year: z.number().nullable(),
      employees: z.number().nullable(),
      business_model: z.string().nullable(),
    }),
    stock_metrics: z.object({
      current_share_price: z.string().nullable(),
      currency: z.string().nullable(),
      market_cap: z.string().nullable(),
      "52_week_range": z.string().nullable(),
      average_daily_volume: z.string().nullable(),
      shares_outstanding: z.string().nullable(),
      free_float_percent: z.string().nullable(),
    }),
  });

  export const ShareholderSchema = z.object({
    shareholder_structure: z.object({
      institutional_ownership_percent: z.string().nullable(),
      retail_ownership_percent: z.string().nullable(),
      management_ownership_percent: z.string().nullable(),
      major_shareholders: z.array(
        z.object({
          name: z.string(),
          ownership_percent: z.string(),
        })
      ),
    }),
    insider_activity: z.object({
      recent_buys: z.array(z.string()),
      recent_sales: z.array(z.string()),
      notable_observations: z.string().nullable(),
    }),
  });

  export const AnalystConsensusSchema = z.object({
    analyst_consensus: z.object({
      total_analysts: z.number().nullable(),
      ratings_breakdown: z.object({
        buy: z.number().nullable(),
        hold: z.number().nullable(),
        sell: z.number().nullable(),
      }),
      consensus_rating: z.string().nullable(),
      average_price_target: z.string().nullable(),
      median_price_target: z.string().nullable(),
      bull_case_target: z.string().nullable(),
      bear_case_target: z.string().nullable(),
    }),
  });


  export const FinancialsSchema = z.object({
    financials: z.object({
      income_statement: z.array(
        z.object({
          fiscal_year: z.string(),
          revenue: z.string(),
          operating_income: z.string().nullable(),
          net_income: z.string().nullable(),
          eps: z.string().nullable(),
        })
      ),
      balance_sheet: z.array(
        z.object({
          fiscal_year: z.string(),
          cash: z.string().nullable(),
          total_assets: z.string().nullable(),
          total_debt: z.string().nullable(),
          shareholders_equity: z.string().nullable(),
        })
      ),
      cash_flow: z.array(
        z.object({
          fiscal_year: z.string(),
          operating_cash_flow: z.string().nullable(),
          capex: z.string().nullable(),
          free_cash_flow: z.string().nullable(),
        })
      ),
    }),
  });

  export const RatiosSchema = z.object({
    financial_ratios: z.object({
      pe_ratio: z.string().nullable(),
      forward_pe: z.string().nullable(),
      peg_ratio: z.string().nullable(),
      ev_to_ebitda: z.string().nullable(),
      debt_to_equity: z.string().nullable(),
      interest_coverage: z.string().nullable(),
      roe: z.string().nullable(),
      roic: z.string().nullable(),
    }),
    credit_metrics: z.object({
      net_debt_to_ebitda: z.string().nullable(),
      implied_credit_rating: z.string().nullable(),
    }),
  });


  export const SegmentsSchema = z.object({
    business_segments: z.object({
      revenue_breakdown: z.array(
        z.object({
          segment: z.string(),
          revenue: z.string(),
          percent_of_total: z.string(),
          growth_rate: z.string().nullable(),
        })
      ),
      key_growth_drivers: z.array(z.string()),
    }),
  });

  export const CompetitionSchema = z.object({
    competitive_landscape: z.object({
      market_size: z.string().nullable(),
      market_share_estimate: z.string().nullable(),
      key_competitors: z.array(
        z.object({
          name: z.string(),
          competitive_position: z.string(),
        })
      ),
      competitive_advantages: z.array(z.string()),
      competitive_risks: z.array(z.string()),
    }),
  });
  

  export const GuidanceSchema = z.object({
    recent_results_and_guidance: z.object({
      latest_period: z.string().nullable(),
      revenue_growth: z.string().nullable(),
      profit_growth: z.string().nullable(),
      management_guidance: z.string().nullable(),
      key_positives: z.array(z.string()),
      key_negatives: z.array(z.string()),
    }),
  });

  export const RegulatorySchema = z.object({
    regulatory_and_legal_risks: z.array(
      z.object({
        risk: z.string(),
        estimated_impact: z.string().nullable(),
        time_horizon: z.string().nullable(),
      })
    ),
  });

  export const NewsSchema = z.object({
    recent_news: z.array(
      z.object({
        date: z.string(),
        event: z.string(),
        impact_assessment: z.string().nullable(),
      })
    ),
  });


  export const ProjectionsSchema = z.object({
    forward_projections: z.object({
      assumptions: z.object({
        revenue_growth: z.string(),
        margin_trend: z.string(),
        capex_intensity: z.string(),
        tax_rate: z.string(),
      }),
      projected_financials: z.array(
        z.object({
          fiscal_year: z.string(),
          revenue: z.string(),
          net_income: z.string(),
          eps: z.string(),
        })
      ),
    }),
  });

  export const ValuationSchema = z.object({
    valuation: z.object({
      dcf: z.object({
        wacc: z.string(),
        terminal_growth_rate: z.string(),
        fair_value_per_share: z.string(),
        current_price: z.string(),
        implied_upside_percent: z.string(),
      }),
      sensitivity_analysis: z.record(z.string(), z.any()),
    }),
  });

  export const ScenariosSchema = z.object({
    scenarios: z.object({
      bull_case: z.object({
        assumptions: z.string(),
        price_target: z.string(),
      }),
      base_case: z.object({
        assumptions: z.string(),
        price_target: z.string(),
      }),
      bear_case: z.object({
        assumptions: z.string(),
        price_target: z.string(),
      }),
    }),
  });

  export const CatalystsSchema = z.object({
    catalysts: z.object({
      upside: z.array(z.string()),
      downside: z.array(z.string()),
    }),
  });

  export const ESGSchema = z.object({
    esg_and_governance: z.object({
      esg_strengths: z.array(z.string()),
      esg_risks: z.array(z.string()),
      governance_notes: z.string().nullable(),
    }),
  });