"use server";

import { prisma } from "@/lib/prisma";
import { Booking } from "@/types";
import { transformBookings } from "@/helpers/transformBookings";

// Créer une réservation
export async function createBooking(
  userId: string,
  serviceId: string,
  selectedDate: string,
  startTime: string,
  endTime: string
) {
  try {
    console.log("🟢 Tentative de réservation - Utilisateur:", userId);
    console.log("🟢 Service sélectionné:", serviceId);
    console.log("📅 Date envoyée :", selectedDate);
    console.log("⏰ StartTime reçu :", startTime);
    console.log("⏳ EndTime reçu :", endTime);

    // 🔥 Vérification de startTime et endTime
    const start = new Date(startTime);
    const end = new Date(endTime);
    // à tester comme if
    if (start >= end) {
      throw new Error("⛔ L'heure de début doit être avant l'heure de fin.");
    }

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error("⛔ Erreur: startTime ou endTime invalide", { start, end });
      throw new Error("🚨 L'heure de début ou de fin est invalide.");
    }

    console.log("✅ StartTime après conversion :", start);
    console.log("✅ EndTime après conversion :", end);

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("❌ Utilisateur introuvable.");

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) throw new Error("❌ Service introuvable.");

    // 📌 Vérification des conflits
    // const conflictingBookings = await prisma.booking.findMany({
    //   where: {
    //     serviceId,
    //     OR: [{ reservedAt: start, status: "PENDING" }],
    //   },
    // });
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        serviceId,
        AND: [
          { startTime: { lt: end } }, // Commence avant la fin de la nouvelle réservation
          { endTime: { gt: start } }, // Termine après le début de la nouvelle réservation
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      throw new Error(
        "🚫 Ce créneau est déjà réservé. Veuillez choisir un autre."
      );
    }

    // ✅ Création de la réservation avec `startTime` et `endTime`
    const newBooking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId,
        status: "PENDING",
        reservedAt: start,
        startTime: start, // ✅ S'assurer que ces champs sont bien passés
        endTime: end,
        expiresAt: new Date(end.getTime() + 24 * 60 * 60 * 1000), // Expiration dans 24h
      },
    });

    console.log("✅ Réservation réussie :", newBooking);
    return newBooking;
  } catch (error) {
    console.error("❌ Erreur lors de la réservation :", error);
    throw new Error(`Impossible de réserver. Détails : ${error}`);
  }
}

// Recupérer les réservations d'un utilisateur
export async function getUserBookings(userId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        user: {
          clerkUserId: userId, // Comparer avec clerkUserId
        }, // Filtre pour ne retourner que les réservations de cet utilisateur
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
      // status: "PENDING", // Sélectionner les réservations avec le statut "PENDING"
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

// Mettre à jour le statut de la réservation
export async function updateBooking(
  bookingId: string,
  newStatus: "APPROVED" | "REJECTED"
) {
  try {
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        approvedByAdmin: newStatus === "APPROVED",
      },
    });
    return updatedBooking;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la réservation :", error);
    throw new Error("Impossible de mettre à jour la réservation.");
  }
}

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
    await prisma.transaction.deleteMany({ where: { bookingId } });
    // await prisma.transaction.deleteMany({ where: { id: bookingId } });
    return { message: "✅ Réservation annulée avec succès." };
  } catch (error) {
    console.error("❌ Erreur lors de la suppression :", error);
    throw new Error("Impossible de supprimer la réservation.");
  }
}

export async function getTransactionsByBookingId(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        transactions: true, // Récupère les transactions associées à la réservation
        service: true, // Ajoute les infos du service lié à la réservation
      },
    });

    if (!booking) {
      throw new Error("❌ Réservation introuvable.");
    }

    return {
      transactions: booking.transactions, // Liste des transactions
      service: booking.service, // Infos sur le service associé
    };
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des transactions :",
      error
    );
    throw new Error("Impossible de récupérer les transactions.");
  }
}

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
        transactions: true, // Récupérer les transactions existantes
        service: true, // Récupérer le service associé à la réservation
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

// supprimer une transaction
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

//  Mettre à jour le total du prix de la réservation
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

// Récupérer les créneaux réservés pour une date donnée
export async function getBookedTimes(date: string) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      reservedAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  return bookings.map(({ startTime, endTime }) => ({
    startTime: new Date(startTime),
    endTime: new Date(endTime),
  }));
}
