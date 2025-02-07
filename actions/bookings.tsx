"use server";

import { prisma } from "@/lib/prisma";
import { sendAdminNotification, sendUserCancellationEmail } from "./email";

// Créer une réservation
export async function createBooking(userId: string, serviceId: string) {
  try {
    const newBooking = await prisma.booking.create({
      data: {
        userId,
        serviceId,
        status: "pending",
        approvedByAdmin: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Exemple d'expiration dans 24 heures
      },
      include: {
        user: true, // Inclure l'utilisateur lié
        service: true, // Inclure le service lié
      },
    });

    // ✅ Envoi d'un email à l'admin
    await sendAdminNotification(
      newBooking.user.name,
      newBooking.service.name,
      newBooking.user.email
    );

    return newBooking;
  } catch (error) {
    console.error("Erreur lors de la réservation :", error);
    throw new Error("Impossible de réserver ce service.");
  }
}

// Confirmer une réservation
export async function confirmBooking(bookingId: string) {
  try {
    return await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "confirmed" },
    });
  } catch (error) {
    console.error("Erreur lors de la confirmation :", error);
    throw new Error("Impossible de confirmer la réservation.");
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
        expiresAt: new Date(), // ✅ Ajout de la date d'expiration
      },
    });

    return { message: "Service réservé avec succès !" };
  } catch (error) {
    console.error("Erreur lors de l’ajout de la réservation:", error);
    throw new Error("Impossible de réserver ce service.");
  }
}

// Récupérer toutes les réservations d'un utilisateur
export async function getUserBookings(userId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        service: true, // Inclure les détails du service
        user: true, // Inclure l'utilisateur
        transactions: true, // Inclure les transactions associées
      },
      orderBy: { createdAt: "desc" }, // Trier par date décroissante (récentes en premier)
    });

    return bookings;
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations :", error);
    throw new Error("Impossible de charger les réservations.");
  }
}

// Supprimer une réservation
export async function deleteUserBooking(bookingId: string) {
  try {
    await prisma.booking.delete({
      where: { id: bookingId },
    });
    return { message: "Réservation annulée avec succès." };
  } catch (error) {
    console.error("Erreur lors de la suppression de la réservation:", error);
    throw new Error("Impossible de supprimer la réservation.");
  }
}

// Supprimer une réservation
export async function deleteBooking(bookingId: string) {
  return await prisma.booking.delete({ where: { id: bookingId } });
}

// Récupérer toutes les réservations avec sécurisation des types
export async function getAllBookings() {
  try {
    const now = new Date();

    // 🔥 1. Trouver les réservations expirées
    const expiredBookings = await prisma.booking.findMany({
      where: {
        approvedByAdmin: false,
        expiresAt: { lte: now },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            image: true,
            description: true,
            createdAt: true,
            clerkUserId: true,
            roleId: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            amount: true,
            imageUrl: true,
            active: true,
            createdAt: true,
            updatedAt: true,
            transactions: true,
            categories: true,
          },
        },
        transactions: true,
      },
    });

    // 🔥 2. Envoyer un email aux utilisateurs concernés
    for (const booking of expiredBookings) {
      await sendUserCancellationEmail(
        booking.user.email,
        booking.service.name,
        booking.user.name,
        booking.user.email
      );
    }

    // 🔥 3. Supprimer les réservations expirées
    await prisma.booking.deleteMany({
      where: {
        id: { in: expiredBookings.map((booking) => booking.id) },
      },
    });

    // 🔥 4. Retourner les réservations valides
    return await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            image: true,
            description: true,
            createdAt: true,
            clerkUserId: true,
            roleId: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            amount: true,
            imageUrl: true,
            active: true,
            createdAt: true,
            updatedAt: true,
            transactions: true,
            categories: true,
          },
        },
        transactions: true,
      },
    });
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des réservations :",
      error
    );
    throw new Error("Impossible de charger les réservations.");
  }
}

// export async function getAllBookings() {
//   try {
//     const now = new Date();

//     // Trouver les réservations expirées
//     const expiredBookings = await prisma.booking.findMany({
//       where: {
//         approvedByAdmin: false,
//         expiresAt: { lte: now },
//       },
//       include: {
//         user: true,
//         service: true,
//       },
//     });

//     // Envoyer un email aux utilisateurs concernés
//     for (const booking of expiredBookings) {
//       await sendUserCancellationEmail(
//         booking.user.email,
//         booking.service.name,
//         booking.service.name
//       );
//     }

//     // Supprimer les réservations expirées
//     await prisma.booking.deleteMany({
//       where: {
//         id: { in: expiredBookings.map((booking) => booking.id) },
//       },
//     });

//     // Retourner les réservations valides avec un service simplifié
//     return await prisma.booking.findMany({
//       include: {
//         user: {
//           select: { id: true, email: true, name: true },
//         },
//         service: {
//           select: {
//             // Sélection simplifiée des propriétés
//             id: true,
//             name: true,
//             description: true,
//             amount: true,
//           },
//         },
//         transactions: true,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "❌ Erreur lors de la récupération des réservations :",
//       error
//     );
//     throw new Error("Impossible de charger les réservations.");
//   }
// }

//  Lorsqu’un utilisateur fait une réservation, elle est mise en attente.
// ✅ L’administrateur doit valider la réservation avant que l’utilisateur puisse payer.
// ✅ Si l’admin ne valide pas en 3 jours, la réservation est annulée automatiquement.
// ✅ L’utilisateur reçoit un email pour l’informer que sa réservation a été annulée.
// ✅  La suppression des réservations expirées.
