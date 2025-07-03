/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Option` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Option" DROP CONSTRAINT "Option_serviceId_fkey";

-- AlterTable
ALTER TABLE "Option" DROP COLUMN "serviceId";

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "cautionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
