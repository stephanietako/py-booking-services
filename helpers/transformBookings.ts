// helpers/transformBookings.ts
import { Booking } from "@/types"; // Assurez-vous d'importer le type correct

// Fonction pour transformer les objets booking et convertir les dates
export const transformBookings = (bookings: Booking[]): Booking[] => {
  return bookings.map((booking) => ({
    ...booking,
    createdAt: new Date(booking.createdAt), // Convertir explicitement en Date
    expiresAt: booking.expiresAt ? new Date(booking.expiresAt) : null, // Convertir expiresAt en Date, ou null si non défini
  }));
};
