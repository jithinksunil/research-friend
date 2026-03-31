import 'server-only';

import { z } from 'zod';
import { ReportSectionKey } from '@/types';
import { ProjectionMetricType } from '@/app/generated/prisma/enums';
import prisma from '@/prisma';
import {
  getAnalystRecommendationsAboutCompany,
  getBusinessSegmentDataAboutCompany,
  getContingentLiabilitiesAndRegulatoryRiskAboutCompany,
  getDcfValuationRecapAndPriceTargetAboutCompany,
  getAgmAndShareholderMattersAboutCompany,
  getConclusionAndRecommendationAboutCompany,
  getEquityValuationAboutCompany,
  getExecutiveInformationAboutCompany,
  getFinancialStatementsAnalysisAboutCompany,
  getForwardProjectionsAndValuationAboutCompany,
  getInterimResultsAndQuarterlyPerformanceAboutCompany,
  getShareholderStructureAboutCompany,
  getReportSourceBundle,
  getOverviewMetricsAboutCompany,
  AgmAndShareholderMattersSchema,
  AnalystRecommendationsSchema,
  BusinessSegmentsCompetitivePositionSchema,
  CompanyOverviewSchema,
  ConclusionAndRecommendationSchema,
  ContingentLiabilitiesRegulatoryRisksSchema,
  DcfValuationRecapAndPriceTargetSchema,
  EquityValuationDcfSchema,
  ExecutiveSchema,
  FinancialStatementsAnalysisSchema,
  ForwardProjectionsAndValuationSchema,
  InterimResultsQuarterlyPerformanceSchema,
  ShareholderStructureSectionSchema,
} from '@/server';

export const REPORT_SECTION_KEYS = [
  'executiveSummary',
  'overviewAndStockMetrics',
  'shareHolderStructure',
  'analystRecommendation',
  'equityValuationAndDcfAnalysis',
  'financialStatementAnalyasis',
  'businessSegmentData',
  'interimResultsAndQuarterlyPerformance',
  'contingentLiabilitiesAndRegulatoryRisk',
  'dcfValuationRecapAndPriceTarget',
  'forwardProjectionsAndValuation',
  'agmAndShareholderMatters',
  'conclusionAndRecommendation',
] as const;

const REPORT_SECTION_SELECT = {
  executiveSummary: true,
  overviewAndStockMetrics: {
    select: { stockMetrics: true, fiftyTwoWeekPerformance: true },
  },
  shareHolderStructure: {
    select: {
      majorShareholders: true,
      keyInsiderObservations: true,
      shareCapitalNotes: true,
      totalShares: true,
    },
  },
  analystRecommendation: {
    select: {
      consensusDetails: true,
      currentConsensus: true,
      recentAnalystViews: true,
    },
  },
  equityValuationAndDcfAnalysis: {
    select: {
      keyAssumptions: true,
      dcfValuationBuildup: true,
      keyTakeAway: true,
      projectedFinancialYears: {
        include: { projections: true },
      },
      valuationSensitivities: {
        include: { values: true },
      },
    },
  },
  financialStatementAnalyasis: {
    select: {
      keyObservations: true,
      capitalPositionAnalysis: true,
      fcfQualityAnalysis: true,
      valuationObservations: true,
      incomeStatementTrendRows: true,
      balanceSheetStrengthRows: true,
      cashFlowAnalysisRows: true,
      financialRatioMetrics: { include: { values: true } },
    },
  },
  businessSegmentData: {
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
  },
  interimResultsAndQuarterlyPerformance: {
    select: {
      id: true,
      title: true,
      keyPositives: true,
      keyNegatives: true,
      recordFinancialPerformance: true,
      forwardGuidance: {
        select: {
          id: true,
          managementCommentary: true,
          analystConsensusFY1: true,
        },
      },
    },
  },
  contingentLiabilitiesAndRegulatoryRisk: {
    select: {
      id: true,
      balanceSheetContingencies: true,
      keyRegulatoryConsiderations: true,
      netContingentPosition: true,
    },
  },
  dcfValuationRecapAndPriceTarget: {
    select: {
      id: true,
      sectionTitle: true,
      valuationSummaryTitle: true,
      baseCaseAssumption: true,
      pvOfFcf: true,
      pvOfTerminalValue: true,
      enterpriseValue: true,
      netDebt: true,
      equityValue: true,
      sharesDiluted: true,
      fairValuePerShare: true,
      currentPrice: true,
      upside: true,
      recommendation: true,
      twelveMonthPriceTarget: true,
      rationaleForPriceTarget: true,
      sensitivityAnalysisRecap: true,
    },
  },
  agmAndShareholderMatters: {
    select: {
      id: true,
      sectionTitle: true,
      announcedDate: true,
      location: true,
      noticeFiled: true,
      specialResolutionsExpected: true,
      keyGovernanceNotes: true,
      expectedVotingAgenda: true,
    },
  },
  forwardProjectionsAndValuation: {
    select: {
      sectionTitle: true,
      keyProjectionDrivers: true,
      balanceSheetDynamics: true,
      keyObservations: true,
      creditOutlook: true,
      projectedIncomeStatementRows: true,
      projectedBalanceSheetRows: true,
      projectedCashFlowRows: true,
      creditMetricsRows: true,
    },
  },
  conclusionAndRecommendation: true,
} as const;

