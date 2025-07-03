/*
  Warnings:

  - You are about to drop the column `email` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `costPrice` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `promotionalPrice` on the `Service` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "costPrice",
DROP COLUMN "promotionalPrice",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "reservedAt" TIMESTAMP(3),
ADD COLUMN     "startTime" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" TEXT;
