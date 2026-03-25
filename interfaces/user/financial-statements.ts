export interface AnnualBalanceSheetReport {
  fiscalDateEnding: string;
  reportedCurrency: string;
  totalAssets: string;
  totalCurrentAssets: string;
  cashAndCashEquivalentsAtCarryingValue: string;
  cashAndShortTermInvestments: string;
  inventory: string;
  currentNetReceivables: string;
  totalNonCurrentAssets: string;
  propertyPlantEquipment: string;
  accumulatedDepreciationAmortizationPPE: string;
  intangibleAssets: string;
  intangibleAssetsExcludingGoodwill: string;
  goodwill: string;
  investments: string;
  longTermInvestments: string;
  shortTermInvestments: string;
  otherCurrentAssets: string;
  otherNonCurrentAssets: string;
  totalLiabilities: string;
  totalCurrentLiabilities: string;
  currentAccountsPayable: string;
  deferredRevenue: string;
  currentDebt: string;
  shortTermDebt: string;
  totalNonCurrentLiabilities: string;
  capitalLeaseObligations: string;
  longTermDebt: string;
  currentLongTermDebt: string;
  longTermDebtNoncurrent: string;
  shortLongTermDebtTotal: string;
  otherCurrentLiabilities: string;
  otherNonCurrentLiabilities: string;
  totalShareholderEquity: string;
  treasuryStock: string;
  retainedEarnings: string;
  commonStock: string;
  commonStockSharesOutstanding: string;
}

export interface BalanceSheetData {
  symbol: string;
  annualReports: AnnualBalanceSheetReport[];
}