const dedupeByKey = <T>(items: T[] | undefined, getKey: (item: T) => string): T[] => {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  const deduped: T[] = [];
  for (const item of items) {
    const key = getKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }
  return deduped;
};

function mapEquityProjectionMetricToLegacy(metric: string): ProjectionMetricType {
  switch (metric) {
    case 'REVENUE':
      return 'REVENUE_GBP_M';
    case 'PBT':
      return 'PBT_GBP_M';
    case 'NET_INCOME':
      return 'NET_INCOME_GBP_M';
    case 'DILUTED_EPS':
      return 'DILUTED_EPS_P';
    default:
      return metric as ProjectionMetricType;
  }
}

async function waitForPersistedSection(
  symbol: string,
  sectionKey: ReportSectionKey,
): Promise<Awaited<ReturnType<typeof readSectionDetails>>> {
  const delaysMs = [0, 50, 150, 300];

  for (const delayMs of delaysMs) {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const persisted = await readSectionDetails(symbol, sectionKey);
    if (persisted.sectionData) {
      return persisted;
    }
  }

  return readSectionDetails(symbol, sectionKey);
}

async function readSectionDetails(symbol: string, sectionKey: ReportSectionKey) {
  const company = await prisma.company.findUnique({
    where: { symbol },
    select: {
      companyName: true,
      report: {
        select: {
          id: true,
          [sectionKey]: REPORT_SECTION_SELECT[sectionKey],
        } as Record<string, unknown>,
      },
    },
  });

  return {
    companyName: company?.companyName ?? symbol,
    reportId: company?.report?.id ?? null,
    sectionData: (company?.report?.[sectionKey as keyof NonNullable<typeof company.report>] ??
      null) as unknown,
  };
}

