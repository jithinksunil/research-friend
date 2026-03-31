-- DropForeignKey
ALTER TABLE "CompetitiveAdvantage" DROP CONSTRAINT "CompetitiveAdvantage_competitivePositionId_fkey";

-- DropForeignKey
ALTER TABLE "CompetitivePosition" DROP CONSTRAINT "CompetitivePosition_businessSegmentDataId_fkey";

-- DropForeignKey
ALTER TABLE "KeyCompetitor" DROP CONSTRAINT "KeyCompetitor_competitivePositionId_fkey";

-- DropForeignKey
ALTER TABLE "PlatformSegmentPerformance" DROP CONSTRAINT "PlatformSegmentPerformance_businessSegmentDataId_fkey";

-- DropForeignKey
ALTER TABLE "agm_and_shareholder_matters" DROP CONSTRAINT "agm_and_shareholder_matters_reportId_fkey";

-- DropForeignKey
ALTER TABLE "analyst_recommendation" DROP CONSTRAINT "analyst_recommendation_reportId_fkey";

-- DropForeignKey
ALTER TABLE "business_segment_data" DROP CONSTRAINT "business_segment_data_reportId_fkey";

-- DropForeignKey
ALTER TABLE "conclusion_and_recommendation" DROP CONSTRAINT "conclusion_and_recommendation_reportId_fkey";

-- DropForeignKey
ALTER TABLE "contingent_liabilities_and_regulatory_risk" DROP CONSTRAINT "contingent_liabilities_and_regulatory_risk_reportId_fkey";

-- DropForeignKey
ALTER TABLE "dcf_valuation_recap_and_price_target" DROP CONSTRAINT "dcf_valuation_recap_and_price_target_reportId_fkey";

-- DropForeignKey
ALTER TABLE "equity_valuation_and_dcf_analysis" DROP CONSTRAINT "equity_valuation_and_dcf_analysis_reportId_fkey";

-- DropForeignKey
ALTER TABLE "executive_summary" DROP CONSTRAINT "executive_summary_reportId_fkey";

-- DropForeignKey
ALTER TABLE "financial_statement_analysis" DROP CONSTRAINT "financial_statement_analysis_reportId_fkey";

-- DropForeignKey
ALTER TABLE "forward_projections_and_valuation" DROP CONSTRAINT "forward_projections_and_valuation_reportId_fkey";

-- DropForeignKey
ALTER TABLE "interim_results_and_quarterly_performance" DROP CONSTRAINT "interim_results_and_quarterly_performance_reportId_fkey";

-- DropForeignKey
ALTER TABLE "overview_and_stock_metrics" DROP CONSTRAINT "overview_and_stock_metrics_reportId_fkey";

-- DropForeignKey
ALTER TABLE "revenue_model_breakdown" DROP CONSTRAINT "revenue_model_breakdown_businessSegmentDataId_fkey";

-- DropForeignKey
ALTER TABLE "share_holder_structure" DROP CONSTRAINT "share_holder_structure_reportId_fkey";

-- DropForeignKey
ALTER TABLE "stock_metric" DROP CONSTRAINT "stock_metric_overviewAndStockMetricsId_fkey";

-- AddForeignKey
ALTER TABLE "executive_summary" ADD CONSTRAINT "executive_summary_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overview_and_stock_metrics" ADD CONSTRAINT "overview_and_stock_metrics_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_metric" ADD CONSTRAINT "stock_metric_overviewAndStockMetricsId_fkey" FOREIGN KEY ("overviewAndStockMetricsId") REFERENCES "overview_and_stock_metrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_holder_structure" ADD CONSTRAINT "share_holder_structure_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyst_recommendation" ADD CONSTRAINT "analyst_recommendation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equity_valuation_and_dcf_analysis" ADD CONSTRAINT "equity_valuation_and_dcf_analysis_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_statement_analysis" ADD CONSTRAINT "financial_statement_analysis_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_segment_data" ADD CONSTRAINT "business_segment_data_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_model_breakdown" ADD CONSTRAINT "revenue_model_breakdown_businessSegmentDataId_fkey" FOREIGN KEY ("businessSegmentDataId") REFERENCES "business_segment_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformSegmentPerformance" ADD CONSTRAINT "PlatformSegmentPerformance_businessSegmentDataId_fkey" FOREIGN KEY ("businessSegmentDataId") REFERENCES "business_segment_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitivePosition" ADD CONSTRAINT "CompetitivePosition_businessSegmentDataId_fkey" FOREIGN KEY ("businessSegmentDataId") REFERENCES "business_segment_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyCompetitor" ADD CONSTRAINT "KeyCompetitor_competitivePositionId_fkey" FOREIGN KEY ("competitivePositionId") REFERENCES "CompetitivePosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitiveAdvantage" ADD CONSTRAINT "CompetitiveAdvantage_competitivePositionId_fkey" FOREIGN KEY ("competitivePositionId") REFERENCES "CompetitivePosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interim_results_and_quarterly_performance" ADD CONSTRAINT "interim_results_and_quarterly_performance_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contingent_liabilities_and_regulatory_risk" ADD CONSTRAINT "contingent_liabilities_and_regulatory_risk_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcf_valuation_recap_and_price_target" ADD CONSTRAINT "dcf_valuation_recap_and_price_target_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agm_and_shareholder_matters" ADD CONSTRAINT "agm_and_shareholder_matters_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forward_projections_and_valuation" ADD CONSTRAINT "forward_projections_and_valuation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conclusion_and_recommendation" ADD CONSTRAINT "conclusion_and_recommendation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
