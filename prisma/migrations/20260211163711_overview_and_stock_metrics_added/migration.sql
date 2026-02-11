-- CreateTable
CREATE TABLE "overview_and_stock_metrics" (
    "id" SERIAL NOT NULL,
    "companyId" TEXT NOT NULL,
    "fiftyTwoWeekPerformance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "overview_and_stock_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_metric" (
    "id" SERIAL NOT NULL,
    "OverviewAndStockMetricsId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_metric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "overview_and_stock_metrics_companyId_key" ON "overview_and_stock_metrics"("companyId");

-- AddForeignKey
ALTER TABLE "overview_and_stock_metrics" ADD CONSTRAINT "overview_and_stock_metrics_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_metric" ADD CONSTRAINT "stock_metric_OverviewAndStockMetricsId_fkey" FOREIGN KEY ("OverviewAndStockMetricsId") REFERENCES "overview_and_stock_metrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
