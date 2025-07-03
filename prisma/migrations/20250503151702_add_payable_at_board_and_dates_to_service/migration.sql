-- AlterTable
ALTER TABLE "BookingOption" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "description" TEXT,
ADD COLUMN     "payableAtBoard" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "startTime" TIMESTAMP(3);
