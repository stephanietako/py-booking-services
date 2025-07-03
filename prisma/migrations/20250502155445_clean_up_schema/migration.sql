/*
  Warnings:

  - You are about to drop the column `amount` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `reservedAt` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "amount",
DROP COLUMN "endTime",
DROP COLUMN "price",
DROP COLUMN "reservedAt",
DROP COLUMN "startTime";
