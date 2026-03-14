import 'server-only';

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
} from '@/server';

export const getReportDetails = async (symbol: string) => {
  let company = (await prisma.company.upsert({
    where: { symbol },
    create: { symbol },
    update: {},
    select: {
      report: {
        select: {
          id: true,
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
        },
      },
      companyName: true,
    },
  }))!;
  if (!company.report?.interimResultsAndQuarterlyPerformance) {
    const interimResultsAndQuarterlyPerformance =
      await getInterimResultsAndQuarterlyPerformanceAboutCompany(symbol);

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
          },
        },
        companyName: true,
      },
      data: {
        report: {
          update: {
            interimResultsAndQuarterlyPerformance: {
              create: {
                title: interimResultsAndQuarterlyPerformance.title,
                keyPositives: interimResultsAndQuarterlyPerformance.keyPositives,
                keyNegatives: interimResultsAndQuarterlyPerformance.keyNegatives,
                recordFinancialPerformance: {
                  createMany: {
                    data: interimResultsAndQuarterlyPerformance.recordFinancialPerformance,
                  },
                },
                forwardGuidance: {
                  create: {
                    managementCommentary: {
                      create: {
                        ceoName:
                          interimResultsAndQuarterlyPerformance.forwardGuidance.managementCommentary.ceoName,
                        quotes:
                          interimResultsAndQuarterlyPerformance.forwardGuidance.managementCommentary.quotes,
                      },
                    },
                    analystConsensusFY1: {
                      createMany: {
                        data: interimResultsAndQuarterlyPerformance.forwardGuidance.analystConsensusFY1,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    //@ts-ignore
    company = { ...newInfo };
  }

  if (!company.report?.contingentLiabilitiesAndRegulatoryRisk) {
    const contingentLiabilitiesAndRegulatoryRisk =
      await getContingentLiabilitiesAndRegulatoryRiskAboutCompany(symbol);

    const newInfo = await prisma.company.update({
      where: { symbol },
      select: {
        report: {
          select: {
            id: true,
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
          },
        },
        companyName: true,
      },
      data: {
        report: {
          update: {
            contingentLiabilitiesAndRegulatoryRisk: {
              create: {
                sectionTitle: contingentLiabilitiesAndRegulatoryRisk.sectionTitle,
                balanceSheetContingencies: {
                  createMany: {
                    data: contingentLiabilitiesAndRegulatoryRisk.balanceSheetContingencies,
                  },
                },
                netContingentPosition: {
                  create: contingentLiabilitiesAndRegulatoryRisk.netContingentPosition,
                },
                keyRegulatoryConsiderations: {
                  createMany: {
                    data: contingentLiabilitiesAndRegulatoryRisk.regulatoryEnvironment.keyRegulatoryConsiderations,
                  },
                },
              },
            },
          },
        },
      },
    });

    //@ts-ignore
    company = { ...newInfo };
  }
  if (!company?.report) {
    const executiveInfo = await getExecutiveInformationAboutCompany(symbol);
    const overviewInfo = await getOverviewMetricsAboutCompany(symbol);
    const shareHolderInfo = await getShareholderStructureAboutCompany(symbol);
    const analystInfo = await getAnalystRecommendationsAboutCompany(symbol);
    const equityValuationAndDcfAnalysisInfo =
      await getEquityValuationAboutCompany(symbol);
    const financialStatementAnalysisInfo =
      await getFinancialStatementsAnalysisAboutCompany(symbol);
    const businessSegmentData =
      await getBusinessSegmentDataAboutCompany(symbol);
          const interimResultsAndQuarterlyPerformance =
      await getInterimResultsAndQuarterlyPerformanceAboutCompany(symbol);
    const contingentLiabilitiesAndRegulatoryRisk =
      await getContingentLiabilitiesAndRegulatoryRiskAboutCompany(symbol);
    const newInfo = await prisma.company.update({
      where: { symbol },
      select: {
        report: {
          select: {
            id: true,
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
                totalShares: shareHolderInfo.shareCapitalStructure.totalShares,
                shareCapitalNotes: shareHolderInfo.shareCapitalStructure.notes,
                keyInsiderObservations: shareHolderInfo.keyInsiderObservations,
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
                      (a) => ({
                        modelName: a.modelName,
                        assumption: a.assumption,
                      }),
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
                    note: equityValuationAndDcfAnalysisInfo.dcfValuationBuildups
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
            financialStatementAnalyasis: {
              create: {
                keyObservations:
                  financialStatementAnalysisInfo.incomeStatementTrend
                    .keyObservations,
                capitalPositionAnalysis:
                  financialStatementAnalysisInfo.balanceSheetStrength
                    .capitalPositionAnalysis,
                fcfQualityAnalysis:
                  financialStatementAnalysisInfo.cashFlowAnalysis
                    .fcfQualityAnalysis,
                valuationObservations:
                  financialStatementAnalysisInfo.financialRatiosAndCreditMetrics
                    .valuationObservations,
                incomeStatementTrendRows: {
                  createMany: {
                    data: financialStatementAnalysisInfo.incomeStatementTrend
                      .table,
                  },
                },
                balanceSheetStrengthRows: {
                  createMany: {
                    data: financialStatementAnalysisInfo.balanceSheetStrength
                      .table,
                  },
                },
                cashFlowAnalysisRows: {
                  createMany: {
                    data: financialStatementAnalysisInfo.cashFlowAnalysis.table,
                  },
                },
                financialRatioMetrics: {
                  createMany: {
                    data: financialStatementAnalysisInfo.financialRatiosAndCreditMetrics.table.map(
                      ({ metric, values }) => ({
                        metric,
                      }),
                    ),
                  },
                },
              },
            },
            businessSegmentData: {
              create: {
                businessModelDynamics:
                  businessSegmentData.businessModelDynamics,
                revenueModelBreakdown: {
                  createMany: {
                    data: businessSegmentData.revenueModelBreakdown.map(
                      (row) => ({
                        revenueStream: row.revenueStream,
                        amount: row.amount,
                        percentOfTotal: row.percentOfTotal,
                        growth: row.growth,
                        driver: row.driver,
                      }),
                    ),
                  },
                },
                platformSegmentPerformance: {
                  createMany: {
                    data: businessSegmentData.platformSegmentsPerformance.map(
                      (row) => ({
                        segment: row.segment,
                        customers: row.customers,
                        aua: row.aua,
                        growth: row.growth,
                        netInflows: row.netInflows,
                        comments: row.comments,
                      }),
                    ),
                  },
                },
                competitivePosition: {
                  create: {
                    keyCompetitors: {
                      createMany: {
                        data: businessSegmentData.competitivePosition
                          .keyCompetitors,
                      },
                    },
                    competitiveAdvantage: {
                      createMany: {
                        data: businessSegmentData.competitivePosition
                          .competitiveAdvantages,
                      },
                    },
                  },
                },
              },
            },
            interimResultsAndQuarterlyPerformance: {
              create: {
                title: interimResultsAndQuarterlyPerformance.title,
                keyPositives: interimResultsAndQuarterlyPerformance.keyPositives,
                keyNegatives: interimResultsAndQuarterlyPerformance.keyNegatives,
                recordFinancialPerformance: {
                  createMany: {
                    data: interimResultsAndQuarterlyPerformance.recordFinancialPerformance,
                  },
                },
                forwardGuidance: {
                  create: {
                    managementCommentary: {
                      create: {
                        ceoName:
                          interimResultsAndQuarterlyPerformance.forwardGuidance.managementCommentary.ceoName,
                        quotes:
                          interimResultsAndQuarterlyPerformance.forwardGuidance.managementCommentary.quotes,
                      },
                    },
                    analystConsensusFY1: {
                      createMany: {
                        data: interimResultsAndQuarterlyPerformance.forwardGuidance.analystConsensusFY1,
                      },
                    },
                  },
                },
              },
            },
            contingentLiabilitiesAndRegulatoryRisk: {
              create: {
                sectionTitle: contingentLiabilitiesAndRegulatoryRisk.sectionTitle,
                balanceSheetContingencies: {
                  createMany: {
                    data: contingentLiabilitiesAndRegulatoryRisk.balanceSheetContingencies,
                  },
                },
                netContingentPosition: {
                  create: contingentLiabilitiesAndRegulatoryRisk.netContingentPosition,
                },
                keyRegulatoryConsiderations: {
                  createMany: {
                    data: contingentLiabilitiesAndRegulatoryRisk.regulatoryEnvironment.keyRegulatoryConsiderations,
                  },
                },
              },
            },
          },
        },
      },
    });
    company = { ...newInfo };
  }
  return company;
};
