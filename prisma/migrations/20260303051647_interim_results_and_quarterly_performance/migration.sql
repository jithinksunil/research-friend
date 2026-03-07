-- CreateTable
CREATE TABLE "interim_results_and_quarterly_performance" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "keyPositives" TEXT[],
    "keyNegatives" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interim_results_and_quarterly_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_financial_performance" (
    "id" SERIAL NOT NULL,
    "interimResultsAndQuarterlyPerformanceId" INTEGER NOT NULL,
    "metric" TEXT NOT NULL,
    "currentYearValue" TEXT NOT NULL,
    "previousYearValue" TEXT NOT NULL,
    "change" TEXT NOT NULL,
    "margin" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_financial_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forward_guidance" (
    "id" SERIAL NOT NULL,
    "interimResultsAndQuarterlyPerformanceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forward_guidance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_commentary" (
    "id" SERIAL NOT NULL,
    "forwardGuidanceId" INTEGER NOT NULL,
    "ceoName" TEXT NOT NULL,
    "quotes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "management_commentary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyst_consensus_fy1" (
    "id" SERIAL NOT NULL,
    "forwardGuidanceId" INTEGER NOT NULL,
    "metric" TEXT NOT NULL,
    "forecastValue" TEXT NOT NULL,
    "growth" TEXT NOT NULL,
    "commentary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analyst_consensus_fy1_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interim_results_and_quarterly_performance_reportId_key" ON "interim_results_and_quarterly_performance"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "record_financial_performance_interimResultsAndQuarterlyPerf_key" ON "record_financial_performance"("interimResultsAndQuarterlyPerformanceId", "metric");

-- CreateIndex
CREATE UNIQUE INDEX "forward_guidance_interimResultsAndQuarterlyPerformanceId_key" ON "forward_guidance"("interimResultsAndQuarterlyPerformanceId");

-- CreateIndex
CREATE UNIQUE INDEX "management_commentary_forwardGuidanceId_key" ON "management_commentary"("forwardGuidanceId");

-- CreateIndex
CREATE UNIQUE INDEX "analyst_consensus_fy1_forwardGuidanceId_metric_key" ON "analyst_consensus_fy1"("forwardGuidanceId", "metric");

-- AddForeignKey
ALTER TABLE "interim_results_and_quarterly_performance" ADD CONSTRAINT "interim_results_and_quarterly_performance_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_financial_performance" ADD CONSTRAINT "record_financial_performance_interimResultsAndQuarterlyPer_fkey" FOREIGN KEY ("interimResultsAndQuarterlyPerformanceId") REFERENCES "interim_results_and_quarterly_performance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forward_guidance" ADD CONSTRAINT "forward_guidance_interimResultsAndQuarterlyPerformanceId_fkey" FOREIGN KEY ("interimResultsAndQuarterlyPerformanceId") REFERENCES "interim_results_and_quarterly_performance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_commentary" ADD CONSTRAINT "management_commentary_forwardGuidanceId_fkey" FOREIGN KEY ("forwardGuidanceId") REFERENCES "forward_guidance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyst_consensus_fy1" ADD CONSTRAINT "analyst_consensus_fy1_forwardGuidanceId_fkey" FOREIGN KEY ("forwardGuidanceId") REFERENCES "forward_guidance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
