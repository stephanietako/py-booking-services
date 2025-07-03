/*
  Warnings:

  - Added the required column `amount` to the `BookingOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Option` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BookingOption" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL;
