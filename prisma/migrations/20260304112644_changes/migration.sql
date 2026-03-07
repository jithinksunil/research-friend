/*
  Warnings:

  - You are about to drop the `CompetitiveAdvantage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompetitivePosition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KeyCompetitor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlatformSegmentPerformance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `analyst_consensus_fy1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `balance_sheet_contingency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `business_segment_data` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contingent_liabilities_and_regulatory_risk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `forward_guidance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `interim_results_and_quarterly_performance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `key_regulatory_considerations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `management_commentary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `net_contingent_position` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `record_financial_performance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `report_enhancement_run` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `report_generation_run` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `report_prompt_template` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `revenue_model_breakdown` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CompetitiveAdvantage" DROP CONSTRAINT "CompetitiveAdvantage_competitivePositionId_fkey";

-- DropForeignKey
ALTER TABLE "CompetitivePosition" DROP CONSTRAINT "CompetitivePosition_businessSegmentDataId_fkey";

-- DropForeignKey
ALTER TABLE "KeyCompetitor" DROP CONSTRAINT "KeyCompetitor_competitivePositionId_fkey";

-- DropForeignKey
ALTER TABLE "PlatformSegmentPerformance" DROP CONSTRAINT "PlatformSegmentPerformance_businessSegmentDataId_fkey";

-- DropForeignKey
ALTER TABLE "analyst_consensus_fy1" DROP CONSTRAINT "analyst_consensus_fy1_forwardGuidanceId_fkey";

-- DropForeignKey
ALTER TABLE "balance_sheet_contingency" DROP CONSTRAINT "balance_sheet_contingency_contingentLiabilitiesAndRegulato_fkey";

-- DropForeignKey
ALTER TABLE "business_segment_data" DROP CONSTRAINT "business_segment_data_reportId_fkey";

-- DropForeignKey
ALTER TABLE "contingent_liabilities_and_regulatory_risk" DROP CONSTRAINT "contingent_liabilities_and_regulatory_risk_reportId_fkey";

-- DropForeignKey
ALTER TABLE "forward_guidance" DROP CONSTRAINT "forward_guidance_interimResultsAndQuarterlyPerformanceId_fkey";

-- DropForeignKey
ALTER TABLE "interim_results_and_quarterly_performance" DROP CONSTRAINT "interim_results_and_quarterly_performance_reportId_fkey";

-- DropForeignKey
ALTER TABLE "key_regulatory_considerations" DROP CONSTRAINT "key_regulatory_considerations_contingentLiabilitiesAndRegu_fkey";

-- DropForeignKey
ALTER TABLE "management_commentary" DROP CONSTRAINT "management_commentary_forwardGuidanceId_fkey";

-- DropForeignKey
ALTER TABLE "net_contingent_position" DROP CONSTRAINT "net_contingent_position_contingentLiabilitiesAndRegulatory_fkey";

-- DropForeignKey
ALTER TABLE "record_financial_performance" DROP CONSTRAINT "record_financial_performance_interimResultsAndQuarterlyPer_fkey";

-- DropForeignKey
ALTER TABLE "report_enhancement_run" DROP CONSTRAINT "report_enhancement_run_companyId_fkey";

-- DropForeignKey
ALTER TABLE "report_generation_run" DROP CONSTRAINT "report_generation_run_companyId_fkey";

-- DropForeignKey
ALTER TABLE "revenue_model_breakdown" DROP CONSTRAINT "revenue_model_breakdown_businessSegmentDataId_fkey";

-- DropTable
DROP TABLE "CompetitiveAdvantage";

-- DropTable
DROP TABLE "CompetitivePosition";

-- DropTable
DROP TABLE "KeyCompetitor";

-- DropTable
DROP TABLE "PlatformSegmentPerformance";

-- DropTable
DROP TABLE "analyst_consensus_fy1";

-- DropTable
DROP TABLE "balance_sheet_contingency";

-- DropTable
DROP TABLE "business_segment_data";

-- DropTable
DROP TABLE "contingent_liabilities_and_regulatory_risk";

-- DropTable
DROP TABLE "forward_guidance";

-- DropTable
DROP TABLE "interim_results_and_quarterly_performance";

-- DropTable
DROP TABLE "key_regulatory_considerations";

-- DropTable
DROP TABLE "management_commentary";

-- DropTable
DROP TABLE "net_contingent_position";

-- DropTable
DROP TABLE "record_financial_performance";

-- DropTable
DROP TABLE "report_enhancement_run";

-- DropTable
DROP TABLE "report_generation_run";

-- DropTable
DROP TABLE "report_prompt_template";

-- DropTable
DROP TABLE "revenue_model_breakdown";
