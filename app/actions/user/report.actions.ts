'use server';
import { ROLES } from '@/app/generated/prisma/enums';
import { convertToErrorInstance } from '@/lib';
import prisma from '@/prisma';
import {
  getAnalystRecommendationsAboutCompany,
  getBusinessSegmentDataAboutCompany,
  getContingentLiabilitiesAndRegulatoryRiskAboutCompany,
  getEquityValuationAboutCompany,
  getExecutiveInformationAboutCompany,
  getFinancialStatementsAnalysisAboutCompany,
  getInterimResultsAndQuarterlyPerformanceAboutCompany,
  getOverviewMetricsAboutCompany,
  getShareholderStructureAboutCompany,
  requireRBAC,
} from '@/server';

export const getReport = requireRBAC(ROLES.USER)(async (symbol: string) => {
  try {
    let company = (await prisma.company.upsert({
      where: { symbol },
      create: { symbol },
      update: {},
      select: {
        report: {
          select: {
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
          },
        },
        companyName: true,
      },
    }))!;
    if (!company?.report) {
      const executiveInfo = await getExecutiveInformationAboutCompany(symbol);
      const overviewInfo = await getOverviewMetricsAboutCompany(symbol);
      const shareHolderInfo = await getShareholderStructureAboutCompany(symbol);
      const analystInfo = await getAnalystRecommendationsAboutCompany(symbol);
      const equityValuationAndDcfAnalysisInfo =
        await getEquityValuationAboutCompany(symbol);
      const newInfo = await prisma.company.update({
        where: { symbol },
        select: {
          report: {
            select: {
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
                  projectedFinancialYears: { include: { projections: true } },
                  valuationSensitivities: { include: { values: true } },
                },
              },
            },
          },
          companyName: true,
        },
        data: {
          companyName: executiveInfo.companyName,
          report: {
            create: {
              executiveSummary: {
                create: {
                  analystConsensus:
                    executiveInfo.investmentThesis.analystConsensus,
                  positive: executiveInfo.investmentThesis.positives,
                  risk: executiveInfo.investmentThesis.risks,
                  summary: executiveInfo.executiveSummary,
                  upside: executiveInfo.investmentThesis.upside,
                  dcfFairValue: executiveInfo.investmentThesis.dcfFairValue,
                  currentPrice: executiveInfo.investmentThesis.currentPrice,
                },
              },
              overviewAndStockMetrics: {
                create: {
                  fiftyTwoWeekPerformance: overviewInfo.fiftyTwoWeekPerformance,
                  stockMetrics: {
                    createMany: {
                      data: overviewInfo.metrics.map((metric) => ({
                        name: metric.name,
                        note: metric.note,
                        value: metric.value,
                      })),
                    },
                  },
                },
              },
              shareHolderStructure: {
                create: {
                  totalShares:
                    shareHolderInfo.shareCapitalStructure.totalShares,
                  shareCapitalNotes:
                    shareHolderInfo.shareCapitalStructure.notes,
                  keyInsiderObservations:
                    shareHolderInfo.keyInsiderObservations,
                  majorShareholders: {
                    createMany: {
                      data: shareHolderInfo.majorShareholders.map(
                        (shareholder) => ({
                          shareHolderType: shareholder.shareHolderType,
                          ownership: shareholder.ownership,
                          notes: shareholder.notes,
                        }),
                      ),
                    },
                  },
                },
              },
              analystRecommendation: {
                create: {
                  recentAnalystViews: analystInfo.recentAnalystViews,
                  consensusDetails: {
                    createMany: { data: analystInfo.consensusDetails },
                  },
                  currentConsensus: {
                    createMany: {
                      data: analystInfo.currentConsensus,
                    },
                  },
                },
              },
              equityValuationAndDcfAnalysis: {
                create: {
                  keyTakeAway: equityValuationAndDcfAnalysisInfo.keyTakeAway,
                  keyAssumptions: {
                    createMany: {
                      data: equityValuationAndDcfAnalysisInfo.keyAssumptions.map(
                        (a) => ({ modelName: a.modelName, assumption: a.assumption }),
                      ),
                    },
                  },
                  projectedFinancialYears: {
                    create:
                      equityValuationAndDcfAnalysisInfo.projectedFinanacialNext5Years.map(
                        (y) => ({
                          financialYear: y.financialYear,
                          projections: {
                            createMany: {
                              data: y.projections.map((p) => ({
                                metric: p.metric,
                                value: p.value,
                              })),
                            },
                          },
                        }),
                      ),
                  },
                  dcfValuationBuildup: {
                    create: {
                      pvOfFCF:
                        equityValuationAndDcfAnalysisInfo.dcfValuationBuildups
                          .pvOfFCF,
                      pvOfTerminalValue:
                        equityValuationAndDcfAnalysisInfo.dcfValuationBuildups
                          .pvOfTerminalValue,
                      enterpriseValue:
                        equityValuationAndDcfAnalysisInfo.dcfValuationBuildups
                          .enterpriseValue,
                      netDebt:
                        equityValuationAndDcfAnalysisInfo.dcfValuationBuildups
                          .netDebt,
                      equityValue:
                        equityValuationAndDcfAnalysisInfo.dcfValuationBuildups
                          .equityValue,
                      fairValuePerShare:
                        equityValuationAndDcfAnalysisInfo.dcfValuationBuildups
                          .fairValuePerShare,
                      currentPrice:
                        equityValuationAndDcfAnalysisInfo.dcfValuationBuildups
                          .currentPrice,
                      impliedUpside:
                        equityValuationAndDcfAnalysisInfo.dcfValuationBuildups
                          .impliedUpside,
                      note:
                        equityValuationAndDcfAnalysisInfo.dcfValuationBuildups
                          .note,
                    },
                  },
                  valuationSensitivities: {
                    create:
                      equityValuationAndDcfAnalysisInfo.valuationSensitivityAnalysis.map(
                        (row) => ({
                          wacc: row.wacc,
                          values: {
                            createMany: {
                              data: row.value.map((v) => ({
                                terminalGrowth: v.terminalGrowth,
                                value: v.value,
                              })),
                            },
                          },
                        }),
                      ),
                  },
                },
              },
            },
          },
        },
      });
      company = { ...newInfo };
    }

    return {
      okay: true,
      data: { ...company },
    };
  } catch (error) {
    return { okay: false, error: convertToErrorInstance(error) };
  }
});
