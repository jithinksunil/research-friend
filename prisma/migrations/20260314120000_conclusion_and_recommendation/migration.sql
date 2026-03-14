-- CreateEnum
CREATE TYPE "recommendation_type" AS ENUM ('BUY', 'HOLD', 'SELL');

-- CreateTable
CREATE TABLE "conclusion_and_recommendation" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "sectionTitle" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "strengths" TEXT[],
    "valuationSummary" TEXT NOT NULL,
    "analystConsensus" TEXT NOT NULL,
    "investorFit" TEXT[],
    "entryStrategy" TEXT[],
    "upsideCatalysts" TEXT[],
    "downsideCatalysts" TEXT[],
    "recommendation" "recommendation_type" NOT NULL,
    "priceTarget" TEXT NOT NULL,
    "expectedReturn" TEXT NOT NULL,
    "timeHorizon" TEXT NOT NULL,
    "riskProfile" TEXT NOT NULL,
    "disclaimer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conclusion_and_recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conclusion_and_recommendation_reportId_key" ON "conclusion_and_recommendation"("reportId");

-- AddForeignKey
ALTER TABLE "conclusion_and_recommendation" ADD CONSTRAINT "conclusion_and_recommendation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
