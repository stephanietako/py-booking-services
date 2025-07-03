-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "mealOption" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "requiresCaptain" BOOLEAN NOT NULL DEFAULT true;
