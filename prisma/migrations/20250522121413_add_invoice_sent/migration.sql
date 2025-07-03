-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "invoiceSent" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "stripeCustomerId" TEXT;
