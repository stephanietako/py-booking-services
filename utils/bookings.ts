// utils/bookings.ts
// import { prisma } from "@/lib/prisma";
// import { BookingStatus } from "@/types";

// export const updateBookingStatus = async (
//   bookingId: number,
//   status: BookingStatus
// ) => {
//   return await prisma.booking.update({
//     where: { id: bookingId },
//     data: {
//       status,
//       approvedByAdmin: status === "APPROVED",
//       paymentStatus: status === "PAID" ? "PAID" : undefined,
//     },
//   });
// };
export async function updateBookingStatus(id: number, status: string) {
  const res = await fetch(`/api/bookings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    console.error("Erreur API:", res.status, errorBody);
    throw new Error("Failed to update booking status");
  }

  return res.json();
}
