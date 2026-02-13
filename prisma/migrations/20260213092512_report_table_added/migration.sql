/*
  Warnings:

  - You are about to drop the column `companyId` on the `executive_summary` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `overview_and_stock_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `OverviewAndStockMetricsId` on the `stock_metric` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reportId]` on the table `executive_summary` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reportId]` on the table `overview_and_stock_metrics` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reportId` to the `executive_summary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportId` to the `overview_and_stock_metrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overviewAndStockMetricsId` to the `stock_metric` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "share_holder_type" AS ENUM ('FREE_FLOAT', 'INSTITUTIONAL_HOLDINGS', 'MANAGEMENT_DIRECTORS');

-- CreateEnum
CREATE TYPE "rating_type" AS ENUM ('BUY_OR_STRONG_BUY', 'HOLD', 'SELL', 'TOTAL_ANALYSTS');

-- CreateEnum
CREATE TYPE "consensus_detail_type" AS ENUM ('AVERAGE_PRICE_TARGET', 'MEDIAN_PT', 'BULL_CASE_PT_TOP', 'BEAR_CASE_PT_BOTTOM', 'CONSENSUS_RATING');

-- CreateEnum
CREATE TYPE "key_assumption_model_name" AS ENUM ('WACC', 'TERMINAL_GROWTH_RATE', 'FORECAST_PERIOD', 'REVENUE_GROWTH');

-- CreateEnum
CREATE TYPE "financial_year" AS ENUM ('FY_2026', 'FY_2027', 'FY_2028', 'FY_2029', 'FY_2030');

-- CreateEnum
CREATE TYPE "projection_metric_type" AS ENUM ('REVENUE_GBP_M', 'REVENUE_GROWTH', 'PBT_MARGIN_PERCENT', 'PBT_GBP_M', 'TAX_RATE', 'NET_INCOME_GBP_M', 'DILUTED_SHARES_M', 'DILUTED_EPS_P');

-- DropForeignKey
ALTER TABLE "executive_summary" DROP CONSTRAINT "executive_summary_companyId_fkey";

-- DropForeignKey
ALTER TABLE "overview_and_stock_metrics" DROP CONSTRAINT "overview_and_stock_metrics_companyId_fkey";

-- DropForeignKey
ALTER TABLE "stock_metric" DROP CONSTRAINT "stock_metric_OverviewAndStockMetricsId_fkey";

-- DropIndex
DROP INDEX "executive_summary_companyId_key";

-- DropIndex
DROP INDEX "overview_and_stock_metrics_companyId_key";

-- AlterTable
ALTER TABLE "executive_summary" DROP COLUMN "companyId",
ADD COLUMN     "reportId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "overview_and_stock_metrics" DROP COLUMN "companyId",
ADD COLUMN     "reportId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "stock_metric" DROP COLUMN "OverviewAndStockMetricsId",
ADD COLUMN     "overviewAndStockMetricsId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "report" (
    "id" SERIAL NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_holder_structure" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "totalShares" TEXT,
    "shareCapitalNotes" TEXT,
    "keyInsiderObservations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "share_holder_structure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "major_shareholder" (
    "id" SERIAL NOT NULL,
    "shareHolderStructureId" INTEGER NOT NULL,
    "shareHolderType" "share_holder_type" NOT NULL,
    "ownership" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "major_shareholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyst_recommendation" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "recentAnalystViews" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analyst_recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "current_consensus" (
    "id" SERIAL NOT NULL,
    "analystRecommendationId" INTEGER NOT NULL,
    "rating" "rating_type" NOT NULL,
    "count" TEXT NOT NULL,
    "percentageOfTotal" TEXT NOT NULL,
    "trend" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "current_consensus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consensus_detail" (
    "id" SERIAL NOT NULL,
    "analystRecommendationId" INTEGER NOT NULL,
    "name" "consensus_detail_type" NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consensus_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equity_valuation_and_dcf_analysis" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "keyTakeAway" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equity_valuation_and_dcf_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "key_assumption" (
    "id" SERIAL NOT NULL,
    "equityValuationAndDcfAnalysisId" INTEGER NOT NULL,
    "modelName" "key_assumption_model_name" NOT NULL,
    "assumption" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "key_assumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projected_financial_year" (
    "id" SERIAL NOT NULL,
    "equityValuationAndDcfAnalysisId" INTEGER NOT NULL,
    "financialYear" "financial_year" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projected_financial_year_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projection_metric" (
    "id" SERIAL NOT NULL,
    "projectedFinancialYearId" INTEGER NOT NULL,
    "metric" "projection_metric_type" NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projection_metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dcf_valuation_buildup" (
    "id" SERIAL NOT NULL,
    "equityValuationAndDcfAnalysisId" INTEGER NOT NULL,
    "pvOfFCF" TEXT NOT NULL,
    "pvOfTerminalValue" TEXT NOT NULL,
    "enterpriseValue" TEXT NOT NULL,
    "netDebt" TEXT NOT NULL,
    "equityValue" TEXT NOT NULL,
    "fairValuePerShare" TEXT NOT NULL,
    "currentPrice" TEXT NOT NULL,
    "impliedUpside" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dcf_valuation_buildup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valuation_sensitivity" (
    "id" SERIAL NOT NULL,
    "equityValuationAndDcfAnalysisId" INTEGER NOT NULL,
    "wacc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "valuation_sensitivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valuation_sensitivity_value" (
    "id" SERIAL NOT NULL,
    "valuationSensitivityId" INTEGER NOT NULL,
    "terminalGrowth" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "valuation_sensitivity_value_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "report_companyId_key" ON "report"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "share_holder_structure_reportId_key" ON "share_holder_structure"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "analyst_recommendation_reportId_key" ON "analyst_recommendation"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "equity_valuation_and_dcf_analysis_reportId_key" ON "equity_valuation_and_dcf_analysis"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "key_assumption_equityValuationAndDcfAnalysisId_modelName_key" ON "key_assumption"("equityValuationAndDcfAnalysisId", "modelName");

-- CreateIndex
CREATE UNIQUE INDEX "projected_financial_year_equityValuationAndDcfAnalysisId_fi_key" ON "projected_financial_year"("equityValuationAndDcfAnalysisId", "financialYear");

-- CreateIndex
CREATE UNIQUE INDEX "projection_metric_projectedFinancialYearId_metric_key" ON "projection_metric"("projectedFinancialYearId", "metric");

-- CreateIndex
CREATE UNIQUE INDEX "dcf_valuation_buildup_equityValuationAndDcfAnalysisId_key" ON "dcf_valuation_buildup"("equityValuationAndDcfAnalysisId");

-- CreateIndex
CREATE UNIQUE INDEX "valuation_sensitivity_equityValuationAndDcfAnalysisId_wacc_key" ON "valuation_sensitivity"("equityValuationAndDcfAnalysisId", "wacc");

-- CreateIndex
CREATE UNIQUE INDEX "valuation_sensitivity_value_valuationSensitivityId_terminal_key" ON "valuation_sensitivity_value"("valuationSensitivityId", "terminalGrowth");

-- CreateIndex
CREATE UNIQUE INDEX "executive_summary_reportId_key" ON "executive_summary"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "overview_and_stock_metrics_reportId_key" ON "overview_and_stock_metrics"("reportId");

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_summary" ADD CONSTRAINT "executive_summary_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overview_and_stock_metrics" ADD CONSTRAINT "overview_and_stock_metrics_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_metric" ADD CONSTRAINT "stock_metric_overviewAndStockMetricsId_fkey" FOREIGN KEY ("overviewAndStockMetricsId") REFERENCES "overview_and_stock_metrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_holder_structure" ADD CONSTRAINT "share_holder_structure_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "major_shareholder" ADD CONSTRAINT "major_shareholder_shareHolderStructureId_fkey" FOREIGN KEY ("shareHolderStructureId") REFERENCES "share_holder_structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyst_recommendation" ADD CONSTRAINT "analyst_recommendation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "current_consensus" ADD CONSTRAINT "current_consensus_analystRecommendationId_fkey" FOREIGN KEY ("analystRecommendationId") REFERENCES "analyst_recommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consensus_detail" ADD CONSTRAINT "consensus_detail_analystRecommendationId_fkey" FOREIGN KEY ("analystRecommendationId") REFERENCES "analyst_recommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equity_valuation_and_dcf_analysis" ADD CONSTRAINT "equity_valuation_and_dcf_analysis_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "key_assumption" ADD CONSTRAINT "key_assumption_equityValuationAndDcfAnalysisId_fkey" FOREIGN KEY ("equityValuationAndDcfAnalysisId") REFERENCES "equity_valuation_and_dcf_analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projected_financial_year" ADD CONSTRAINT "projected_financial_year_equityValuationAndDcfAnalysisId_fkey" FOREIGN KEY ("equityValuationAndDcfAnalysisId") REFERENCES "equity_valuation_and_dcf_analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projection_metric" ADD CONSTRAINT "projection_metric_projectedFinancialYearId_fkey" FOREIGN KEY ("projectedFinancialYearId") REFERENCES "projected_financial_year"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcf_valuation_buildup" ADD CONSTRAINT "dcf_valuation_buildup_equityValuationAndDcfAnalysisId_fkey" FOREIGN KEY ("equityValuationAndDcfAnalysisId") REFERENCES "equity_valuation_and_dcf_analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valuation_sensitivity" ADD CONSTRAINT "valuation_sensitivity_equityValuationAndDcfAnalysisId_fkey" FOREIGN KEY ("equityValuationAndDcfAnalysisId") REFERENCES "equity_valuation_and_dcf_analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valuation_sensitivity_value" ADD CONSTRAINT "valuation_sensitivity_value_valuationSensitivityId_fkey" FOREIGN KEY ("valuationSensitivityId") REFERENCES "valuation_sensitivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
