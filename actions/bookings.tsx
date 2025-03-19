"use server";

import { prisma } from "@/lib/prisma";
import { Booking } from "@/types";
import { transformBookings } from "@/helpers/transformBookings";
import { stripe } from "@/lib/stripe";
import jwt from "jsonwebtoken";

// Créer une réservation
export async function createBooking(
  userId: string,
  serviceId: string,
  selectedDate: string,
  startTime: string,
  endTime: string,
  options: { amount: number }[] = [] // Par défaut, options est un tableau vide
) {
  try {
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
      let customer;
      try {
        customer = await stripe.customers.create({
          email: user.email,
        });
      } catch (stripeError) {
        console.error(
          "❌ Erreur Stripe lors de la création du client:",
          stripeError
        );
        throw new Error("Impossible de créer le client Stripe.");
      }

      // Mettre à jour l'utilisateur dans la base de données avec `stripeCustomerId`
      await prisma.user.update({
        where: { clerkUserId: userId },
        data: { stripeCustomerId: customer.id },
      });

      // Ajouter le `stripeCustomerId` à l'utilisateur
      user.stripeCustomerId = customer.id;
      console.log("✅ Client Stripe créé avec succès ");
    }

    // Récupérer le service et ses règles de tarification
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { pricingRules: true }, // Inclure les règles de tarification
    });
    if (!service) throw new Error("❌ Service introuvable.");

    // Calculer le prix dynamique basé sur la date de la réservation
    let dynamicPrice = service.defaultPrice;

    const selectedDateTime = new Date(selectedDate);
    if (isNaN(selectedDateTime.getTime())) {
      throw new Error("🚨 La date sélectionnée est invalide.");
    }

    // Recherche d'une règle tarifaire applicable
    const applicableRule = await prisma.pricingRule.findFirst({
      where: {
        serviceId: serviceId,
        startDate: { lte: selectedDateTime },
        endDate: { gte: selectedDateTime },
      },
    });

    if (applicableRule) {
      dynamicPrice = applicableRule.price;
    }

    // Calculer le prix total avec options
    const totalAmount =
      dynamicPrice +
      (options && options.length > 0
        ? options.reduce((sum, option) => sum + option.amount, 0)
        : 0);

    // Créer la réservation avec le prix total calculé
    const newBooking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId,
        status: "PENDING",
        reservedAt: start,
        startTime: start,
        endTime: end,
        expiresAt: new Date(end.getTime() + 24 * 60 * 60 * 1000), // Expiration dans 24h
        totalAmount, // Utiliser le montant total calculé
        stripeCustomerId: user.stripeCustomerId, // Assurez-vous que ce champ est bien passé
      },
    });

    return newBooking;
  } catch (error) {
    console.error("❌ Erreur lors de la réservation ", error);
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
        },
      },
      include: {
        service: true,
        user: true,
        options: true, // Assurez-vous d'inclure les options
      },
      orderBy: { createdAt: "desc" },
    });

    // Ajouter le calcul du montant total pour chaque réservation
    const bookingsWithTotalAmount = bookings.map((booking) => {
      const optionsAmount = booking.options.reduce(
        (sum, option) => sum + option.amount,
        0
      );
      const totalAmount = booking.totalAmount + optionsAmount;

      return {
        ...booking,
        totalAmount, // Ajout du montant total calculé
      };
    });

    return bookingsWithTotalAmount;
  } catch {
    console.error("Erreur lors de la récupération des réservations");
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
        user: true,
        options: true,
      },
    });

    if (!booking || !booking.user || booking.user.clerkUserId !== userId) {
      console.log("Réservation introuvable ou accès refusé.");
      throw new Error("⛔ Réservation introuvable ou accès refusé.");
    }

    const token = jwt.sign(
      { bookingId: booking.id, userId: booking.user.clerkUserId },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    console.log("✅ Token JWT créé.");

    return { booking, token };
  } catch {
    console.error("❌ Erreur lors de la récupération de la réservation ");
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
  } catch {
    console.error("Erreur lors de la mise à jour de la réservation ");
    throw new Error("Impossible de mettre à jour la réservation.");
  }
}

// Supprimer une réservation et ses options associées
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

    // Supprimer les options avant la réservation
    await prisma.option.deleteMany({ where: { bookingId } });

    // Supprimer la réservation après les options
    await prisma.booking.delete({ where: { id: bookingId } });

    return {
      message: "✅ Réservation et options associées supprimées avec succès.",
    };
  } catch {
    console.error("❌ Erreur lors de la suppression ");
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
  } catch {
    console.error("❌ Erreur lors de la récupération des options ");
    throw new Error("Impossible de récupérer les options.");
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

    console.log(" Option ajoutée avec succès :", newOption);
    return newOption;
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout de l'option ");
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
      throw new Error("❌ Option introuvable.");
    }

    // Supprime l'option
    await prisma.option.delete({
      where: { id: optionId },
    });

    return { message: "✅ Option supprimée avec succès." };
  } catch {
    console.error("❌ Erreur lors de la suppression de l'option ");
    throw new Error("Impossible de supprimer l'option.");
  }
}

// update
export const updateBookingTotal = async (
  bookingId: string
): Promise<number> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      options: true,
    },
  });

  if (!booking) {
    console.error("Réservation non trouvée !");
    return 0; // Retourner 0 si la réservation n'existe pas
  }

  const { service, options, startTime } = booking;

  if (!service) {
    console.error("Le service lié à cette réservation n'existe pas !");
    return 0; // Retourner 0 si le service n'existe pas
  }

  let servicePrice = service.price ?? service.defaultPrice;

  // Vérifier si une règle de tarification existe pour la période de réservation
  const pricingRule = await prisma.pricingRule.findFirst({
    where: {
      serviceId: service.id,
      startDate: { lte: startTime }, // La règle doit être valide avant ou à la date de début
      endDate: { gte: startTime }, // La règle doit être valide après ou à la date de début
    },
    orderBy: { startDate: "desc" }, // Prendre la règle la plus récente
  });

  if (pricingRule) {
    servicePrice = pricingRule.price;
  }

  // Calcul du total
  const optionsTotal = options.reduce((sum, option) => sum + option.amount, 0);
  const totalAmount = servicePrice + optionsTotal;

  // Mise à jour de la réservation avec le nouveau total
  await prisma.booking.update({
    where: { id: bookingId },
    data: { totalAmount },
  });

  return totalAmount; // Retourner le montant total
};

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

// actions/bookings.ts (ou un fichier similaire)
export async function generateBookingToken(bookingId: string, userId: string) {
  try {
    const secret = process.env.JWT_SECRET as string; // Typage explicite

    const token = jwt.sign({ bookingId, userId }, secret, { expiresIn: "1h" });

    return token;
  } catch {
    throw new Error(
      " Il y a un probleme au niveau de la récupération de l'ID de la reservation."
    );
  }
}

// Récupérer l'ID de réservation à partir du token
export async function getBookingIdFromToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET as string; // Typage explicite
    const decoded = jwt.verify(token, secret) as { bookingId: string };
    return decoded.bookingId;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'ID de réservation :",
      error
    );
    return null;
  }
}
