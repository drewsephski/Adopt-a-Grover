/*
  Warnings:

  - You are about to drop the `campaigns` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `claims` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `families` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `items` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('SCHOOL', 'CHURCH', 'NONPROFIT', 'BUSINESS');

-- DropForeignKey
ALTER TABLE "Gift" DROP CONSTRAINT "Gift_familyId_fkey";

-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_familyId_fkey";

-- DropForeignKey
ALTER TABLE "claims" DROP CONSTRAINT "claims_gift_id_fkey";

-- DropForeignKey
ALTER TABLE "families" DROP CONSTRAINT "families_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_family_id_fkey";

-- DropTable
DROP TABLE "campaigns";

-- DropTable
DROP TABLE "claims";

-- DropTable
DROP TABLE "families";

-- DropTable
DROP TABLE "items";

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "organizationType" "OrganizationType" NOT NULL DEFAULT 'NONPROFIT',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "dropOffDeadline" TIMESTAMP(3),
    "dropOffAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "giftId" TEXT NOT NULL,
    "donorName" TEXT NOT NULL,
    "donorEmail" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Family_campaignId_idx" ON "Family"("campaignId");

-- CreateIndex
CREATE INDEX "Claim_giftId_idx" ON "Claim"("giftId");

-- AddForeignKey
ALTER TABLE "Family" ADD CONSTRAINT "Family_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gift" ADD CONSTRAINT "Gift_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "Gift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