async function generateSectionData(symbol: string, sectionKey: ReportSectionKey) {
  const sourceBundle = await getReportSourceBundle(symbol);
  const generationOptions = { sourceBundle, enableWebSearch: false } as const;

  switch (sectionKey) {
    case 'executiveSummary':
      return getExecutiveInformationAboutCompany(symbol, generationOptions);
    case 'overviewAndStockMetrics':
      return getOverviewMetricsAboutCompany(symbol, generationOptions);
    case 'shareHolderStructure':
      return getShareholderStructureAboutCompany(symbol, generationOptions);
    case 'analystRecommendation':
      return getAnalystRecommendationsAboutCompany(symbol, generationOptions);
    case 'equityValuationAndDcfAnalysis':
      return getEquityValuationAboutCompany(symbol, generationOptions);
    case 'financialStatementAnalyasis':
      return getFinancialStatementsAnalysisAboutCompany(symbol, generationOptions);
    case 'businessSegmentData':
      return getBusinessSegmentDataAboutCompany(symbol, generationOptions);
    case 'interimResultsAndQuarterlyPerformance':
      return getInterimResultsAndQuarterlyPerformanceAboutCompany(symbol, generationOptions);
    case 'contingentLiabilitiesAndRegulatoryRisk':
      return getContingentLiabilitiesAndRegulatoryRiskAboutCompany(symbol, generationOptions);
    case 'dcfValuationRecapAndPriceTarget':
      return getDcfValuationRecapAndPriceTargetAboutCompany(symbol, generationOptions);
    case 'forwardProjectionsAndValuation':
      return getForwardProjectionsAndValuationAboutCompany(symbol, generationOptions);
    case 'agmAndShareholderMatters':
      return getAgmAndShareholderMattersAboutCompany(symbol, generationOptions);
    case 'conclusionAndRecommendation':
      return getConclusionAndRecommendationAboutCompany(symbol, generationOptions);
    default:
      throw new Error(`Unsupported section key: ${sectionKey}`);
  }
}

