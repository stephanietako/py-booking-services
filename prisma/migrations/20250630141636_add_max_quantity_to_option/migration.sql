/*
  Warnings:

  - You are about to drop the `AuthorizedAdmin` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "maxQuantity" INTEGER;

-- DropTable
DROP TABLE "AuthorizedAdmin";
