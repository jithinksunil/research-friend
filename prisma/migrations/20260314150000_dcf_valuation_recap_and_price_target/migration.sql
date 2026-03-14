-- CreateTable
CREATE TABLE "dcf_valuation_recap_and_price_target" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "sectionTitle" TEXT NOT NULL,
    "valuationSummaryTitle" TEXT NOT NULL,
    "baseCaseAssumption" TEXT NOT NULL,
    "pvOfFcf" TEXT NOT NULL,
    "pvOfTerminalValue" TEXT NOT NULL,
    "enterpriseValue" TEXT NOT NULL,
    "netDebt" TEXT NOT NULL,
    "equityValue" TEXT NOT NULL,
    "sharesDiluted" TEXT NOT NULL,
    "fairValuePerShare" TEXT NOT NULL,
    "currentPrice" TEXT NOT NULL,
    "upside" TEXT NOT NULL,
    "recommendation" "recommendation_type" NOT NULL,
    "twelveMonthPriceTarget" TEXT NOT NULL,
    "rationaleForPriceTarget" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dcf_valuation_recap_and_price_target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dcf_sensitivity_analysis_recap" (
    "id" SERIAL NOT NULL,
    "dcfValuationRecapAndPriceTargetId" INTEGER NOT NULL,
    "scenario" TEXT NOT NULL,
    "assumption" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dcf_sensitivity_analysis_recap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dcf_valuation_recap_and_price_target_reportId_key" ON "dcf_valuation_recap_and_price_target"("reportId");

-- AddForeignKey
ALTER TABLE "dcf_valuation_recap_and_price_target" ADD CONSTRAINT "dcf_valuation_recap_and_price_target_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcf_sensitivity_analysis_recap" ADD CONSTRAINT "dcf_sensitivity_analysis_recap_dcfValuationRecapAndPriceTar_fkey" FOREIGN KEY ("dcfValuationRecapAndPriceTargetId") REFERENCES "dcf_valuation_recap_and_price_target"("id") ON DELETE CASCADE ON UPDATE CASCADE;
