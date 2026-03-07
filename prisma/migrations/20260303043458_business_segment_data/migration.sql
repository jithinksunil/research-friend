/*
  Warnings:

  - You are about to drop the `interium_analyst_consensus_fy1_row` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `interium_forward_guidance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `interium_record_financial_performance_row` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `interium_result_and_quaterly_performance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "interium_analyst_consensus_fy1_row" DROP CONSTRAINT "interium_analyst_consensus_fy1_row_interiumForwardGuidance_fkey";

-- DropForeignKey
ALTER TABLE "interium_forward_guidance" DROP CONSTRAINT "interium_forward_guidance_interiumResultAndQuaterlyPerform_fkey";

-- DropForeignKey
ALTER TABLE "interium_record_financial_performance_row" DROP CONSTRAINT "interium_record_financial_performance_row_interiumResultAn_fkey";

-- DropForeignKey
ALTER TABLE "interium_result_and_quaterly_performance" DROP CONSTRAINT "interium_result_and_quaterly_performance_reportId_fkey";

-- DropTable
DROP TABLE "interium_analyst_consensus_fy1_row";

-- DropTable
DROP TABLE "interium_forward_guidance";

-- DropTable
DROP TABLE "interium_record_financial_performance_row";

-- DropTable
DROP TABLE "interium_result_and_quaterly_performance";

-- DropEnum
DROP TYPE "interium_analyst_consensus_metric";

-- DropEnum
DROP TYPE "interium_performance_metric";

-- CreateTable
CREATE TABLE "business_segment_data" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessModelDynamics" TEXT[],
    "reportId" INTEGER NOT NULL,

    CONSTRAINT "business_segment_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_model_breakdown" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "revenueStream" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "percentOfTotal" TEXT NOT NULL,
    "growth" TEXT NOT NULL,
    "driver" TEXT NOT NULL,
    "businessSegmentDataId" INTEGER,

    CONSTRAINT "revenue_model_breakdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSegmentPerformance" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "segment" TEXT NOT NULL,
    "customers" TEXT NOT NULL,
    "aua" TEXT NOT NULL,
    "growth" TEXT NOT NULL,
    "netInflows" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "businessSegmentDataId" INTEGER,

    CONSTRAINT "PlatformSegmentPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitivePosition" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessSegmentDataId" INTEGER NOT NULL,

    CONSTRAINT "CompetitivePosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyCompetitor" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "competitivePositionId" INTEGER,

    CONSTRAINT "KeyCompetitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitiveAdvantage" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "competitivePositionId" INTEGER,

    CONSTRAINT "CompetitiveAdvantage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_segment_data_reportId_key" ON "business_segment_data"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitivePosition_businessSegmentDataId_key" ON "CompetitivePosition"("businessSegmentDataId");

-- AddForeignKey
ALTER TABLE "business_segment_data" ADD CONSTRAINT "business_segment_data_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_model_breakdown" ADD CONSTRAINT "revenue_model_breakdown_businessSegmentDataId_fkey" FOREIGN KEY ("businessSegmentDataId") REFERENCES "business_segment_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformSegmentPerformance" ADD CONSTRAINT "PlatformSegmentPerformance_businessSegmentDataId_fkey" FOREIGN KEY ("businessSegmentDataId") REFERENCES "business_segment_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitivePosition" ADD CONSTRAINT "CompetitivePosition_businessSegmentDataId_fkey" FOREIGN KEY ("businessSegmentDataId") REFERENCES "business_segment_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyCompetitor" ADD CONSTRAINT "KeyCompetitor_competitivePositionId_fkey" FOREIGN KEY ("competitivePositionId") REFERENCES "CompetitivePosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitiveAdvantage" ADD CONSTRAINT "CompetitiveAdvantage_competitivePositionId_fkey" FOREIGN KEY ("competitivePositionId") REFERENCES "CompetitivePosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
