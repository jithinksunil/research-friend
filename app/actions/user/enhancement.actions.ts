'use server';
import { ROLES, FinancialStatementYear } from '@/app/generated/prisma/enums';
import {
  EXECUTIVE_PROMPT,
  OVERVIEW_PROMPT,
  SHARE_HOLDER_STRUCTURE_PROMPT,
  ANALYST_RECOMMENDATION_PROMPT,
  EQUITY_VALUATION_PROMPT,
  FINANCIAL_STATEMENT_ANALYSIS_PROMPT,
  BUSINESS_SEGMENT_DATA_PROMPT,
} from '@/lib';
import prisma from '@/prisma';
import {
  CompanyOverviewSchema,
  ExecutiveSchema,
  ShareholderStructureSectionSchema,
  AnalystRecommendationsSchema,
  EquityValuationDcfSchema,
  FinancialStatementsAnalysisSchema,
  BusinessSegmentsCompetitivePositionSchema,
  improveSection,
  requireRBAC,
} from '@/server';

export const enhanceExecutiveSection = requireRBAC(ROLES.USER)(async (
  symbol: string,
  improvementNeeded,
) => {
  const executiveData = (await prisma.executiveSummary.findFirst({
    where: { report: { company: { symbol } } },
  }))!;
  const executiveInfo = await improveSection({
    sectionDetails: ` ${JSON.stringify(executiveData)}`,
    systemPrompt: EXECUTIVE_PROMPT,
    schema: ExecutiveSchema,
    schemaName: 'ExecutiveSchema',
    improvementNeeded,
  });

  const executiveSummary = await prisma.executiveSummary.update({
    where: { id: executiveData.id },
    data: {
      analystConsensus: executiveInfo.investmentThesis.analystConsensus,
      positive: executiveInfo.investmentThesis.positives,
      risk: executiveInfo.investmentThesis.risks,
      summary: executiveInfo.executiveSummary,
      upside: executiveInfo.investmentThesis.upside,
      dcfFairValue: executiveInfo.investmentThesis.dcfFairValue,
      currentPrice: executiveInfo.investmentThesis.currentPrice,
    },
  });
  return {
    okay: true,
    data: executiveSummary,
  };
});

export const enhanceCompanyOverviewAndStockMetricsSection = requireRBAC(
  ROLES.USER,
)(async (symbol: string, improvementNeeded) => {
  const overviewData = (await prisma.overviewAndStockMetrics.findFirst({
    where: { report: { company: { symbol } } },
    select: { fiftyTwoWeekPerformance: true, stockMetrics: true, id: true },
  }))!;
  const overviewInfo = await improveSection({
    sectionDetails: ` ${JSON.stringify(overviewData)}`,
    systemPrompt: OVERVIEW_PROMPT,
    schema: CompanyOverviewSchema,
    schemaName: 'CompanyOverviewSchema',
    improvementNeeded,
  });

  const overView = await prisma.overviewAndStockMetrics.update({
    where: { id: overviewData.id },
    data: {
      fiftyTwoWeekPerformance: overviewInfo.fiftyTwoWeekPerformance,
      stockMetrics: {
        deleteMany: {},
        createMany: {
          data: overviewInfo.metrics.map((metric) => ({
            name: metric.name,
            note: metric.note,
            value: metric.value,
          })),
        },
      },
    },
    select: {
      stockMetrics: true,
      fiftyTwoWeekPerformance: true,
    },
  });
  return {
    okay: true,
    data: overView,
  };
});

