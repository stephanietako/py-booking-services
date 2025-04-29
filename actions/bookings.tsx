"use server";

import { prisma } from "@/lib/prisma";
import { Booking } from "@/types";
import { stripe } from "@/lib/stripe";
import jwt from "jsonwebtoken";

// Créer une réservation
export async function createBooking(
  userId: string,
  serviceId: string,
  selectedDate: string,
  startTime: string,
  endTime: string,
  options: { optionId: string; quantity: number }[] = [],
  withCaptain = false,
  boatAmount = 0
) {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new Error(
        "L'heure de début doit être valide et antérieure à l'heure de fin."
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

    const selectedDateTime = new Date(selectedDate);
    if (isNaN(selectedDateTime.getTime())) {
      throw new Error("Date sélectionnée invalide.");
    }

    const applicableRule = await prisma.pricingRule.findFirst({
      where: {
        serviceId,
        startDate: { lte: selectedDateTime },
        endDate: { gte: selectedDateTime },
      },
    });

    const dynamicPrice = applicableRule?.price ?? service.defaultPrice;

    const fetchedOptions = await prisma.option.findMany({
      where: { id: { in: options.map((o) => o.optionId) } },
    });

    const bookingOptions = options.map((opt) => {
      const matched = fetchedOptions.find((o) => o.id === opt.optionId);
      if (!matched) throw new Error("Option non trouvée : " + opt.optionId);
      return {
        optionId: opt.optionId,
        quantity: opt.quantity,
        unitPrice: matched.amount,
        label: matched.label,
      };
    });

    const optionsTotal = bookingOptions.reduce(
      (sum, o) => sum + o.unitPrice * o.quantity,
      0
    );

    const totalAmount = dynamicPrice + optionsTotal + boatAmount;

    const newBooking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId,
        status: "PENDING",
        reservedAt: selectedDateTime,
        startTime: start,
        endTime: end,
        expiresAt: new Date(end.getTime() + 24 * 60 * 60 * 1000),
        totalAmount,
        boatAmount,
        payableOnBoard: optionsTotal,
        withCaptain,
        updatedAt: new Date(),
      },
    });

    await prisma.bookingOption.createMany({
      data: bookingOptions.map((o) => ({ ...o, bookingId: newBooking.id })),
    });

    console.log("✅ Réservation créée :", newBooking);
    return newBooking;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Impossible de réserver. Détails : ${error.message}`);
    }
    throw new Error("Une erreur inconnue s'est produite.");
  }
}

// Récupérer les réservations d'un utilisateur
export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    const bookings = await prisma.booking.findMany({
      where: { user: { clerkUserId: userId } },
      include: {
        Service: true,
        user: true,
        bookingOptions: {
          include: {
            option: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return bookings.map((booking) => ({
      ...booking,
      startTime: new Date(booking.startTime),
      endTime: new Date(booking.endTime),
      clientId: booking.clientId ?? 0,
      service: booking.Service
        ? {
            ...booking.Service,
            description: booking.Service.description ?? undefined,
            amount: booking.Service.amount ?? 0,
            categories: booking.Service.categories ?? [],
            imageUrl: booking.Service.imageUrl ?? "",
            active: booking.Service.active ?? true,
          }
        : null,
      options: booking.bookingOptions.map((o) => ({
        id: o.optionId,
        label: o.label,
        quantity: o.quantity,
        unitPrice: o.unitPrice,
        description: "",
        amount: o.unitPrice,
        createdAt: o.option?.createdAt ?? new Date(),
      })),
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations", error);
    throw new Error("Impossible de charger les réservations.");
  }
}

// Récupérer une réservation par ID
export async function getBookingById(bookingId: string, userId: string) {
  try {
    const booking = await prisma.booking.findUniqueOrThrow({
      where: { id: parseInt(bookingId, 10) },
      include: { Service: true, user: true, bookingOptions: true },
    });

    if (booking.user?.clerkUserId !== userId) {
      throw new Error("⛔ Accès refusé.");
    }

    const token = jwt.sign(
      { bookingId: booking.id, userId: booking.user.clerkUserId },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return { booking, token };
  } catch (error) {
    console.error("Erreur récupération réservation :", error);
    throw new Error("Impossible de récupérer la réservation.");
  }
}

// Supprimer une réservation
export async function deleteUserBooking(
  bookingId: string,
  clerkUserId: string
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId, 10) },
      include: { user: true },
    });

    if (!booking || booking.user?.clerkUserId !== clerkUserId) {
      throw new Error("⛔ Accès refusé ou réservation introuvable.");
    }

    await prisma.$transaction([
      prisma.bookingOption.deleteMany({ where: { bookingId: booking.id } }),
      prisma.booking.delete({ where: { id: booking.id } }),
    ]);

    return { message: "✅ Réservation supprimée." };
  } catch (error) {
    console.error("Erreur suppression réservation :", error);
    throw new Error("Impossible de supprimer la réservation.");
  }
}

// Générer un token pour une réservation
export async function generateBookingToken(bookingId: string, userId: string) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("❌ JWT_SECRET manquant.");

    return jwt.sign({ bookingId, userId }, secret, { expiresIn: "1h" });
  } catch (error) {
    console.error("Erreur génération token :", error);
    throw new Error("Erreur lors de la génération du token.");
  }
}

// Décoder un token pour obtenir l'ID de réservation
export async function getBookingIdFromToken(
  token: string
): Promise<string | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    const decoded = jwt.verify(token, secret);
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "bookingId" in decoded
    ) {
      return decoded.bookingId as string;
    }
    return null;
  } catch (error) {
    console.error("Erreur vérification token :", error);
    return null;
  }
}
