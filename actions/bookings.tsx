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

// Recupérer les réservations d'un utilisateur
export async function getUserBookings(userId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        user: {
          clerkUserId: userId, // Comparer avec clerkUserId
        }, // ✅ Filtre pour ne retourner que les réservations de cet utilisateur
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

// Récupérer toutes les reservations
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
      transactions: true, // pas certaine que ce soit la peine de le mettre ici
    },
  });

  // Appliquer la transformation pour convertir les dates
  return transformBookings(bookings);
};

// Recupère la reservation individuelle
export async function getBookingById(bookingId: string, userId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        service: true,
        user: true, // Assure-toi que l'utilisateur est bien inclus
        transactions: true,
      },
    });

    // Vérifie si la réservation existe et si le clerkUserId correspond

    if (!booking || booking.user.clerkUserId !== userId) {
      throw new Error("⛔ Réservation introuvable ou accès refusé.");
    }

    return booking;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération de la réservation :",
      error
    );
    throw new Error("Impossible de récupérer la réservation.");
  }
}

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

// export async function deleteUserBooking(bookingId: string, userId: string) {
//   try {
//     const booking = await prisma.booking.findUnique({
//       where: { id: bookingId },
//     });

//     if (!booking) {
//       throw new Error("❌ Réservation introuvable.");
//     }

//     if (booking.userId !== userId) {
//       throw new Error(
//         "⛔ Accès refusé : Vous ne pouvez pas supprimer cette réservation."
//       );
//     }

//     await prisma.booking.delete({ where: { id: bookingId } });

//     return { message: "✅ Réservation annulée avec succès." };
//   } catch (error) {
//     console.error("❌ Erreur lors de la suppression :", error);
//     throw new Error("Impossible de supprimer la réservation.");
//   }
// }
export async function deleteUserBooking(
  bookingId: string,
  clerkUserId: string
) {
  try {
    // Récupérer la réservation avec l'utilisateur associé
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true }, // Inclure l'utilisateur associé pour accéder au clerkUserId
    });

    if (!booking) {
      throw new Error("❌ Réservation introuvable.");
    }

    // Vérification que le clerkUserId correspond à celui de l'utilisateur connecté
    if (booking.user.clerkUserId !== clerkUserId) {
      throw new Error(
        "⛔ Accès refusé : Vous ne pouvez pas supprimer cette réservation."
      );
    }

    // Suppression de la réservation
    await prisma.booking.delete({ where: { id: bookingId } });

    return { message: "✅ Réservation annulée avec succès." };
  } catch (error) {
    console.error("❌ Erreur lors de la suppression :", error);
    throw new Error("Impossible de supprimer la réservation.");
  }
}
/////////////////
// export async function getTransactionsByBookingId(bookingId: string) {
//   return prisma.transaction.findMany({
//     where: { bookingId },

//     orderBy: { createdAt: "desc" },
//   });
// }
export async function getTransactionsByBookingId(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        transactions: true, // ✅ Récupère les transactions associées à la réservation
        service: true, // ✅ Ajoute les infos du service lié à la réservation
      },
    });

    if (!booking) {
      throw new Error("❌ Réservation introuvable.");
    }

    return {
      transactions: booking.transactions, // ✅ Liste des transactions
      service: booking.service, // ✅ Infos sur le service associé
    };
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des transactions :",
      error
    );
    throw new Error("Impossible de récupérer les transactions.");
  }
}

// export async function addTransactionToBooking(
//   bookingId: string,
//   amount: number,
//   description: string
// ) {
//   return prisma.transaction.create({
//     data: { bookingId, amount, description },
//   });
// }
export async function addTransactionToBooking(
  bookingId: string,
  amount: number,
  description: string
) {
  try {
    // Vérifier si la réservation existe et récupérer les transactions + service
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        transactions: true, // ✅ Récupérer les transactions existantes
        service: true, // ✅ Récupérer le service associé à la réservation
      },
    });

    if (!booking) {
      throw new Error("❌ Réservation non trouvée.");
    }

    if (!booking.service) {
      throw new Error("❌ Le service lié à cette réservation n'existe plus.");
    }

    // Ajouter la transaction sans restriction
    const newTransaction = await prisma.transaction.create({
      data: {
        bookingId,
        amount,
        description,
      },
    });

    console.log("✅ Transaction ajoutée avec succès :", newTransaction);
    return newTransaction;
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout de la transaction :", error);
    throw error;
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    // Vérifie si la transaction existe
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new Error("❌ Transaction introuvable.");
    }

    // Supprime la transaction
    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return { message: "✅ Transaction supprimée avec succès." };
  } catch (error) {
    console.error(
      "❌ Erreur lors de la suppression de la transaction :",
      error
    );
    throw new Error("Impossible de supprimer la transaction.");
  }
}

// 🔥 Mettre à jour le total du prix de la réservation
export async function updateBookingTotal(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { transactions: true, service: true }, // ✅ Ajout de service
    });

    if (!booking) {
      throw new Error("Réservation introuvable.");
    }

    // ✅ Calculer le total (prix du service + transactions)
    const totalTransactions = booking.transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
    const newTotal = totalTransactions + (booking.service?.amount || 0);

    return newTotal; // ✅ On retourne juste la valeur pour le frontend
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du total :", error);
    throw error;
  }
}

// export const updateBookingTotalAmount = async (bookingId: string) => {
//   // Calculer le total à partir des transactions associées à la réservation
//   const transactions = await prisma.transaction.findMany({
//     where: { bookingId },
//     include: { service: true },
//   });

//   const totalAmount = transactions.reduce(
//     (total, transaction) => total + transaction.amount,
//     0
//   );

//   // Mettre à jour le champ `totalAmount` de la réservation
//   await prisma.booking.update({
//     where: { id: bookingId },
//     data: { totalAmount },
//   });

//   return totalAmount;
// };
