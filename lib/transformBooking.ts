// import {
//   Booking as PrismaBooking,
//   Client,
//   Service,
//   BookingOption,
//   Transaction,
//   Option,
// } from "@prisma/client";
// import { Booking } from "@/types";

// export function transformBookingFromPrisma(
//   booking: PrismaBooking & {
//     client?: Client | null;
//     Service?: Service | null;
//     bookingOptions?: (BookingOption & { option?: Option | null })[];
//     transactions?: Transaction[];
//   }
// ): Booking {
//   return {
//     ...booking,
//     createdAt: new Date(booking.createdAt),
//     updatedAt: new Date(booking.updatedAt),
//     expiresAt: new Date(booking.expiresAt),
//     reservedAt: new Date(booking.reservedAt),
//     service: booking.Service
//       ? {
//           ...booking.Service,
//           description: booking.Service.description ?? undefined,
//           categories: booking.Service.categories ?? [],
//           imageUrl: booking.Service.imageUrl ?? "",
//           active: booking.Service.active ?? true,
//         }
//       : undefined, // ✅ ici `Booking.service` est de type `Service | undefined`
//     client: booking.client ?? null, // ✅ ton type le permet
//     clientId: booking.clientId ?? null,
//     options: booking.bookingOptions?.map((o) => ({
//       id: o.optionId,
//       label: o.label,
//       quantity: o.quantity,
//       unitPrice: o.unitPrice,
//       description: o.option?.description ?? "",
//       amount: o.unitPrice * o.quantity,
//       createdAt: o.option?.createdAt ?? new Date(),
//     })),
//     transactions: booking.transactions ?? [],
//   };
// }
