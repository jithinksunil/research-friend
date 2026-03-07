-- CreateEnum
CREATE TYPE "interium_performance_metric" AS ENUM ('REVENUE', 'PBT', 'NET_INCOME', 'DILUTED_EPS', 'OPERATING_CF', 'FCF');

-- CreateEnum
CREATE TYPE "interium_analyst_consensus_metric" AS ENUM ('REVENUE', 'PBT', 'EPS', 'DIVIDEND');

-- CreateTable
CREATE TABLE "interium_result_and_quaterly_performance" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "title" TEXT,
    "keyPositives" TEXT[],
    "keyNegatives" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interium_result_and_quaterly_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interium_record_financial_performance_row" (
    "id" SERIAL NOT NULL,
    "interiumResultAndQuaterlyPerformanceId" INTEGER NOT NULL,
    "metric" "interium_performance_metric" NOT NULL,
    "currentYearValue" TEXT NOT NULL,
    "previousYearValue" TEXT NOT NULL,
    "change" TEXT NOT NULL,
    "margin" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interium_record_financial_performance_row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interium_forward_guidance" (
    "id" SERIAL NOT NULL,
    "interiumResultAndQuaterlyPerformanceId" INTEGER NOT NULL,
    "ceoName" TEXT,
    "quotes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interium_forward_guidance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interium_analyst_consensus_fy1_row" (
    "id" SERIAL NOT NULL,
    "interiumForwardGuidanceId" INTEGER NOT NULL,
    "metric" "interium_analyst_consensus_metric" NOT NULL,
    "forecastValue" TEXT NOT NULL,
    "growth" TEXT NOT NULL,
    "commentary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interium_analyst_consensus_fy1_row_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interium_result_and_quaterly_performance_reportId_key" ON "interium_result_and_quaterly_performance"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "interium_record_financial_performance_row_interiumResultAnd_key" ON "interium_record_financial_performance_row"("interiumResultAndQuaterlyPerformanceId", "metric");

-- CreateIndex
CREATE UNIQUE INDEX "interium_forward_guidance_interiumResultAndQuaterlyPerforma_key" ON "interium_forward_guidance"("interiumResultAndQuaterlyPerformanceId");

-- CreateIndex
CREATE UNIQUE INDEX "interium_analyst_consensus_fy1_row_interiumForwardGuidanceI_key" ON "interium_analyst_consensus_fy1_row"("interiumForwardGuidanceId", "metric");

-- AddForeignKey
ALTER TABLE "interium_result_and_quaterly_performance" ADD CONSTRAINT "interium_result_and_quaterly_performance_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interium_record_financial_performance_row" ADD CONSTRAINT "interium_record_financial_performance_row_interiumResultAn_fkey" FOREIGN KEY ("interiumResultAndQuaterlyPerformanceId") REFERENCES "interium_result_and_quaterly_performance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interium_forward_guidance" ADD CONSTRAINT "interium_forward_guidance_interiumResultAndQuaterlyPerform_fkey" FOREIGN KEY ("interiumResultAndQuaterlyPerformanceId") REFERENCES "interium_result_and_quaterly_performance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interium_analyst_consensus_fy1_row" ADD CONSTRAINT "interium_analyst_consensus_fy1_row_interiumForwardGuidance_fkey" FOREIGN KEY ("interiumForwardGuidanceId") REFERENCES "interium_forward_guidance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
