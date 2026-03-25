import 'server-only';

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
  getReportSourceBundle,
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
        },
      },
      companyName: true,
    },
  }))!;

  if (!company?.report) {
    console.log({ report: true });
    const withSuccessLog = <T>(sectionName: string, sectionPromise: Promise<T>): Promise<T> =>
      sectionPromise.then((data) => {
        // console.info(`[getReportDetails:${symbol}] fetched ${sectionName}`);
        return data;
      });
    console.log('started');

    const sourceBundle = await getReportSourceBundle(symbol);
    const generationOptions = {
      sourceBundle,
      enableWebSearch: false,
    } as const;

    const sectionPromises = [
      withSuccessLog(
        'executiveSummary',
        getExecutiveInformationAboutCompany(symbol, generationOptions),
      ),
      withSuccessLog(
        'overviewAndStockMetrics',
        getOverviewMetricsAboutCompany(symbol, generationOptions),
      ),
      withSuccessLog(
        'shareHolderStructure',
        getShareholderStructureAboutCompany(symbol, generationOptions),
      ),
      withSuccessLog(
        'analystRecommendation',
        getAnalystRecommendationsAboutCompany(symbol, generationOptions),
      ),
      withSuccessLog(
        'equityValuationAndDcfAnalysis',
        getEquityValuationAboutCompany(symbol, generationOptions),
      ),
      withSuccessLog(
        'financialStatementAnalyasis',
        getFinancialStatementsAnalysisAboutCompany(symbol, generationOptions),
      ),
      withSuccessLog(
        'businessSegmentData',
        getBusinessSegmentDataAboutCompany(symbol, generationOptions),
      ),
      withSuccessLog(
        'forwardProjectionsAndValuation',
        getForwardProjectionsAndValuationAboutCompany(symbol, generationOptions),
      ),
      // withSuccessLog(
      //   'interimResultsAndQuarterlyPerformance',
      //   getInterimResultsAndQuarterlyPerformanceAboutCompany(symbol),
      // ),
      withSuccessLog(
        'contingentLiabilitiesAndRegulatoryRisk',
        getContingentLiabilitiesAndRegulatoryRiskAboutCompany(symbol, generationOptions),
      ),
      withSuccessLog(
        'agmAndShareholderMatters',
        getAgmAndShareholderMattersAboutCompany(symbol, generationOptions),
      ),
      withSuccessLog(
        'conclusionAndRecommendation',
        getConclusionAndRecommendationAboutCompany(symbol, generationOptions),
      ),
      withSuccessLog(
        'dcfValuationRecapAndPriceTarget',
        getDcfValuationRecapAndPriceTargetAboutCompany(symbol, generationOptions),
      ),
    ] as const;
    console.log(1);

    const [
      executiveInfoResult,
      overviewInfoResult,
      shareHolderInfoResult,
      analystInfoResult,
      equityValuationAndDcfAnalysisInfoResult,
      financialStatementAnalysisInfoResult,
      businessSegmentDataResult,
      forwardProjectionsAndValuationResult,
      // interimResultsAndQuarterlyPerformanceResult,
      contingentLiabilitiesAndRegulatoryRiskResult,
      agmAndShareholderMattersResult,
      conclusionAndRecommendationResult,
      dcfValuationRecapAndPriceTargetResult,
    ] = await Promise.allSettled(sectionPromises);

    console.log('Completed');

    const resolveSettled = <T>(sectionName: string, result: PromiseSettledResult<T>): T | null => {
      if (result.status === 'rejected') {
        console.error(`[getReportDetails:${symbol}] failed section ${sectionName}`, result.reason);
        return null;
      }
      return result.value;
    };

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

    const executiveInfo = resolveSettled('executiveSummary', executiveInfoResult);
    const overviewInfo = resolveSettled('overviewAndStockMetrics', overviewInfoResult);
    const shareHolderInfo = resolveSettled('shareHolderStructure', shareHolderInfoResult);
    const analystInfo = resolveSettled('analystRecommendation', analystInfoResult);
    const equityValuationAndDcfAnalysisInfo = resolveSettled(
      'equityValuationAndDcfAnalysis',
      equityValuationAndDcfAnalysisInfoResult,
    );
    const financialStatementAnalysisInfo = resolveSettled(
      'financialStatementAnalyasis',
      financialStatementAnalysisInfoResult,
    );
    const businessSegmentData = resolveSettled('businessSegmentData', businessSegmentDataResult);
    const forwardProjectionsAndValuation = resolveSettled(
      'forwardProjectionsAndValuation',
      forwardProjectionsAndValuationResult,
    );
    // const interimResultsAndQuarterlyPerformance = resolveSettled(
    //   interimResultsAndQuarterlyPerformanceResult,
    // );
    const contingentLiabilitiesAndRegulatoryRisk = resolveSettled(
      'contingentLiabilitiesAndRegulatoryRisk',
      contingentLiabilitiesAndRegulatoryRiskResult,
    );
    const agmAndShareholderMatters = resolveSettled(
      'agmAndShareholderMatters',
      agmAndShareholderMattersResult,
    );
    const conclusionAndRecommendation = resolveSettled(
      'conclusionAndRecommendation',
      conclusionAndRecommendationResult,
    );
    const dcfValuationRecapAndPriceTarget = resolveSettled(
      'dcfValuationRecapAndPriceTarget',
      dcfValuationRecapAndPriceTargetResult,
    );
    console.log('All resolved');

    const financialIncomeRows = dedupeByKey(
      financialStatementAnalysisInfo?.incomeStatementTrend?.table,
      (row) => String((row as { fiscalYear?: string }).fiscalYear || ''),
    );
    const financialBalanceRows = dedupeByKey(
      financialStatementAnalysisInfo?.balanceSheetStrength?.table,
      (row) => String((row as { fiscalYear?: string }).fiscalYear || ''),
    );
    const financialCashflowRows = dedupeByKey(
      financialStatementAnalysisInfo?.cashFlowAnalysis?.table,
      (row) => String((row as { fiscalYear?: string }).fiscalYear || ''),
    );
    const financialRatioRows = dedupeByKey(
      financialStatementAnalysisInfo?.financialRatiosAndCreditMetrics?.table,
      (row) => String((row as { metric?: string }).metric || ''),
    );

    const reportCreateData: Record<string, unknown> = {};

    if (executiveInfo) {
      reportCreateData.executiveSummary = {
        create: {
          analystConsensus: executiveInfo.investmentThesis.analystConsensus,
          positive: executiveInfo.investmentThesis.positives,
          risk: executiveInfo.investmentThesis.risks,
          summary: executiveInfo.executiveSummary,
          upside: executiveInfo.investmentThesis.upside,
          dcfFairValue: executiveInfo.investmentThesis.dcfFairValue,
          currentPrice: executiveInfo.investmentThesis.currentPrice,
        },
      };
    }

    if (overviewInfo) {
      reportCreateData.overviewAndStockMetrics = {
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
      };
    }

    if (shareHolderInfo) {
      reportCreateData.shareHolderStructure = {
        create: {
          totalShares: shareHolderInfo.shareCapitalStructure.totalShares,
          shareCapitalNotes: shareHolderInfo.shareCapitalStructure.notes,
          keyInsiderObservations: shareHolderInfo.keyInsiderObservations,
          majorShareholders: {
            createMany: {
              data: shareHolderInfo.majorShareholders.map((shareholder) => ({
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

    if (analystInfo) {
      reportCreateData.analystRecommendation = {
        create: {
          recentAnalystViews: analystInfo.recentAnalystViews,
          consensusDetails: {
            createMany: { data: analystInfo.consensusDetails, skipDuplicates: true },
          },
          currentConsensus: {
            createMany: {
              data: analystInfo.currentConsensus,
              skipDuplicates: true,
            },
          },
        },
      };
    }

    if (equityValuationAndDcfAnalysisInfo) {
      reportCreateData.equityValuationAndDcfAnalysis = {
        create: {
          keyTakeAway: equityValuationAndDcfAnalysisInfo.keyTakeAway,
          keyAssumptions: {
            createMany: {
              data: equityValuationAndDcfAnalysisInfo.keyAssumptions.map((a) => ({
                modelName: a.modelName,
                assumption: a.assumption,
              })),
              skipDuplicates: true,
            },
          },
          projectedFinancialYears: {
            create: equityValuationAndDcfAnalysisInfo.projectedFinanacialNext5Years.map((y) => ({
              financialYear: y.financialYear,
              projections: {
                createMany: {
                  data: y.projections.map((p) => ({
                    metric: p.metric,
                    value: p.value,
                  })),
                  skipDuplicates: true,
                },
              },
            })),
          },
          dcfValuationBuildup: {
            create: {
              pvOfFCF: equityValuationAndDcfAnalysisInfo.dcfValuationBuildups.pvOfFCF,
              pvOfTerminalValue:
                equityValuationAndDcfAnalysisInfo.dcfValuationBuildups.pvOfTerminalValue,
              enterpriseValue:
                equityValuationAndDcfAnalysisInfo.dcfValuationBuildups.enterpriseValue,
              netDebt: equityValuationAndDcfAnalysisInfo.dcfValuationBuildups.netDebt,
              equityValue: equityValuationAndDcfAnalysisInfo.dcfValuationBuildups.equityValue,
              fairValuePerShare:
                equityValuationAndDcfAnalysisInfo.dcfValuationBuildups.fairValuePerShare,
              currentPrice: equityValuationAndDcfAnalysisInfo.dcfValuationBuildups.currentPrice,
              impliedUpside: equityValuationAndDcfAnalysisInfo.dcfValuationBuildups.impliedUpside,
              note: equityValuationAndDcfAnalysisInfo.dcfValuationBuildups.note,
            },
          },
          valuationSensitivities: {
            create: equityValuationAndDcfAnalysisInfo.valuationSensitivityAnalysis.map((row) => ({
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

    if (financialStatementAnalysisInfo) {
      reportCreateData.financialStatementAnalyasis = {
        create: {
          keyObservations: financialStatementAnalysisInfo.incomeStatementTrend.keyObservations,
          capitalPositionAnalysis:
            financialStatementAnalysisInfo.balanceSheetStrength.capitalPositionAnalysis,
          fcfQualityAnalysis: financialStatementAnalysisInfo.cashFlowAnalysis.fcfQualityAnalysis,
          valuationObservations:
            financialStatementAnalysisInfo.financialRatiosAndCreditMetrics.valuationObservations,
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
              data: financialRatioRows.map(({ metric }) => ({
                metric,
              })),
              skipDuplicates: true,
            },
          },
        },
      };
    }

    if (businessSegmentData) {
      reportCreateData.businessSegmentData = {
        create: {
          businessModelDynamics: businessSegmentData.businessModelDynamics,
          revenueModelBreakdown: {
            createMany: {
              data: businessSegmentData.revenueModelBreakdown.map((row) => ({
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
              data: businessSegmentData.platformSegmentsPerformance.map((row) => ({
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
                  data: businessSegmentData.competitivePosition.keyCompetitors,
                  skipDuplicates: true,
                },
              },
              competitiveAdvantage: {
                createMany: {
                  data: businessSegmentData.competitivePosition.competitiveAdvantages,
                  skipDuplicates: true,
                },
              },
            },
          },
        },
      };
    }

    if (contingentLiabilitiesAndRegulatoryRisk) {
      reportCreateData.contingentLiabilitiesAndRegulatoryRisk = {
        create: {
          sectionTitle: contingentLiabilitiesAndRegulatoryRisk.sectionTitle,
          balanceSheetContingencies: {
            createMany: {
              data: contingentLiabilitiesAndRegulatoryRisk.balanceSheetContingencies,
              skipDuplicates: true,
            },
          },
          netContingentPosition: {
            create: contingentLiabilitiesAndRegulatoryRisk.netContingentPosition,
          },
          keyRegulatoryConsiderations: {
            createMany: {
              data: contingentLiabilitiesAndRegulatoryRisk.regulatoryEnvironment
                .keyRegulatoryConsiderations,
              skipDuplicates: true,
            },
          },
        },
      };
    }

    if (dcfValuationRecapAndPriceTarget) {
      reportCreateData.dcfValuationRecapAndPriceTarget = {
        create: {
          sectionTitle: dcfValuationRecapAndPriceTarget.sectionTitle,
          valuationSummaryTitle: dcfValuationRecapAndPriceTarget.valuationSummaryTitle,
          baseCaseAssumption: dcfValuationRecapAndPriceTarget.baseCaseAssumption,
          pvOfFcf: dcfValuationRecapAndPriceTarget.valuationBuildUp.pvOfFcf,
          pvOfTerminalValue: dcfValuationRecapAndPriceTarget.valuationBuildUp.pvOfTerminalValue,
          enterpriseValue: dcfValuationRecapAndPriceTarget.valuationBuildUp.enterpriseValue,
          netDebt: dcfValuationRecapAndPriceTarget.valuationBuildUp.netDebt,
          equityValue: dcfValuationRecapAndPriceTarget.valuationBuildUp.equityValue,
          sharesDiluted: dcfValuationRecapAndPriceTarget.valuationBuildUp.sharesDiluted,
          fairValuePerShare: dcfValuationRecapAndPriceTarget.valuationBuildUp.fairValuePerShare,
          currentPrice: dcfValuationRecapAndPriceTarget.valuationBuildUp.currentPrice,
          upside: dcfValuationRecapAndPriceTarget.valuationBuildUp.upside,
          recommendation: dcfValuationRecapAndPriceTarget.valuationBuildUp.recommendation,
          twelveMonthPriceTarget: dcfValuationRecapAndPriceTarget.twelveMonthPriceTarget,
          rationaleForPriceTarget: dcfValuationRecapAndPriceTarget.rationaleForPriceTarget,
          sensitivityAnalysisRecap: {
            createMany: {
              data: dcfValuationRecapAndPriceTarget.sensitivityAnalysisRecap,
              skipDuplicates: true,
            },
          },
        },
      };
    }

    if (agmAndShareholderMatters) {
      reportCreateData.agmAndShareholderMatters = {
        create: {
          sectionTitle: agmAndShareholderMatters.sectionTitle,
          announcedDate: agmAndShareholderMatters.nextAgmDetails.announcedDate,
          location: agmAndShareholderMatters.nextAgmDetails.location,
          noticeFiled: agmAndShareholderMatters.nextAgmDetails.noticeFiled,
          specialResolutionsExpected: agmAndShareholderMatters.specialResolutionsExpected,
          keyGovernanceNotes: agmAndShareholderMatters.keyGovernanceNotes,
          expectedVotingAgenda: {
            createMany: {
              data: agmAndShareholderMatters.expectedVotingAgenda,
              skipDuplicates: true,
            },
          },
        },
      };
    }

    if (forwardProjectionsAndValuation) {
      reportCreateData.forwardProjectionsAndValuation = {
        create: {
          sectionTitle: forwardProjectionsAndValuation.sectionTitle,
          keyProjectionDrivers: forwardProjectionsAndValuation.keyProjectionDrivers,
          balanceSheetDynamics: forwardProjectionsAndValuation.balanceSheetDynamics,
          keyObservations: forwardProjectionsAndValuation.keyObservations,
          creditOutlook: forwardProjectionsAndValuation.creditOutlook,
          projectedIncomeStatementRows: {
            createMany: {
              data: forwardProjectionsAndValuation.projectedIncomeStatement,
              skipDuplicates: true,
            },
          },
          projectedBalanceSheetRows: {
            createMany: {
              data: forwardProjectionsAndValuation.projectedBalanceSheet,
              skipDuplicates: true,
            },
          },
          projectedCashFlowRows: {
            createMany: {
              data: forwardProjectionsAndValuation.projectedCashFlow,
              skipDuplicates: true,
            },
          },
          creditMetricsRows: {
            createMany: {
              data: forwardProjectionsAndValuation.creditMetricsProjection,
              skipDuplicates: true,
            },
          },
        },
      };
    }

    if (conclusionAndRecommendation) {
      reportCreateData.conclusionAndRecommendation = {
        create: conclusionAndRecommendation,
      };
    }

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
          },
        },
        companyName: true,
      },
      data: {
        companyName: executiveInfo?.companyName ?? symbol,
        report: {
          create: reportCreateData,
        },
      },
    });
    company = { ...newInfo };
    console.log('DB updated');
  }
  return company;
};
