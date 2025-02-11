"use server";

import { prisma } from "@/lib/prisma";
import { BookingStatus, Booking } from "@/types";
import { transformBookings } from "@/helpers/transformBookings";
// Créer une réservation
export async function createBooking(userId: string, serviceId: string) {
  try {
    // Recherche l'utilisateur par clerkUserId (l'id que tu as de Clerk)
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }, // Utilisation de clerkUserId ici
    });

    // Vérifie si l'utilisateur existe
    if (!user) {
      console.error("Aucun utilisateur trouvé pour clerkUserId:", userId);
      throw new Error("L'utilisateur spécifié n'existe pas.");
    }

    // Recherche le service avec l'id du service
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    // Vérifie si le service existe
    if (!service) {
      console.error("Aucun service trouvé pour serviceId:", serviceId);
      throw new Error("Le service spécifié n'existe pas.");
    }

    // Définir une date d'expiration (par exemple, 1 semaine après la création)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours après la création

    // Créer la réservation avec le champ expiresAt
    const newBooking = await prisma.booking.create({
      data: {
        userId: user.id, // Utilisation de l'ID Prisma de l'utilisateur
        serviceId,
        status: "PENDING", // Statut initial de la réservation
        expiresAt, // Ajout du champ expiresAt
      },
    });

    console.log("Réservation créée avec succès:", newBooking);
    return newBooking;
  } catch (error) {
    console.error("Erreur lors de la création de la réservation:", error);
    throw new Error("Impossible de réserver ce service.");
  }
}

// Récupérer toutes les réservations d'un utilisateur
export async function getUserBookings(userId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        user: {
          clerkUserId: userId, // Comparer avec clerkUserId
        },
      },
      include: {
        service: true,
        user: true,
        transactions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return bookings;
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations :", error);
    throw new Error("Impossible de charger les réservations.");
  }
}

// Récupérer toutes les réservations d'un utilisateur
// export const getAllBookings = async (userId: string) => {
//   return await prisma.booking.findMany({
//     where: {
//       status: "PENDING", // Filtre sur les réservations en attente
//       user: {
//         clerkUserId: userId, // Comparer avec clerkUserId
//       },
//     },
//     include: {
//       service: true,
//       user: true,
//     },
//   });
// };
export const getAllBookings = async (userId: string): Promise<Booking[]> => {
  const bookings = await prisma.booking.findMany({
    where: {
      status: "PENDING", // Sélectionner les réservations avec le statut "PENDING"
      user: {
        clerkUserId: userId, // Comparer avec clerkUserId
      },
    },
    include: {
      service: true, // Inclure les informations sur le service
      user: true, // Inclure les informations sur l'utilisateur
    },
  });

  // Appliquer la transformation pour convertir les dates
  return transformBookings(bookings);
};
// export const getAllBookings = async () => {
//   return await prisma.booking.findMany({
//     where: { status: "PENDING" },
//     include: {
//       service: true, // Inclure les détails du service
//       user: true, // Inclure les détails de l'utilisateur
//     },
//   });
// };

// Mettre à jour le statut d'une réservation
export async function updateBooking(
  id: string,
  status: BookingStatus
): Promise<void> {
  await prisma.booking.update({
    where: { id },
    data: { status },
    include: {
      service: true,
    },
  });
}

// Supprimer une réservation
export async function deleteUserBooking(
  bookingId: string
): Promise<{ message: string }> {
  try {
    //  Vérifiez si la réservation existe
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Réservation introuvable.");
    }
    // Supprimez la réservation
    await prisma.booking.delete({ where: { id: bookingId } });

    return { message: "Réservation annulée avec succès." };
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de la réservation:", error);
    throw new Error("Impossible de supprimer la réservation.");
  }
}
