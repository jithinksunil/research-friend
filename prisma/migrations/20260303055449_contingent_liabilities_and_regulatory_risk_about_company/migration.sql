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

-- CreateIndex
CREATE UNIQUE INDEX "contingent_liabilities_and_regulatory_risk_reportId_key" ON "contingent_liabilities_and_regulatory_risk"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "net_contingent_position_contingentLiabilitiesAndRegulatoryR_key" ON "net_contingent_position"("contingentLiabilitiesAndRegulatoryRiskId");

-- AddForeignKey
ALTER TABLE "contingent_liabilities_and_regulatory_risk" ADD CONSTRAINT "contingent_liabilities_and_regulatory_risk_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_sheet_contingency" ADD CONSTRAINT "balance_sheet_contingency_contingentLiabilitiesAndRegulato_fkey" FOREIGN KEY ("contingentLiabilitiesAndRegulatoryRiskId") REFERENCES "contingent_liabilities_and_regulatory_risk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "net_contingent_position" ADD CONSTRAINT "net_contingent_position_contingentLiabilitiesAndRegulatory_fkey" FOREIGN KEY ("contingentLiabilitiesAndRegulatoryRiskId") REFERENCES "contingent_liabilities_and_regulatory_risk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "key_regulatory_considerations" ADD CONSTRAINT "key_regulatory_considerations_contingentLiabilitiesAndRegu_fkey" FOREIGN KEY ("contingentLiabilitiesAndRegulatoryRiskId") REFERENCES "contingent_liabilities_and_regulatory_risk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
