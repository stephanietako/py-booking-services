// utils/bookings.ts
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/types"; // <-- Ajoute cet import

export const updateBookingStatus = async (
  bookingId: number,
  status: BookingStatus // <-- Ici, accepte tous les statuts
) => {
  return await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status,
      approvedByAdmin: status === "APPROVED",
      paymentStatus: status === "PAID" ? "PAID" : undefined,
    },
  });
};
