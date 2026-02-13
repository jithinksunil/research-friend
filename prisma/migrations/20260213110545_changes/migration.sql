/*
  Warnings:

  - Changed the type of `metric` on the `financial_ratio_metric_row` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "financial_ratio_metric" AS ENUM ('P_E_RATIO', 'PEG_RATIO', 'EV_REVENUE', 'EV_EBITDA', 'DEBT_EQUITY', 'INTEREST_COVERAGE', 'CURRENT_RATIO', 'ROE', 'ROIC');

-- AlterTable
ALTER TABLE "financial_ratio_metric_row" DROP COLUMN "metric",
ADD COLUMN     "metric" "financial_ratio_metric" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "financial_ratio_metric_row_financialStatementAnalyasisId_me_key" ON "financial_ratio_metric_row"("financialStatementAnalyasisId", "metric");
