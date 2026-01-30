-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_symbol_key" ON "company"("symbol");