function toSectionCreateOperation(sectionKey: ReportSectionKey, generatedData: unknown) {
  switch (sectionKey) {
    case 'executiveSummary': {
      const sectionData = generatedData as z.infer<typeof ExecutiveSchema>;
      return {
        create: {
          analystConsensus: sectionData.investmentThesis.analystConsensus,
          positive: sectionData.investmentThesis.positives,
          risk: sectionData.investmentThesis.risks,
          summary: sectionData.executiveSummary,
          upside: sectionData.investmentThesis.upside,
          dcfFairValue: sectionData.investmentThesis.dcfFairValue,
          currentPrice: sectionData.investmentThesis.currentPrice,
        },
      };
    }
    case 'overviewAndStockMetrics': {
      const sectionData = generatedData as z.infer<typeof CompanyOverviewSchema>;
      return {
        create: {
          fiftyTwoWeekPerformance: sectionData.fiftyTwoWeekPerformance,
          stockMetrics: {
            createMany: {
              data: sectionData.metrics.map((metric) => ({
                name: metric.name,
                note: metric.note,
                value: metric.value,
              })),
            },
          },
        },
      };
    }
    case 'shareHolderStructure': {
      const sectionData = generatedData as z.infer<typeof ShareholderStructureSectionSchema>;
      return {
        create: {
          totalShares: sectionData.shareCapitalStructure.totalShares,
          shareCapitalNotes: sectionData.shareCapitalStructure.notes,
          keyInsiderObservations: sectionData.keyInsiderObservations,
          majorShareholders: {
            createMany: {
              data: sectionData.majorShareholders.map((shareholder) => ({
                shareHolderType: shareholder.shareHolderType,
                ownership: shareholder.ownership,
                notes: shareholder.notes,
              })),
              skipDuplicates: true,
            },
          },
        },
      };
    }
    case 'analystRecommendation': {
      const sectionData = generatedData as z.infer<typeof AnalystRecommendationsSchema>;
      return {
        create: {
          recentAnalystViews: sectionData.recentAnalystViews,
          consensusDetails: {
            createMany: { data: sectionData.consensusDetails, skipDuplicates: true },
          },
          currentConsensus: {
            createMany: {
              data: sectionData.currentConsensus,
              skipDuplicates: true,
            },
          },
        },
      };
    }
    case 'equityValuationAndDcfAnalysis': {
      const sectionData = generatedData as z.infer<typeof EquityValuationDcfSchema>;
      return {
        create: {
          keyTakeAway: sectionData.keyTakeAway,
          keyAssumptions: {
            createMany: {
              data: sectionData.keyAssumptions.map((a) => ({
                modelName: a.modelName,
                assumption: a.assumption,
              })),
              skipDuplicates: true,
            },
          },
          projectedFinancialYears: {
            create: sectionData.projectedFinanacialNext5Years.map((y) => ({
              financialYear: y.financialYear,
              projections: {
                createMany: {
                  data: y.projections.map((p) => ({
                    metric: mapEquityProjectionMetricToLegacy(p.metric),
                    value: p.value,
                  })),
                  skipDuplicates: true,
                },
              },
            })),
          },
          dcfValuationBuildup: {
            create: {
              pvOfFCF: sectionData.dcfValuationBuildups.pvOfFCF,
              pvOfTerminalValue: sectionData.dcfValuationBuildups.pvOfTerminalValue,
              enterpriseValue: sectionData.dcfValuationBuildups.enterpriseValue,
              netDebt: sectionData.dcfValuationBuildups.netDebt,
              equityValue: sectionData.dcfValuationBuildups.equityValue,
              fairValuePerShare: sectionData.dcfValuationBuildups.fairValuePerShare,
              currentPrice: sectionData.dcfValuationBuildups.currentPrice,
              impliedUpside: sectionData.dcfValuationBuildups.impliedUpside,
              note: sectionData.dcfValuationBuildups.note,
            },
          },
          valuationSensitivities: {
            create: sectionData.valuationSensitivityAnalysis.map((row) => ({
              wacc: row.wacc,
              values: {
                createMany: {
                  data: row.value.map((v) => ({
                    terminalGrowth: v.terminalGrowth,
                    value: v.value,
                  })),
                  skipDuplicates: true,
                },
              },
            })),
          },
        },
      };
    }
    case 'financialStatementAnalyasis': {
      const sectionData = generatedData as z.infer<typeof FinancialStatementsAnalysisSchema>;
      const financialIncomeRows = dedupeByKey(sectionData.incomeStatementTrend.table, (row) =>
        String((row as { fiscalYear?: string }).fiscalYear || ''),
      );
      const financialBalanceRows = dedupeByKey(sectionData.balanceSheetStrength.table, (row) =>
        String((row as { fiscalYear?: string }).fiscalYear || ''),
      );
      const financialCashflowRows = dedupeByKey(sectionData.cashFlowAnalysis.table, (row) =>
        String((row as { fiscalYear?: string }).fiscalYear || ''),
      );
      const financialRatioRows = dedupeByKey(
        sectionData.financialRatiosAndCreditMetrics.table,
        (row) => String((row as { metric?: string }).metric || ''),
      );
      return {
        create: {
          keyObservations: sectionData.incomeStatementTrend.keyObservations,
          capitalPositionAnalysis: sectionData.balanceSheetStrength.capitalPositionAnalysis,
          fcfQualityAnalysis: sectionData.cashFlowAnalysis.fcfQualityAnalysis,
          valuationObservations: sectionData.financialRatiosAndCreditMetrics.valuationObservations,
          incomeStatementTrendRows: {
            createMany: {
              data: financialIncomeRows,
              skipDuplicates: true,
            },
          },
          balanceSheetStrengthRows: {
            createMany: {
              data: financialBalanceRows,
              skipDuplicates: true,
            },
          },
          cashFlowAnalysisRows: {
            createMany: {
              data: financialCashflowRows,
              skipDuplicates: true,
            },
          },
          financialRatioMetrics: {
            createMany: {
              data: (financialRatioRows as Array<{ metric: string }>).map(({ metric }) => ({
                metric,
              })),
              skipDuplicates: true,
            },
          },
        },
      };
    }
    case 'businessSegmentData': {
      const sectionData = generatedData as z.infer<
        typeof BusinessSegmentsCompetitivePositionSchema
      >;
      return {
        create: {
          businessModelDynamics: sectionData.businessModelDynamics,
          revenueModelBreakdown: {
            createMany: {
              data: sectionData.revenueModelBreakdown.map((row) => ({
                revenueStream: row.revenueStream,
                amount: row.amount,
                percentOfTotal: row.percentOfTotal,
                growth: row.growth,
                driver: row.driver,
              })),
              skipDuplicates: true,
            },
          },
          platformSegmentPerformance: {
            createMany: {
              data: sectionData.platformSegmentsPerformance.map((row) => ({
                segment: row.segment,
                customers: row.customers,
                aua: row.aua,
                growth: row.growth,
                netInflows: row.netInflows,
                comments: row.comments,
              })),
              skipDuplicates: true,
            },
          },
          competitivePosition: {
            create: {
              keyCompetitors: {
                createMany: {
                  data: sectionData.competitivePosition.keyCompetitors,
                  skipDuplicates: true,
                },
              },
              competitiveAdvantage: {
                createMany: {
                  data: sectionData.competitivePosition.competitiveAdvantages,
                  skipDuplicates: true,
                },
              },
            },
          },
        },
      };
    }
    case 'interimResultsAndQuarterlyPerformance': {
      const sectionData = generatedData as z.infer<typeof InterimResultsQuarterlyPerformanceSchema>;
      return {
        create: {
          title: sectionData.title,
          keyPositives: sectionData.keyPositives,
          keyNegatives: sectionData.keyNegatives,
          recordFinancialPerformance: {
            createMany: {
              data: sectionData.recordFinancialPerformance,
              skipDuplicates: true,
            },
          },
          forwardGuidance: {
            create: {
              managementCommentary: {
                create: {
                  ceoName: sectionData.forwardGuidance.managementCommentary.ceoName,
                  quotes: sectionData.forwardGuidance.managementCommentary.quotes,
                },
              },
              analystConsensusFY1: {
                createMany: {
                  data: sectionData.forwardGuidance.analystConsensusFY1,
                  skipDuplicates: true,
                },
              },
            },
          },
        },
      };
    }
    case 'contingentLiabilitiesAndRegulatoryRisk': {
      const sectionData = generatedData as z.infer<
        typeof ContingentLiabilitiesRegulatoryRisksSchema
      >;
      return {
        create: {
          sectionTitle: sectionData.sectionTitle,
          balanceSheetContingencies: {
            createMany: {
              data: sectionData.balanceSheetContingencies,
              skipDuplicates: true,
            },
          },
          netContingentPosition: {
            create: sectionData.netContingentPosition,
          },
          keyRegulatoryConsiderations: {
            createMany: {
              data: sectionData.regulatoryEnvironment.keyRegulatoryConsiderations,
              skipDuplicates: true,
            },
          },
        },
      };
    }
    case 'dcfValuationRecapAndPriceTarget': {
      const sectionData = generatedData as z.infer<typeof DcfValuationRecapAndPriceTargetSchema>;
      return {
        create: {
          sectionTitle: sectionData.sectionTitle,
          valuationSummaryTitle: sectionData.valuationSummaryTitle,
          baseCaseAssumption: sectionData.baseCaseAssumption,
          pvOfFcf: sectionData.valuationBuildUp.pvOfFcf,
          pvOfTerminalValue: sectionData.valuationBuildUp.pvOfTerminalValue,
          enterpriseValue: sectionData.valuationBuildUp.enterpriseValue,
          netDebt: sectionData.valuationBuildUp.netDebt,
          equityValue: sectionData.valuationBuildUp.equityValue,
          sharesDiluted: sectionData.valuationBuildUp.sharesDiluted,
          fairValuePerShare: sectionData.valuationBuildUp.fairValuePerShare,
          currentPrice: sectionData.valuationBuildUp.currentPrice,
          upside: sectionData.valuationBuildUp.upside,
          recommendation: sectionData.valuationBuildUp.recommendation,
          twelveMonthPriceTarget: sectionData.twelveMonthPriceTarget,
          rationaleForPriceTarget: sectionData.rationaleForPriceTarget,
          sensitivityAnalysisRecap: {
            createMany: {
              data: sectionData.sensitivityAnalysisRecap,
              skipDuplicates: true,
            },
          },
        },
      };
    }
    case 'forwardProjectionsAndValuation': {
      const sectionData = generatedData as z.infer<typeof ForwardProjectionsAndValuationSchema>;
      return {
        create: {
          sectionTitle: sectionData.sectionTitle,
          keyProjectionDrivers: sectionData.keyProjectionDrivers,
          balanceSheetDynamics: sectionData.balanceSheetDynamics,
          keyObservations: sectionData.keyObservations,
          creditOutlook: sectionData.creditOutlook,
          projectedIncomeStatementRows: {
            createMany: {
              data: sectionData.projectedIncomeStatement,
              skipDuplicates: true,
            },
          },
          projectedBalanceSheetRows: {
            createMany: {
              data: sectionData.projectedBalanceSheet,
              skipDuplicates: true,
            },
          },
          projectedCashFlowRows: {
            createMany: {
              data: sectionData.projectedCashFlow,
              skipDuplicates: true,
            },
          },
          creditMetricsRows: {
            createMany: {
              data: sectionData.creditMetricsProjection,
              skipDuplicates: true,
            },
          },
        },
      };
    }
    case 'agmAndShareholderMatters': {
      const sectionData = generatedData as z.infer<typeof AgmAndShareholderMattersSchema>;
      return {
        create: {
          sectionTitle: sectionData.sectionTitle,
          announcedDate: sectionData.nextAgmDetails.announcedDate,
          location: sectionData.nextAgmDetails.location,
          noticeFiled: sectionData.nextAgmDetails.noticeFiled,
          specialResolutionsExpected: sectionData.specialResolutionsExpected,
          keyGovernanceNotes: sectionData.keyGovernanceNotes,
          expectedVotingAgenda: {
            createMany: {
              data: sectionData.expectedVotingAgenda,
              skipDuplicates: true,
            },
          },
        },
      };
    }
    case 'conclusionAndRecommendation': {
      const sectionData = generatedData as z.infer<typeof ConclusionAndRecommendationSchema>;
      return {
        create: sectionData,
      };
    }
    default:
      throw new Error(`Unsupported section key: ${sectionKey}`);
  }
}

