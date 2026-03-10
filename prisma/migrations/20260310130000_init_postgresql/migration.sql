-- CreateTable
CREATE TABLE "SearchRun" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalFound" INTEGER NOT NULL,

    CONSTRAINT "SearchRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "searchRunId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "rating" DOUBLE PRECISION,
    "reviewsCount" INTEGER,
    "photosCount" INTEGER,
    "hasPhotos" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "openingHoursJson" TEXT,
    "googleMapsUrl" TEXT,
    "opportunityScore" INTEGER NOT NULL,
    "quickAuditJson" TEXT NOT NULL,
    "observations" TEXT,
    "contactStatus" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "reviewRangeMin" INTEGER NOT NULL DEFAULT 5,
    "reviewRangeMax" INTEGER NOT NULL DEFAULT 10,
    "reviewRangeScore" INTEGER NOT NULL DEFAULT 30,
    "missingWebsiteScore" INTEGER NOT NULL DEFAULT 20,
    "lowPhotosThreshold" INTEGER NOT NULL DEFAULT 3,
    "lowPhotosScore" INTEGER NOT NULL DEFAULT 20,
    "ratingMin" DOUBLE PRECISION NOT NULL DEFAULT 4.0,
    "ratingMax" DOUBLE PRECISION NOT NULL DEFAULT 4.7,
    "ratingRangeScore" INTEGER NOT NULL DEFAULT 10,
    "genericCategoryScore" INTEGER NOT NULL DEFAULT 10,
    "incompleteInfoScore" INTEGER NOT NULL DEFAULT 10,
    "minInterestingScore" INTEGER NOT NULL DEFAULT 40,

    CONSTRAINT "ScoringConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Company_searchRunId_idx" ON "Company"("searchRunId");

-- CreateIndex
CREATE INDEX "Company_placeId_idx" ON "Company"("placeId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_searchRunId_fkey" FOREIGN KEY ("searchRunId") REFERENCES "SearchRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
