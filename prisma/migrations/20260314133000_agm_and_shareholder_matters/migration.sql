-- CreateTable
CREATE TABLE "agm_and_shareholder_matters" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "sectionTitle" TEXT NOT NULL,
    "announcedDate" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "noticeFiled" TEXT NOT NULL,
    "specialResolutionsExpected" TEXT[],
    "keyGovernanceNotes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agm_and_shareholder_matters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expected_voting_agenda" (
    "id" SERIAL NOT NULL,
    "agmAndShareholderMattersId" INTEGER NOT NULL,
    "resolutionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expectedResult" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expected_voting_agenda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agm_and_shareholder_matters_reportId_key" ON "agm_and_shareholder_matters"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "expected_voting_agenda_agmAndShareholderMattersId_resolutionN_key" ON "expected_voting_agenda"("agmAndShareholderMattersId", "resolutionNumber");

-- AddForeignKey
ALTER TABLE "agm_and_shareholder_matters" ADD CONSTRAINT "agm_and_shareholder_matters_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expected_voting_agenda" ADD CONSTRAINT "expected_voting_agenda_agmAndShareholderMattersId_fkey" FOREIGN KEY ("agmAndShareholderMattersId") REFERENCES "agm_and_shareholder_matters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