export async function getOrGenerateReportSection(symbol: string, sectionKey: ReportSectionKey) {
  await prisma.company.upsert({
    where: { symbol },
    create: { symbol },
    update: {},
    select: { id: true },
  });

  const existing = await readSectionDetails(symbol, sectionKey);
  if (existing.sectionData) {
    return {
      sectionKey,
      companyName: existing.companyName,
      data: existing.sectionData,
    };
  }

  const generatedData = await generateSectionData(symbol, sectionKey);
  const sectionCreateOperation = toSectionCreateOperation(sectionKey, generatedData);

  const company = await prisma.company.findUnique({
    where: { symbol },
    select: { id: true, report: { select: { id: true } } },
  });

  if (!company) {
    throw new Error(`Company not found for symbol: ${symbol}`);
  }

  const generatedCompanyName =
    sectionKey === 'executiveSummary'
      ? (generatedData as { companyName?: string | null }).companyName
      : undefined;

  try {
    if (company.report?.id) {
      await prisma.report.update({
        where: { id: company.report.id },
        data: {
          [sectionKey]: sectionCreateOperation,
        } as Record<string, unknown>,
      });
    } else {
      await prisma.report.upsert({
        where: { companyId: company.id },
        create: {
          companyId: company.id,
          [sectionKey]: sectionCreateOperation,
        },
        update: {
          [sectionKey]: sectionCreateOperation,
        } as Record<string, unknown>,
      });
    }
  } catch (error) {
    // Concurrent section requests may create the report or this section first.
    // In that case we re-read with a short backoff and return existing persisted data.
    const concurrent = await waitForPersistedSection(symbol, sectionKey);
    if (!concurrent.sectionData) throw error;
  }

  if (generatedCompanyName) {
    await prisma.company.update({
      where: { id: company.id },
      data: { companyName: generatedCompanyName },
    });
  }

  const latest = await waitForPersistedSection(symbol, sectionKey);

  if (!latest.sectionData) {
    throw new Error(`Failed to persist section ${sectionKey} for symbol ${symbol}`);
  }

  return {
    sectionKey,
    companyName: latest.companyName,
    data: latest.sectionData,
  };
}
