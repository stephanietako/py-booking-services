/*
  Warnings:

  - You are about to drop the column `amount` on the `Option` table. All the data in the column will be lost.
  - Added the required column `description` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `Option` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Option" DROP COLUMN "amount",
ADD COLUMN     "unitPrice" DOUBLE PRECISION NOT NULL;
