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
CREATE UNIQUE INDEX "report_prompt_template_sectionKey_promptKind_version_key" ON "report_prompt_template"("sectionKey", "promptKind", "version");

-- CreateIndex
CREATE INDEX "report_prompt_template_sectionKey_promptKind_isActive_idx" ON "report_prompt_template"("sectionKey", "promptKind", "isActive");

-- CreateIndex
CREATE INDEX "report_generation_run_companyId_sectionKey_createdAt_idx" ON "report_generation_run"("companyId", "sectionKey", "createdAt");

-- CreateIndex
CREATE INDEX "report_enhancement_run_companyId_sectionKey_createdAt_idx" ON "report_enhancement_run"("companyId", "sectionKey", "createdAt");

-- CreateIndex
CREATE INDEX "report_enhancement_run_symbol_sectionKey_idx" ON "report_enhancement_run"("symbol", "sectionKey");

-- AddForeignKey
ALTER TABLE "report_generation_run" ADD CONSTRAINT "report_generation_run_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_enhancement_run" ADD CONSTRAINT "report_enhancement_run_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
