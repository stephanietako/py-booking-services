"use server";

import { prisma } from "@/lib/prisma";
import { Booking } from "@/types";

// Créer une réservation

// export async function createBooking(
//   userId: string,
//   serviceId: string,
//   date: Date
// ) {
//   try {
//     // Vérifier si le jour est ouvert
//     const dayOfWeek = date.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
//     const day = await prisma.day.findFirst({
//       where: { dayOfWeek },
//     });

//     if (!day) {
//       throw new Error("Ce jour n'est pas ouvert à la réservation.");
//     }

//     // Vérifier les horaires d'ouverture
//     const [openHour, openMinute] = day.openTime.split(":").map(Number);
//     const [closeHour, closeMinute] = day.closeTime.split(":").map(Number);
//     const bookingHour = date.getHours();
//     const bookingMinute = date.getMinutes();

//     if (
//       bookingHour < openHour ||
//       (bookingHour === openHour && bookingMinute < openMinute) ||
//       bookingHour > closeHour ||
//       (bookingHour === closeHour && bookingMinute > closeMinute)
//     ) {
//       throw new Error(
//         "L'horaire sélectionné est en dehors des heures d'ouverture."
//       );
//     }

//     // Création de la réservation si tout est valide
//     return await prisma.booking.create({
//       data: {
//         userId,
//         serviceId,
//         createdAt: date,
//       },
//     });
//   } catch (error) {
//     console.error("Erreur lors de la réservation :", error);
//     throw new Error(error.message || "Impossible de réserver ce service.");
//   }
// }

// Créer une réservation
export async function createBooking(userId: string, serviceId: string) {
  if (!userId) {
    throw new Error("Utilisateur non authentifié.");
  }

  try {
    return await prisma.booking.create({
      data: { userId, serviceId },
    });
  } catch (error) {
    console.error("Erreur lors de la réservation :", error);
    throw new Error("Impossible de réserver ce service.");
  }
}
// Récupérer une réservation par service et utilisateur
export const getBookingByServiceAndUser = async (
  serviceId: string,
  userId: string
) => {
  return await prisma.booking.findFirst({
    where: { serviceId, userId },
    include: { transactions: true, service: true },
  });
};

// Ajouter une réservation
export async function addUserBooking(userId: string, serviceId: string) {
  try {
    // Vérifier si le service est déjà réservé par l’utilisateur
    const existingBooking = await prisma.booking.findFirst({
      where: { userId, serviceId },
    });

    if (existingBooking) {
      throw new Error("Vous avez déjà réservé ce service.");
    }

    // Ajouter la réservation
    await prisma.booking.create({
      data: {
        userId,
        serviceId,
      },
    });

    return { message: "Service réservé avec succès !" };
  } catch (error) {
    console.error("Erreur lors de l’ajout de la réservation:", error);
    throw new Error("Impossible de réserver ce service.");
  }
}

// Supprimer une réservation
// export async function deleteUserBooking(userId: string, serviceId: string) {
//   try {
//     await prisma.booking.deleteMany({
//       where: { userId, serviceId },
//     });

//     return { message: "Réservation annulée avec succès." };
//   } catch (error) {
//     console.error("Erreur lors de la suppression de la réservation:", error);
//     throw new Error("Impossible de supprimer la réservation.");
//   }
// }
export async function deleteUserBooking(userId: string, serviceId: string) {
  try {
    const deleted = await prisma.booking.deleteMany({
      where: { userId, serviceId },
    });

    if (deleted.count === 0) {
      throw new Error("Aucune réservation trouvée à annuler.");
    }

    return { message: "Réservation annulée avec succès." };
  } catch (error) {
    console.error("Erreur lors de la suppression de la réservation:", error);
    throw new Error("Impossible de supprimer la réservation.");
  }
}

// Récupérer les réservations d'un utilisateur
export async function getUserBookings(userId: string): Promise<Booking[]> {
  if (!userId) throw new Error("Utilisateur non authentifié.");

  try {
    return await prisma.booking.findMany({
      where: { userId },
      include: { service: true, user: true, transactions: true },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations :", error);
    throw new Error("Impossible de charger vos réservations.");
  }
}

export async function deleteBooking(bookingId: string) {
  return await prisma.booking.delete({ where: { id: bookingId } });
}
