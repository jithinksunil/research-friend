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

-- CreateTable
CREATE TABLE "contingent_liabilities_and_regulatory_risk" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "sectionTitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contingent_liabilities_and_regulatory_risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_sheet_contingency" (
    "id" SERIAL NOT NULL,
    "contingentLiabilitiesAndRegulatoryRiskId" INTEGER NOT NULL,
    "item" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "balance_sheet_contingency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "net_contingent_position" (
    "id" SERIAL NOT NULL,
    "contingentLiabilitiesAndRegulatoryRiskId" INTEGER NOT NULL,
    "quantifiedAnnualLiabilities" TEXT NOT NULL,
    "oneTimeCosts" TEXT NOT NULL,
    "valuationImpact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "net_contingent_position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "key_regulatory_considerations" (
    "id" SERIAL NOT NULL,
    "contingentLiabilitiesAndRegulatoryRiskId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "key_regulatory_considerations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_prompt_template" (
    "id" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "promptKind" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_prompt_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_generation_run" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "promptTemplateVersion" INTEGER,
    "inputPayloadJson" JSONB,
    "outputPayloadJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_generation_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_enhancement_run" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "beforeText" TEXT NOT NULL,
    "afterText" TEXT,
    "userInstruction" TEXT NOT NULL,
    "promptContextJson" JSONB,
    "model" TEXT,
    "providerResponseId" TEXT,
    "citationsJson" JSONB,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_enhancement_run_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_segment_data_reportId_key" ON "business_segment_data"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitivePosition_businessSegmentDataId_key" ON "CompetitivePosition"("businessSegmentDataId");

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

-- CreateIndex
CREATE UNIQUE INDEX "contingent_liabilities_and_regulatory_risk_reportId_key" ON "contingent_liabilities_and_regulatory_risk"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "net_contingent_position_contingentLiabilitiesAndRegulatoryR_key" ON "net_contingent_position"("contingentLiabilitiesAndRegulatoryRiskId");

-- CreateIndex
CREATE INDEX "report_prompt_template_sectionKey_promptKind_isActive_idx" ON "report_prompt_template"("sectionKey", "promptKind", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "report_prompt_template_sectionKey_promptKind_version_key" ON "report_prompt_template"("sectionKey", "promptKind", "version");

-- CreateIndex
CREATE INDEX "report_generation_run_companyId_sectionKey_createdAt_idx" ON "report_generation_run"("companyId", "sectionKey", "createdAt");

-- CreateIndex
CREATE INDEX "report_enhancement_run_companyId_sectionKey_createdAt_idx" ON "report_enhancement_run"("companyId", "sectionKey", "createdAt");

-- CreateIndex
CREATE INDEX "report_enhancement_run_symbol_sectionKey_idx" ON "report_enhancement_run"("symbol", "sectionKey");

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

-- AddForeignKey
ALTER TABLE "contingent_liabilities_and_regulatory_risk" ADD CONSTRAINT "contingent_liabilities_and_regulatory_risk_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_sheet_contingency" ADD CONSTRAINT "balance_sheet_contingency_contingentLiabilitiesAndRegulato_fkey" FOREIGN KEY ("contingentLiabilitiesAndRegulatoryRiskId") REFERENCES "contingent_liabilities_and_regulatory_risk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "net_contingent_position" ADD CONSTRAINT "net_contingent_position_contingentLiabilitiesAndRegulatory_fkey" FOREIGN KEY ("contingentLiabilitiesAndRegulatoryRiskId") REFERENCES "contingent_liabilities_and_regulatory_risk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "key_regulatory_considerations" ADD CONSTRAINT "key_regulatory_considerations_contingentLiabilitiesAndRegu_fkey" FOREIGN KEY ("contingentLiabilitiesAndRegulatoryRiskId") REFERENCES "contingent_liabilities_and_regulatory_risk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_generation_run" ADD CONSTRAINT "report_generation_run_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_enhancement_run" ADD CONSTRAINT "report_enhancement_run_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
