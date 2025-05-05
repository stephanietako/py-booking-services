// lib/actions/updateBookingStatus.ts
import { prisma } from "@/lib/prisma";

export const updateBookingStatus = async (
  bookingId: number,
  status: "APPROVED" | "REJECTED" | "PAID"
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