export const enhanceShareholderStructureSection = requireRBAC(
  ROLES.USER,
)(async (symbol: string, improvementNeeded) => {
  const shareHolderData = (await prisma.shareHolderStructure.findFirst({
    where: { report: { company: { symbol } } },
    include: { majorShareholders: true },
  }))!;

  const shareHolderInfo = await improveSection({
    sectionDetails: ` ${JSON.stringify(shareHolderData)}`,
    systemPrompt: SHARE_HOLDER_STRUCTURE_PROMPT,
    schema: ShareholderStructureSectionSchema,
    schemaName: 'ShareHolderStructure',
    improvementNeeded,
  });

  const updated = await prisma.shareHolderStructure.update({
    where: { id: shareHolderData.id },
    data: {
      totalShares: shareHolderInfo.shareCapitalStructure.totalShares,
      shareCapitalNotes: shareHolderInfo.shareCapitalStructure.notes,
      keyInsiderObservations: shareHolderInfo.keyInsiderObservations,
      majorShareholders: {
        deleteMany: {},
        createMany: {
          data: shareHolderInfo.majorShareholders.map((holder) => ({
            shareHolderType: holder.shareHolderType,
            ownership: holder.ownership,
            notes: holder.notes,
          })),
        },
      },
    },
    select: {
      totalShares: true,
      shareCapitalNotes: true,
      keyInsiderObservations: true,
      majorShareholders: true,
    },
  });

  return {
    okay: true,
    data: updated,
  };
});

export const enhanceAnalystRecommendationSection = requireRBAC(
  ROLES.USER,
)(async (symbol: string, improvementNeeded) => {
  const analystData = (await prisma.analystRecommendation.findFirst({
    where: { report: { company: { symbol } } },
    include: { currentConsensus: true, consensusDetails: true },
  }))!;

  const analystInfo = await improveSection({
    sectionDetails: ` ${JSON.stringify(analystData)}`,
    systemPrompt: ANALYST_RECOMMENDATION_PROMPT,
    schema: AnalystRecommendationsSchema,
    schemaName: 'AnalystRecommendations',
    improvementNeeded,
  });

  const updated = await prisma.analystRecommendation.update({
    where: { id: analystData.id },
    data: {
      recentAnalystViews: analystInfo.recentAnalystViews,
      currentConsensus: {
        deleteMany: {},
        createMany: {
          data: analystInfo.currentConsensus.map((row) => ({
            rating: row.rating,
            count: row.count,
            percentageOfTotal: row.percentageOfTotal,
            trend: row.trend,
          })),
        },
      },
      consensusDetails: {
        deleteMany: {},
        createMany: {
          data: analystInfo.consensusDetails.map((row) => ({
            name: row.name,
            value: row.value,
          })),
        },
      },
    },
    select: {
      recentAnalystViews: true,
      currentConsensus: true,
      consensusDetails: true,
    },
  });

  return {
    okay: true,
    data: updated,
  };
});

