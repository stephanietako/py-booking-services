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
  options: { amount: number }[] = []
) {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error(
        "L'heure de début doit être avant l'heure de fin et valide."
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, stripeCustomerId: true, email: true },
    });

    if (!user) throw new Error("Utilisateur introuvable.");

    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({ email: user.email });
      await prisma.user.update({
        where: { clerkUserId: userId },
        data: { stripeCustomerId: customer.id },
      });
      user.stripeCustomerId = customer.id;
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { pricingRules: true },
    });

    if (!service) throw new Error("Service introuvable.");

    let dynamicPrice = service.defaultPrice;
    const selectedDateTime = new Date(selectedDate);

    if (isNaN(selectedDateTime.getTime())) {
      throw new Error("La date sélectionnée est invalide.");
    }

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

    const totalAmount =
      dynamicPrice + options.reduce((sum, option) => sum + option.amount, 0);

    const newBooking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId,
        status: "PENDING",
        reservedAt: start,
        startTime: start,
        endTime: end,
        expiresAt: new Date(end.getTime() + 24 * 60 * 60 * 1000),
        totalAmount,
        stripeCustomerId: user.stripeCustomerId,
      },
    });
    console.log("✅ Réservation créée :", newBooking);
    return newBooking;
  } catch (error) {
    console.error("Erreur lors de la réservation ", error);
    throw new Error(`Impossible de réserver. Détails : ${error}`);
  }
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    const bookings = await prisma.booking.findMany({
      where: { user: { clerkUserId: userId } },
      include: { service: true, user: true, options: true },
      orderBy: { createdAt: "desc" },
    });

    return bookings.map((booking: Booking) => ({
      ...booking,
      startTime: new Date(booking.startTime), // Date type
      endTime: new Date(booking.endTime), // Date type
      totalAmount: booking.totalAmount,
    }));
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
    const booking = await prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: { service: true, user: true, options: true },
    });

    if (booking.user.clerkUserId !== userId) {
      throw new Error("⛔ Accès refusé.");
    }

    const token = jwt.sign(
      { bookingId: booking.id, userId: booking.user.clerkUserId },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    console.log("✅ Token JWT créé.");
    return { booking, token };
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
  } catch {
    console.error("Erreur lors de la mise à jour de la réservation ");
    throw new Error("Impossible de mettre à jour la réservation.");
  }
}

export async function deleteUserBooking(
  bookingId: string,
  clerkUserId: string
) {
  try {
    // Vérifier si la réservation existe et appartient à l'utilisateur
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true },
    });

    if (!booking) {
      throw new Error("❌ Réservation introuvable.");
    }

    if (booking.user.clerkUserId !== clerkUserId) {
      throw new Error(
        "⛔ Accès refusé : Vous ne pouvez pas supprimer cette réservation."
      );
    }

    // Exécuter la suppression en une transaction
    await prisma.$transaction([
      prisma.option.deleteMany({ where: { bookingId } }), // Supprime les options
      prisma.booking.delete({ where: { id: bookingId } }), // Supprime la réservation
    ]);

    return {
      message: "✅ Réservation et options associées supprimées avec succès.",
    };
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
  } catch {
    console.error("❌ Erreur lors de la récupération des options ");
    throw new Error("Impossible de récupérer les options.");
  }
}

export async function addOptionToBooking(
  bookingId: string,
  amount: number,
  description: string
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { options: true, service: true },
    });

    if (!booking) throw new Error("❌ Réservation non trouvée.");
    if (!booking.service) throw new Error("❌ Service introuvable.");

    const [newOption, updatedBooking] = await prisma.$transaction([
      prisma.option.create({
        data: { bookingId, amount, description },
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: { totalAmount: { increment: amount } }, // ✅ On modifie uniquement `totalAmount`
      }),
    ]);

    console.log(
      "✅ Option ajoutée et total mis à jour :",
      updatedBooking.totalAmount
    );
    return newOption;
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout de l'option :", error);
    throw error;
  }
}

export async function deleteOption(optionId: string) {
  try {
    const option = await prisma.option.findUnique({
      where: { id: optionId },
      select: { id: true, amount: true, bookingId: true },
    });

    if (!option?.bookingId) throw new Error("❌ Booking ID manquant.");

    const [, updatedBooking] = await prisma.$transaction([
      prisma.option.delete({ where: { id: optionId } }),
      prisma.booking.update({
        where: { id: option.bookingId },
        data: { totalAmount: { decrement: option.amount } }, // ✅ Modifier seulement `totalAmount`
      }),
    ]);

    return { success: true, newTotal: updatedBooking.totalAmount };
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    throw new Error("Impossible de supprimer l'option.");
  }
}

// update booking total
export const updateBookingTotal = async (
  bookingId: string
): Promise<number> => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { totalAmount: true }, // Ne récupérez que le nécessaire
    });

    return booking?.totalAmount || 0;
  } catch (error) {
    console.error("Erreur mise à jour total:", error);
    return 0;
  }
};

export async function getBookedTimes(
  date: string
): Promise<{ startTime: Date; endTime: Date }[]> {
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

  // Conversion explicite des startTime et endTime en objets Date
  return bookings.map(
    (booking: {
      startTime: string | number | Date;
      endTime: string | number | Date;
    }) => ({
      startTime: new Date(booking.startTime), // Convertir startTime en Date
      endTime: new Date(booking.endTime), // Convertir endTime en Date
    })
  );
}

// Récupérer les réservations d'un utilisateur
export async function generateBookingToken(bookingId: string, userId: string) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret)
      throw new Error("❌ JWT_SECRET est manquant dans l'environnement.");

    const token = jwt.sign({ bookingId, userId }, secret, { expiresIn: "1h" });

    return token;
  } catch {
    throw new Error(
      " Il y a un probleme au niveau de la récupération de l'ID de la reservation."
    );
  }
}

export async function getBookingIdFromToken(
  token: string
): Promise<string | null> {
  try {
    console.log("Token reçu dans getBookingIdFromToken :", token);
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET est manquant dans l'environnement.");
      return null;
    }

    const decoded = jwt.verify(token, secret);
    console.log("Token décodé dans getBookingIdFromToken :", decoded);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "bookingId" in decoded
    ) {
      return decoded.bookingId;
    } else {
      console.error("bookingId manquant ou token malformé");
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du token :", error);
    return null;
  }
}
