"use server";

import { prisma } from "@/lib/prisma";
import { Booking } from "@/types";
import { transformBookings } from "@/helpers/transformBookings";
import { stripe } from "@/lib/stripe";

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

    if (start >= end) {
      throw new Error("⛛ L'heure de début doit être avant l'heure de fin.");
    }

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error("⛛ Erreur: startTime ou endTime invalide", { start, end });
      throw new Error("🚨 L'heure de début ou de fin est invalide.");
    }

    console.log("✅ StartTime après conversion :", start);
    console.log("✅ EndTime après conversion :", end);

    // Récupérer l'utilisateur via son `clerkUserId`
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, stripeCustomerId: true, email: true },
    });

    if (!user) throw new Error("❌ Utilisateur introuvable.");

    // Si l'utilisateur n'a pas de `stripeCustomerId`, on le crée
    if (!user.stripeCustomerId) {
      console.log(
        "⛛ L'utilisateur n'a pas de stripeCustomerId. Création du client Stripe..."
      );
      const customer = await stripe.customers.create({
        email: user.email,
      });

      // Mettre à jour l'utilisateur dans la base de données avec `stripeCustomerId`
      await prisma.user.update({
        where: { clerkUserId: userId },
        data: { stripeCustomerId: customer.id },
      });

      // Ajouter le `stripeCustomerId` à l'utilisateur
      user.stripeCustomerId = customer.id;
      console.log("✅ Client Stripe créé avec succès :", customer.id);
    }

    // Récupérer le service
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) throw new Error("❌ Service introuvable.");

    // Vérifier si le créneau est déjà réservé
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

    // Créer la réservation
    const newBooking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId,
        status: "PENDING",
        reservedAt: start,
        startTime: start,
        endTime: end,
        expiresAt: new Date(end.getTime() + 24 * 60 * 60 * 1000), // Expiration dans 24h
        stripeCustomerId: user.stripeCustomerId, // Assurez-vous que ce champ est bien passé
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
        options: true,
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
      options: true, // pas certaine que ce soit la peine de le mettre ici
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
        options: true,
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
  newStatus: "APPROVED" | "REJECTED" | "PAID"
) {
  try {
    // Si le statut est "PAID", on ne change pas "approvedByAdmin", sinon on le met à "true" si le statut est "APPROVED"
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        approvedByAdmin: newStatus === "APPROVED" ? true : undefined, // On garde le `approvedByAdmin` inchangé si ce n'est pas "APPROVED"
      },
    });

    return updatedBooking;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la réservation :", error);
    throw new Error("Impossible de mettre à jour la réservation.");
  }
}

// Supprimer une réservation
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
    await prisma.option.deleteMany({ where: { bookingId } });
    // await prisma.transaction.deleteMany({ where: { id: bookingId } });
    return { message: "✅ Réservation annulée avec succès." };
  } catch (error) {
    console.error("❌ Erreur lors de la suppression :", error);
    throw new Error("Impossible de supprimer la réservation.");
  }
}

// Récupérer les options associées à une réservation
export async function getOptionsByBookingId(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        options: true, // Récupère les options associées à la réservation
        service: true, // Ajoute les infos du service lié à la réservation
      },
    });

    if (!booking) {
      throw new Error("❌ Réservation introuvable.");
    }

    return {
      options: booking.options, // Liste des options
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

// Ajouter une option à une réservation
export async function addOptionToBooking(
  bookingId: string,
  amount: number,
  description: string
) {
  try {
    // Vérifier si la réservation existe et récupérer les options + service
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        options: true, // Récupérer les options existantes
        service: true, // Récupérer le service associé à la réservation
      },
    });

    if (!booking) {
      throw new Error("❌ Réservation non trouvée.");
    }

    if (!booking.service) {
      throw new Error("❌ Le service lié à cette réservation n'existe plus.");
    }

    // Vérifier si l'option est autorisée pour ce service
    const newOption = await prisma.option.create({
      data: {
        bookingId,
        amount,
        description,
      },
    });

    console.log("✅ Transaction ajoutée avec succès :", newOption);
    return newOption;
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout de la transaction :", error);
    throw error;
  }
}

// supprimer une option
export async function deleteOption(optionId: string) {
  try {
    // Vérifie si l'option existe
    const option = await prisma.option.findUnique({
      where: { id: optionId },
    });

    if (!option) {
      throw new Error("❌ Transaction introuvable.");
    }

    // Supprime l'option
    await prisma.option.delete({
      where: { id: optionId },
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

// Mettre à jour le total du prix de la réservation
// export async function updateBookingTotal(bookingId: string) {
//   try {
//     const booking = await prisma.booking.findUnique({
//       where: { id: bookingId },
//       include: { options: true, service: true }, // ✅ Ajout de service
//     });

//     if (!booking) {
//       throw new Error("Réservation introuvable.");
//     }

//     // ✅ Calculer le total (prix du service + transactions)
//     const totalOptions = booking.options.reduce(
//       (sum, option) => sum + option.amount,
//       0
//     );
//     const newTotal = totalOptions + (booking.service?.amount || 0);

//     return newTotal; // ✅ On retourne juste la valeur pour le frontend
//   } catch (error) {
//     console.error("❌ Erreur lors de la mise à jour du total :", error);
//     throw error;
//   }
// }

export async function updateBookingTotal(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { options: true, service: true },
    });

    if (!booking) {
      throw new Error("Réservation introuvable.");
    }

    // Calculer le total (prix du service + transactions)
    const totalOptions = booking.options.reduce(
      (sum, option) => sum + option.amount,
      0
    );
    const newTotal = totalOptions + (booking.service?.amount || 0);

    // Mettre à jour le total dans la réservation
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        totalAmount: newTotal, // Mettre à jour le totalAmount
      },
    });

    return newTotal;
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
