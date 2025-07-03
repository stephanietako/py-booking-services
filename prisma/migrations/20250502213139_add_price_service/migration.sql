/*
  Warnings:

  - Added the required column `price` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;
