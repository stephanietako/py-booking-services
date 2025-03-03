import { prisma } from "@/lib/prisma";

export const updateBookingStatus = async (
  bookingId: string,
  status: "APPROVED" | "REJECTED"
) => {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: status,
      approvedByAdmin: status === "APPROVED",
    },
  });

  return booking;
};
