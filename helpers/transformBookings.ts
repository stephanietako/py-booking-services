// helpers/transformBookings.ts
import { Booking } from "@/types";

// Fonction pour transformer les objets booking et convertir les dates
export const transformBookings = (bookings: Booking[]): Booking[] => {
  return bookings.map((booking) => ({
    ...booking,
    createdAt: new Date(booking.createdAt), // Convertir explicitement en Date
    updatedAt: new Date(booking.updatedAt),
    expiresAt: booking.expiresAt ? new Date(booking.expiresAt) : null, // Convertir expiresAt en Date, ou null si non défini
    reservedAt: booking.reservedAt ? new Date(booking.reservedAt) : null,
  }));
};
