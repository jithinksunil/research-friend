-- CreateTable
CREATE TABLE "executive_summary" (
    "id" SERIAL NOT NULL,
    "companyId" TEXT NOT NULL,
    "summary" TEXT,
    "positive" TEXT,
    "risk" TEXT,
    "currentPrice" TEXT,
    "dcfFairValue" TEXT,
    "analystConsensus" TEXT,
    "upside" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executive_summary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "executive_summary_companyId_key" ON "executive_summary"("companyId");

-- AddForeignKey
ALTER TABLE "executive_summary" ADD CONSTRAINT "executive_summary_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