export const enhanceBusinessSegmentDataSection = requireRBAC(
  ROLES.USER,
)(async (symbol: string, improvementNeeded) => {
  const businessSegmentData = (await prisma.businessSegmentData.findFirst({
    where: { report: { company: { symbol } } },
    include: {
      revenueModelBreakdown: true,
      platformSegmentPerformance: true,
      competitivePosition: {
        include: { keyCompetitors: true, competitiveAdvantage: true },
      },
    },
  }))!;

  const businessSegmentInfo = await improveSection({
    sectionDetails: ` ${JSON.stringify(businessSegmentData)}`,
    systemPrompt: BUSINESS_SEGMENT_DATA_PROMPT,
    schema: BusinessSegmentsCompetitivePositionSchema,
    schemaName: 'BusinessSegmentsCompetitivePosition',
    improvementNeeded,
  });

  const updated = await prisma.businessSegmentData.update({
    where: { id: businessSegmentData.id },
    data: {
      businessModelDynamics: businessSegmentInfo.businessModelDynamics,
      revenueModelBreakdown: {
        deleteMany: {},
        createMany: {
          data: businessSegmentInfo.revenueModelBreakdown,
        },
      },
      platformSegmentPerformance: {
        deleteMany: {},
        createMany: {
          data: businessSegmentInfo.platformSegmentsPerformance,
        },
      },
      competitivePosition: {
        upsert: {
          create: {
            keyCompetitors: {
              createMany: {
                data: businessSegmentInfo.competitivePosition.keyCompetitors,
              },
            },
            competitiveAdvantage: {
              createMany: {
                data: businessSegmentInfo.competitivePosition.competitiveAdvantages,
              },
            },
          },
          update: {
            keyCompetitors: {
              deleteMany: {},
              createMany: {
                data: businessSegmentInfo.competitivePosition.keyCompetitors,
              },
            },
            competitiveAdvantage: {
              deleteMany: {},
              createMany: {
                data: businessSegmentInfo.competitivePosition.competitiveAdvantages,
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      businessModelDynamics: true,
      competitivePosition: {
        select: {
          id: true,
          keyCompetitors: true,
          competitiveAdvantage: true,
        },
      },
      platformSegmentPerformance: true,
      revenueModelBreakdown: true,
    },
  });

  return {
    okay: true,
    data: updated,
  };
});

export const enhanceEquityValuationAndDcfAnalysisSection = requireRBAC(
  ROLES.USER,
)(async (symbol: string, improvementNeeded) => {
  const equityValuationData = (await prisma.equityValuationAndDcfAnalysis.findFirst({
    where: { report: { company: { symbol } } },
    include: {
      keyAssumptions: true,
      projectedFinancialYears: { include: { projections: true } },
      dcfValuationBuildup: true,
      valuationSensitivities: { include: { values: true } },
    },
  }))!;

  const equityValuationInfo = await improveSection({
    sectionDetails: ` ${JSON.stringify(equityValuationData)}`,
    systemPrompt: EQUITY_VALUATION_PROMPT,
    schema: EquityValuationDcfSchema,
    schemaName: 'EquityValuationDcf',
    improvementNeeded,
  });

  const updated = await prisma.equityValuationAndDcfAnalysis.update({
    where: { id: equityValuationData.id },
    data: {
      keyTakeAway: equityValuationInfo.keyTakeAway,
      keyAssumptions: {
        deleteMany: {},
        createMany: {
          data: equityValuationInfo.keyAssumptions.map((a) => ({
            modelName: a.modelName,
            assumption: a.assumption,
          })),
        },
      },
      projectedFinancialYears: {
        deleteMany: {},
        create: equityValuationInfo.projectedFinanacialNext5Years.map((y) => ({
          financialYear: y.financialYear,
          projections: {
            createMany: {
              data: y.projections.map((p) => ({
                metric: p.metric,
                value: p.value,
              })),
            },
          },
        })),
      },
      dcfValuationBuildup: {
        upsert: {
          create: {
            pvOfFCF: equityValuationInfo.dcfValuationBuildups.pvOfFCF,
            pvOfTerminalValue:
              equityValuationInfo.dcfValuationBuildups.pvOfTerminalValue,
            enterpriseValue: equityValuationInfo.dcfValuationBuildups.enterpriseValue,
            netDebt: equityValuationInfo.dcfValuationBuildups.netDebt,
            equityValue: equityValuationInfo.dcfValuationBuildups.equityValue,
            fairValuePerShare:
              equityValuationInfo.dcfValuationBuildups.fairValuePerShare,
            currentPrice: equityValuationInfo.dcfValuationBuildups.currentPrice,
            impliedUpside: equityValuationInfo.dcfValuationBuildups.impliedUpside,
            note: equityValuationInfo.dcfValuationBuildups.note,
          },
          update: {
            pvOfFCF: equityValuationInfo.dcfValuationBuildups.pvOfFCF,
            pvOfTerminalValue:
              equityValuationInfo.dcfValuationBuildups.pvOfTerminalValue,
            enterpriseValue: equityValuationInfo.dcfValuationBuildups.enterpriseValue,
            netDebt: equityValuationInfo.dcfValuationBuildups.netDebt,
            equityValue: equityValuationInfo.dcfValuationBuildups.equityValue,
            fairValuePerShare:
              equityValuationInfo.dcfValuationBuildups.fairValuePerShare,
            currentPrice: equityValuationInfo.dcfValuationBuildups.currentPrice,
            impliedUpside: equityValuationInfo.dcfValuationBuildups.impliedUpside,
            note: equityValuationInfo.dcfValuationBuildups.note,
          },
        },
      },
      valuationSensitivities: {
        deleteMany: {},
        create: equityValuationInfo.valuationSensitivityAnalysis.map((row) => ({
          wacc: row.wacc,
          values: {
            createMany: {
              data: row.value.map((v) => ({
                terminalGrowth: v.terminalGrowth,
                value: v.value,
              })),
            },
          },
        })),
      },
    },
    select: {
      keyTakeAway: true,
      keyAssumptions: true,
      dcfValuationBuildup: true,
      projectedFinancialYears: {
        include: { projections: true },
      },
      valuationSensitivities: {
        include: { values: true },
      },
    },
  });

  return {
    okay: true,
    data: updated,
  };
});

export const enhanceFinancialStatementAnalysisSection = requireRBAC(
  ROLES.USER,
)(async (symbol: string, improvementNeeded) => {
  const financialData = (await prisma.financialStatementAnalyasis.findFirst({
    where: { report: { company: { symbol } } },
    include: {
      incomeStatementTrendRows: true,
      balanceSheetStrengthRows: true,
      cashFlowAnalysisRows: true,
      financialRatioMetrics: { include: { values: true } },
    },
  }))!;

  const financialInfo = await improveSection({
    sectionDetails: ` ${JSON.stringify(financialData)}`,
    systemPrompt: FINANCIAL_STATEMENT_ANALYSIS_PROMPT,
    schema: FinancialStatementsAnalysisSchema,
    schemaName: 'FinancialStatementAnalysis',
    improvementNeeded,
  });

  const updated = await prisma.financialStatementAnalyasis.update({
    where: { id: financialData.id },
    data: {
      keyObservations: financialInfo.incomeStatementTrend.keyObservations,
      capitalPositionAnalysis:
        financialInfo.balanceSheetStrength.capitalPositionAnalysis,
      fcfQualityAnalysis: financialInfo.cashFlowAnalysis.fcfQualityAnalysis,
      valuationObservations:
        financialInfo.financialRatiosAndCreditMetrics.valuationObservations,
      incomeStatementTrendRows: {
        deleteMany: {},
        createMany: {
          data: financialInfo.incomeStatementTrend.table.map((row) => ({
            fiscalYear: row.fiscalYear,
            revenue: row.revenue,
            yoyGrowth: row.yoyGrowth,
            operatingIncome: row.operatingIncome,
            netIncome: row.netIncome,
            eps: row.eps,
          })),
        },
      },
      balanceSheetStrengthRows: {
        deleteMany: {},
        createMany: {
          data: financialInfo.balanceSheetStrength.table.map((row) => ({
            fiscalYear: row.fiscalYear,
            cash: row.cash,
            totalAssets: row.totalAssets,
            totalDebt: row.totalDebt,
            shareholdersEquity: row.shareholdersEquity,
            debtToEquity: row.debtToEquity,
          })),
        },
      },
      cashFlowAnalysisRows: {
        deleteMany: {},
        createMany: {
          data: financialInfo.cashFlowAnalysis.table.map((row) => ({
            fiscalYear: row.fiscalYear,
            operatingCF: row.operatingCF,
            capex: row.capex,
            freeCF: row.freeCF,
            fcfMargin: row.fcfMargin,
            dividendsPaid: row.dividendsPaid,
            shareBuyback: row.shareBuyback,
          })),
        },
      },
      financialRatioMetrics: {
        deleteMany: {},
        create: financialInfo.financialRatiosAndCreditMetrics.table.map(
          (row) => ({
            metric: row.metric,
            values: {
              createMany: {
                data: Object.entries(row.values).map(([year, value]) => ({
                  year: year as FinancialStatementYear,
                  value,
                })),
              },
            },
          }),
        ),
      },
    },
    select: {
      keyObservations: true,
      capitalPositionAnalysis: true,
      fcfQualityAnalysis: true,
      valuationObservations: true,
      incomeStatementTrendRows: true,
      balanceSheetStrengthRows: true,
      cashFlowAnalysisRows: true,
      financialRatioMetrics: {
        include: { values: true },
      },
    },
  });

  return {
    okay: true,
    data: updated,
  };
});
