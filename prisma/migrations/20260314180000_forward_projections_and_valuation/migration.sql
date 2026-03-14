-- CreateTable
CREATE TABLE "forward_projections_and_valuation" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "sectionTitle" TEXT NOT NULL,
    "keyProjectionDrivers" TEXT[],
    "balanceSheetDynamics" TEXT[],
    "keyObservations" TEXT[],
    "creditOutlook" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forward_projections_and_valuation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forward_income_statement_row" (
    "id" SERIAL NOT NULL,
    "forwardProjectionsAndValuationId" INTEGER NOT NULL,
    "metric" TEXT NOT NULL,
    "fy26e" TEXT NOT NULL,
    "fy27e" TEXT NOT NULL,
    "fy28e" TEXT NOT NULL,
    "fy29e" TEXT NOT NULL,
    "fy30e" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forward_income_statement_row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forward_balance_sheet_row" (
    "id" SERIAL NOT NULL,
    "forwardProjectionsAndValuationId" INTEGER NOT NULL,
    "item" TEXT NOT NULL,
    "fy25a" TEXT NOT NULL,
    "fy26e" TEXT NOT NULL,
    "fy27e" TEXT NOT NULL,
    "fy28e" TEXT NOT NULL,
    "fy29e" TEXT NOT NULL,
    "fy30e" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forward_balance_sheet_row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forward_cash_flow_row" (
    "id" SERIAL NOT NULL,
    "forwardProjectionsAndValuationId" INTEGER NOT NULL,
    "metric" TEXT NOT NULL,
    "fy26e" TEXT NOT NULL,
    "fy27e" TEXT NOT NULL,
    "fy28e" TEXT NOT NULL,
    "fy29e" TEXT NOT NULL,
    "fy30e" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forward_cash_flow_row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forward_credit_metric_row" (
    "id" SERIAL NOT NULL,
    "forwardProjectionsAndValuationId" INTEGER NOT NULL,
    "metric" TEXT NOT NULL,
    "fy26e" TEXT NOT NULL,
    "fy27e" TEXT NOT NULL,
    "fy28e" TEXT NOT NULL,
    "fy29e" TEXT NOT NULL,
    "fy30e" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forward_credit_metric_row_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forward_projections_and_valuation_reportId_key" ON "forward_projections_and_valuation"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "forward_income_statement_row_forwardProjectionsAndValuationId_metric_key" ON "forward_income_statement_row"("forwardProjectionsAndValuationId", "metric");

-- CreateIndex
CREATE UNIQUE INDEX "forward_balance_sheet_row_forwardProjectionsAndValuationId_item_key" ON "forward_balance_sheet_row"("forwardProjectionsAndValuationId", "item");

-- CreateIndex
CREATE UNIQUE INDEX "forward_cash_flow_row_forwardProjectionsAndValuationId_metric_key" ON "forward_cash_flow_row"("forwardProjectionsAndValuationId", "metric");

-- CreateIndex
CREATE UNIQUE INDEX "forward_credit_metric_row_forwardProjectionsAndValuationId_metric_key" ON "forward_credit_metric_row"("forwardProjectionsAndValuationId", "metric");

-- AddForeignKey
ALTER TABLE "forward_projections_and_valuation" ADD CONSTRAINT "forward_projections_and_valuation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forward_income_statement_row" ADD CONSTRAINT "forward_income_statement_row_forwardProjectionsAndValuationId_fkey" FOREIGN KEY ("forwardProjectionsAndValuationId") REFERENCES "forward_projections_and_valuation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forward_balance_sheet_row" ADD CONSTRAINT "forward_balance_sheet_row_forwardProjectionsAndValuationId_fkey" FOREIGN KEY ("forwardProjectionsAndValuationId") REFERENCES "forward_projections_and_valuation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forward_cash_flow_row" ADD CONSTRAINT "forward_cash_flow_row_forwardProjectionsAndValuationId_fkey" FOREIGN KEY ("forwardProjectionsAndValuationId") REFERENCES "forward_projections_and_valuation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forward_credit_metric_row" ADD CONSTRAINT "forward_credit_metric_row_forwardProjectionsAndValuationId_fkey" FOREIGN KEY ("forwardProjectionsAndValuationId") REFERENCES "forward_projections_and_valuation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
