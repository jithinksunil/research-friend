-- CreateEnum
CREATE TYPE "financial_statement_year" AS ENUM ('FY20', 'FY21', 'FY22', 'FY23', 'FY24', 'FY25', 'FY25_EST');

-- CreateEnum
CREATE TYPE "financial_ratio_metric" AS ENUM ('P_PER_E_RATIO', 'PEG_RATIO', 'EV_PER_REVENUE', 'EV_PER_EBITDA', 'DEBT_PER_EQUITY', 'INTEREST_COVERAGE', 'CURRENT_RATIO', 'ROE', 'ROIC');

-- CreateTable
CREATE TABLE "financial_statement_analysis" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "keyObservations" TEXT[],
    "capitalPositionAnalysis" TEXT[],
    "fcfQualityAnalysis" TEXT[],
    "valuationObservations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_statement_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "income_statement_trend_row" (
    "id" SERIAL NOT NULL,
    "financialStatementAnalyasisId" INTEGER NOT NULL,
    "fiscalYear" "financial_statement_year" NOT NULL,
    "revenue" TEXT NOT NULL,
    "yoyGrowth" TEXT NOT NULL,
    "operatingIncome" TEXT NOT NULL,
    "netIncome" TEXT NOT NULL,
    "eps" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "income_statement_trend_row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_sheet_strength_row" (
    "id" SERIAL NOT NULL,
    "financialStatementAnalyasisId" INTEGER NOT NULL,
    "fiscalYear" "financial_statement_year" NOT NULL,
    "cash" TEXT NOT NULL,
    "totalAssets" TEXT NOT NULL,
    "totalDebt" TEXT NOT NULL,
    "shareholdersEquity" TEXT NOT NULL,
    "debtToEquity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "balance_sheet_strength_row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_flow_analysis_row" (
    "id" SERIAL NOT NULL,
    "financialStatementAnalyasisId" INTEGER NOT NULL,
    "fiscalYear" "financial_statement_year" NOT NULL,
    "operatingCF" TEXT NOT NULL,
    "capex" TEXT NOT NULL,
    "freeCF" TEXT NOT NULL,
    "fcfMargin" TEXT NOT NULL,
    "dividendsPaid" TEXT NOT NULL,
    "shareBuyback" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_flow_analysis_row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_ratio_metric_row" (
    "id" SERIAL NOT NULL,
    "financialStatementAnalyasisId" INTEGER NOT NULL,
    "metric" "financial_ratio_metric" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_ratio_metric_row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_ratio_value" (
    "id" SERIAL NOT NULL,
    "financialRatioMetricRowId" INTEGER NOT NULL,
    "year" "financial_statement_year" NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_ratio_value_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "financial_statement_analysis_reportId_key" ON "financial_statement_analysis"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "income_statement_trend_row_financialStatementAnalyasisId_fi_key" ON "income_statement_trend_row"("financialStatementAnalyasisId", "fiscalYear");

-- CreateIndex
CREATE UNIQUE INDEX "balance_sheet_strength_row_financialStatementAnalyasisId_fi_key" ON "balance_sheet_strength_row"("financialStatementAnalyasisId", "fiscalYear");

-- CreateIndex
CREATE UNIQUE INDEX "cash_flow_analysis_row_financialStatementAnalyasisId_fiscal_key" ON "cash_flow_analysis_row"("financialStatementAnalyasisId", "fiscalYear");

-- CreateIndex
CREATE UNIQUE INDEX "financial_ratio_metric_row_financialStatementAnalyasisId_me_key" ON "financial_ratio_metric_row"("financialStatementAnalyasisId", "metric");

-- CreateIndex
CREATE UNIQUE INDEX "financial_ratio_value_financialRatioMetricRowId_year_key" ON "financial_ratio_value"("financialRatioMetricRowId", "year");

-- AddForeignKey
ALTER TABLE "financial_statement_analysis" ADD CONSTRAINT "financial_statement_analysis_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "income_statement_trend_row" ADD CONSTRAINT "income_statement_trend_row_financialStatementAnalyasisId_fkey" FOREIGN KEY ("financialStatementAnalyasisId") REFERENCES "financial_statement_analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_sheet_strength_row" ADD CONSTRAINT "balance_sheet_strength_row_financialStatementAnalyasisId_fkey" FOREIGN KEY ("financialStatementAnalyasisId") REFERENCES "financial_statement_analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_flow_analysis_row" ADD CONSTRAINT "cash_flow_analysis_row_financialStatementAnalyasisId_fkey" FOREIGN KEY ("financialStatementAnalyasisId") REFERENCES "financial_statement_analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_ratio_metric_row" ADD CONSTRAINT "financial_ratio_metric_row_financialStatementAnalyasisId_fkey" FOREIGN KEY ("financialStatementAnalyasisId") REFERENCES "financial_statement_analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_ratio_value" ADD CONSTRAINT "financial_ratio_value_financialRatioMetricRowId_fkey" FOREIGN KEY ("financialRatioMetricRowId") REFERENCES "financial_ratio_metric_row"("id") ON DELETE CASCADE ON UPDATE CASCADE;
