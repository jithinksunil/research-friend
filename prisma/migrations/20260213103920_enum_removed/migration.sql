/*
  Warnings:

  - Changed the type of `metric` on the `financial_ratio_metric_row` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "financial_ratio_metric_row" DROP COLUMN "metric",
ADD COLUMN     "metric" TEXT NOT NULL;

-- DropEnum
DROP TYPE "financial_ratio_metric";

-- CreateIndex
CREATE UNIQUE INDEX "financial_ratio_metric_row_financialStatementAnalyasisId_me_key" ON "financial_ratio_metric_row"("financialStatementAnalyasisId", "metric");
