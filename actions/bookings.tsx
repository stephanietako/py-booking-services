"use server";

import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { stripe } from "@/lib/stripe";
import { PaymentStatus, Prisma } from "@prisma/client";
import { Booking } from "@/types";
//import { transformBookings } from "@/helpers/transformBookings";

// Créer un service
export async function createBooking(
  userId: string,
  serviceId: string,
  selectedDate: string,
  startTime: string,
  endTime: string,
  options: { optionId: string; quantity: number }[],
  withCaptain: boolean = false
): Promise<Booking> {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const reservedAt = new Date(selectedDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new Error("Heures de début/fin invalides.");
    }

    const existingBookings = await prisma.booking.findMany({
      where: {
        serviceId: serviceId,
        reservedAt: reservedAt,
        NOT: {
          OR: [{ endTime: { lte: start } }, { startTime: { gte: end } }],
        },
      },
    });

    if (existingBookings.length > 0) {
      throw new Error("Le créneau horaire est déjà réservé.");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, email: true, stripeCustomerId: true },
    });
    if (!user) throw new Error("Utilisateur introuvable.");

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { clerkUserId: userId },
        data: { stripeCustomerId },
      });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { pricingRules: true },
    });
    if (!service) throw new Error("Service introuvable.");

    const rule = service.pricingRules.find(
      (r) => reservedAt >= r.startDate && reservedAt <= r.endDate
    );
    const boatAmount = rule?.price ?? service.defaultPrice;

    const optionDetails = await prisma.option.findMany({
      where: { id: { in: options.map((opt) => opt.optionId) } },
    });

    let payableOnBoard = 0;
    let payableOnline = 0;

    const bookingOptions: Prisma.BookingOptionCreateWithoutBookingInput[] =
      options.map((opt) => {
        const optionMeta = optionDetails.find((o) => o.id === opt.optionId);
        if (!optionMeta) throw new Error("Option invalide.");

        const {
          amount,
          label,
          description,
          id,
          payableOnline: isOnline,
        } = optionMeta;
        const subtotal = amount * opt.quantity;

        if (isOnline) {
          payableOnline += subtotal;
        } else {
          payableOnBoard += subtotal;
        }

        return {
          optionId: id,
          quantity: opt.quantity,
          unitPrice: amount,
          label,
          description: description ?? "",
          option: {
            connect: { id },
          },
        };
      });

    const totalAmount = boatAmount + payableOnline;

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId,
        reservedAt,
        startTime: start,
        endTime: end,
        expiresAt: new Date(end.getTime() + 24 * 60 * 60 * 1000),
        status: "PENDING",
        paymentStatus: "PENDING",
        approvedByAdmin: false,
        withCaptain,
        boatAmount,
        payableOnBoard,
        totalAmount,
        stripePaymentLink: "", // valeur par défaut acceptable
        updatedAt: new Date(),
        bookingOptions: {
          create: bookingOptions,
        },
      },
      include: { bookingOptions: true },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100,
      currency: "eur",
      customer: stripeCustomerId,
      metadata: { bookingId: booking.id.toString() },
    });

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        stripePaymentLink: paymentIntent.client_secret ?? "", // pour respecter `string`
      },
      include: { bookingOptions: true },
    });

    return updatedBooking as Booking;
  } catch (err) {
    console.error("Erreur createBooking:", err);
    throw new Error("Erreur lors de la création de la réservation.");
  }
}
////////////////////////
// Mettre à jour une réservation
export async function updateBooking(
  bookingId: string,
  data: Prisma.BookingUpdateInput & { serviceId?: string } // Ajout de serviceId optionnel à l'interface de data
) {
  try {
    const { startTime, endTime, reservedAt } = data;
    // Accède à serviceId directement depuis data
    const serviceId = data.serviceId;

    // Vérification des créneaux horaires disponibles avant mise à jour
    if (startTime && endTime && serviceId && reservedAt) {
      const startTimeDate =
        startTime instanceof Date ? startTime : new Date(startTime as string);
      const endTimeDate =
        endTime instanceof Date ? endTime : new Date(endTime as string);
      const reservedAtDate =
        reservedAt instanceof Date
          ? reservedAt
          : new Date(reservedAt as string);

      const existingBookings = await prisma.booking.findMany({
        where: {
          serviceId: serviceId,
          reservedAt: reservedAtDate,
          OR: [
            {
              startTime: {
                lte: endTimeDate,
              },
              endTime: {
                gte: startTimeDate,
              },
            },
          ],
        },
      });

      // Si des réservations existent dans le même créneau horaire, on empêche la mise à jour
      if (existingBookings.length > 0) {
        throw new Error("Le créneau horaire est déjà réservé.");
      }
    }

    // Préparation des données de mise à jour avec les bonnes conversions et relations
    const updatedBooking: Prisma.BookingUpdateInput = {
      ...data,
      Service: serviceId ? { connect: { id: serviceId } } : undefined, // Utilisation de 'Service' avec 'connect'
      reservedAt: reservedAt ? new Date(reservedAt as string) : undefined,
      startTime: startTime ? new Date(startTime as string) : undefined,
      endTime: endTime ? new Date(endTime as string) : undefined,
    } satisfies Prisma.BookingUpdateInput; // Ajout d'une assertion pour s'assurer de la conformité

    // Mise à jour de la réservation
    const updated = await prisma.booking.update({
      where: { id: parseInt(bookingId, 10) },
      data: updatedBooking,
    });

    return updated;
  } catch (error) {
    console.error("Erreur updateBooking:", error);
    throw new Error("Impossible de mettre à jour la réservation.");
  }
}
//////////////////////////
// Supprimer une réservation
export async function deleteBooking(bookingId: string) {
  try {
    const id = parseInt(bookingId, 10);
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) throw new Error("Réservation non trouvée.");

    // Annulation du paiement Stripe si payé
    if (
      booking.paymentStatus === PaymentStatus.PAID &&
      booking.stripePaymentLink
    ) {
      await stripe.paymentIntents.retrieve(booking.stripePaymentLink);

      // Optionnel : annuler le paiement si pas encore capturé
      // await stripe.paymentIntents.cancel(paymentIntent.id);
    }

    await prisma.bookingOption.deleteMany({ where: { bookingId: id } });
    await prisma.transaction.deleteMany({ where: { bookingId: id } });
    await prisma.booking.delete({ where: { id } });

    return { message: "✅ Réservation supprimée avec succès." };
  } catch (error) {
    console.error("Erreur deleteBooking:", error);
    throw new Error("Impossible de supprimer la réservation.");
  }
}
/////////////////////
export async function updateBookingTotal(bookingId: string): Promise<number> {
  try {
    const id = parseInt(bookingId, 10);
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { totalAmount: true },
    });
    return booking?.totalAmount ?? 0;
  } catch (error) {
    console.error("Erreur mise à jour total:", error);
    return 0;
  }
}
////////////////////////
// Récupérer les réservations d'un utilisateur
export async function getUserBookings(userId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { user: { clerkUserId: userId } },
      include: {
        Service: true,
        user: true,
        bookingOptions: {
          include: { option: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return bookings.map((booking) => {
      const enrichedService = booking.Service
        ? {
            ...booking.Service,
            description: booking.Service.description ?? undefined,
            categories: booking.Service.categories ?? [],
            imageUrl: booking.Service.imageUrl ?? "",
            active: booking.Service.active ?? true,
          }
        : null;

      return {
        ...booking,
        startTime: new Date(booking.startTime),
        endTime: new Date(booking.endTime),
        clientId: booking.clientId ?? null,
        stripePaymentLink: booking.stripePaymentLink ?? undefined,
        service: enrichedService,
        options: booking.bookingOptions.map((o) => ({
          id: o.optionId,
          label: o.label,
          quantity: o.quantity,
          unitPrice: o.unitPrice,
          description: "",
          amount: o.unitPrice,
          createdAt: o.option?.createdAt ?? new Date(),
        })),
      } as Booking;
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations", error);
    throw new Error("Impossible de charger les réservations.");
  }
}
////////////////////////
// Récupérer toutes les reservations d'un utilisateur (userId)
export const getAllBookings = async (userId: string): Promise<Booking[]> => {
  const bookings = await prisma.booking.findMany({
    where: {
      user: {
        clerkUserId: userId,
      },
    },
    include: {
      Service: true,
      user: true,
      bookingOptions: {
        include: { option: true },
      },
    },
  });

  // Transformation des dates directement dans la fonction, avec assertion de type
  const transformedBookings = bookings.map((booking) => ({
    ...booking,
    createdAt: booking.createdAt ? new Date(booking.createdAt) : null,
    updatedAt: booking.updatedAt ? new Date(booking.updatedAt) : null,
    expiresAt: booking.expiresAt ? new Date(booking.expiresAt) : null,
    reservedAt: booking.reservedAt ? new Date(booking.reservedAt) : null,
    service: booking.Service
      ? {
          ...booking.Service,
          description: booking.Service.description ?? undefined,
        }
      : null,
    clientId: booking.clientId ?? undefined,
  })) as Booking[]; // Ajout de l'assertion de type

  return transformedBookings;
};
////////////////////
// Récupérer toutes les réservations pour l'admin
export const getAllBookingsAdmin = async () => {
  return prisma.booking.findMany({
    orderBy: { reservedAt: "desc" },
    include: {
      user: true,
      client: true,
      Service: true,
      bookingOptions: true,
      transactions: true,
    },
  });
};
/////////////////////
// Récupérer toutes les réservations
export const getBookings = async (userId?: string): Promise<Booking[]> => {
  const bookings = await prisma.booking.findMany({
    where: userId ? { user: { clerkUserId: userId } } : {}, // pas de filtre si pas de userId
    include: {
      Service: true,
      user: true,
      bookingOptions: {
        include: { option: true },
      },
    },
  });

  return bookings.map((booking) => ({
    ...booking,
    createdAt: booking.createdAt ? new Date(booking.createdAt) : null,
    updatedAt: booking.updatedAt ? new Date(booking.updatedAt) : null,
    expiresAt: booking.expiresAt ? new Date(booking.expiresAt) : null,
    reservedAt: booking.reservedAt ? new Date(booking.reservedAt) : null,
    service: booking.Service
      ? {
          ...booking.Service,
          description: booking.Service.description ?? undefined,
        }
      : null,
    clientId: booking.clientId ?? undefined,
  })) as Booking[];
};
////////////////////////
// Récupérer les horaires réservés pour une date donnée
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

  return bookings.map((booking) => ({
    startTime: new Date(booking.startTime),
    endTime: new Date(booking.endTime),
  }));
}
//////////////////////////
// Récupérer le token de réservation
export async function generateBookingToken(bookingId: string, userId: string) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret)
      throw new Error("❌ JWT_SECRET est manquant dans l'environnement.");

    const token = jwt.sign({ bookingId, userId }, secret, { expiresIn: "1h" });

    return token;
  } catch {
    throw new Error(
      "Il y a un problème au niveau de la récupération de l'ID de la réservation."
    );
  }
}
/////////////////////////
// Vérifier le token et récupérer l'ID de réservation
export async function getBookingIdFromToken(
  token: string
): Promise<string | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET est manquant dans l'environnement.");
      return null;
    }

    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "bookingId" in decoded
    ) {
      return decoded.bookingId as string;
    } else {
      console.error("bookingId manquant ou token malformé");
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du token :", error);
    return null;
  }
}
//////////////////////////
// Supprimer une réservation de l'utilisateur
export async function deleteUserBooking(userId: string, bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId, 10) },
      include: { user: true }, // Inclure l'utilisateur lié à la réservation
    });

    if (!booking) throw new Error("Réservation non trouvée.");
    if (booking.userId !== userId)
      throw new Error(
        "Vous n'êtes pas autorisé à supprimer cette réservation."
      );

    // Supprimer les options et les transactions associées
    await prisma.bookingOption.deleteMany({ where: { bookingId: booking.id } });
    await prisma.transaction.deleteMany({ where: { bookingId: booking.id } });

    // Supprimer la réservation
    await prisma.booking.delete({ where: { id: booking.id } });

    return { message: "✅ Réservation supprimée avec succès." };
  } catch (error) {
    console.error("Erreur deleteUserBooking:", error);
    throw new Error("Impossible de supprimer la réservation.");
  }
}
//////////////////////////
// Récupérer une réservation par ID
export async function getBookingById(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId, 10) },
      include: {
        Service: true,
        bookingOptions: {
          include: { option: true },
        },
      },
    });

    if (!booking) throw new Error("Réservation non trouvée.");

    return {
      ...booking,
      startTime: new Date(booking.startTime),
      endTime: new Date(booking.endTime),
      service: booking.Service,
      options: booking.bookingOptions.map((o) => ({
        id: o.optionId,
        label: o.label,
        quantity: o.quantity,
        unitPrice: o.unitPrice,
        description: o.option?.description ?? "",
        amount: o.unitPrice * o.quantity,
      })),
    };
  } catch (error) {
    console.error("Erreur getBookingById:", error);
    throw new Error("Impossible de récupérer la réservation.");
  }
}
//////////////////////////
// Récupérer les options d'une réservation par ID
export async function getOptionsByBookingId(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId, 10) },
      include: {
        bookingOptions: {
          include: { option: true },
        },
        Service: true,
      },
    });

    if (!booking) {
      throw new Error("❌ Réservation introuvable.");
    }

    const options = booking.bookingOptions.map((o) => ({
      id: o.optionId,
      label: o.label,
      quantity: o.quantity,
      unitPrice: o.unitPrice,
      description: o.option?.description ?? "",
      amount: o.unitPrice * o.quantity,
      createdAt: o.option?.createdAt ?? new Date(),
    }));

    return {
      options,
      service: booking.Service,
    };
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des options", error);
    throw new Error("Impossible de récupérer les options.");
  }
}
/////////////////////////
// Ajouter une option à une réservation
export async function addOptionToBooking(
  bookingId: string,
  optionId: string,
  quantity: number
) {
  try {
    const option = await prisma.option.findUnique({ where: { id: optionId } });
    if (!option) throw new Error("❌ Option introuvable.");

    const subtotal = option.amount * quantity;

    const [created] = await prisma.$transaction([
      prisma.bookingOption.create({
        data: {
          bookingId: parseInt(bookingId, 10),
          optionId: option.id,
          quantity,
          unitPrice: option.amount,
          label: option.label,
          description: option.description ?? "",
        },
      }),
      prisma.booking.update({
        where: { id: parseInt(bookingId, 10) },
        data: {
          totalAmount: option.payableOnline
            ? { increment: subtotal }
            : undefined,
          payableOnBoard: !option.payableOnline
            ? { increment: subtotal }
            : undefined,
        },
      }),
    ]);

    return created;
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout de l'option :", error);
    throw new Error("Impossible d'ajouter l'option.");
  }
}
/////////////////////////
// Supprimer une option de réservation
export async function deleteOption(bookingOptionId: string) {
  try {
    const bookingOption = await prisma.bookingOption.findUnique({
      where: { id: bookingOptionId },
      include: { option: true }, // Assure-toi que la relation est bien définie dans le schema Prisma
    });

    if (!bookingOption) throw new Error("❌ Option non trouvée.");

    const amount = bookingOption.unitPrice * bookingOption.quantity;

    const [, updatedBooking] = await prisma.$transaction([
      prisma.bookingOption.delete({ where: { id: bookingOptionId } }),
      prisma.booking.update({
        where: { id: bookingOption.bookingId },
        data: {
          totalAmount: bookingOption.option?.payableOnline
            ? { decrement: amount }
            : undefined,
          payableOnBoard: !bookingOption.option?.payableOnline
            ? { decrement: amount }
            : undefined,
        },
      }),
    ]);

    return {
      success: true,
      newTotal: updatedBooking.totalAmount,
    };
  } catch (error) {
    console.error("❌ Erreur lors de la suppression :", error);
    throw new Error("Impossible de supprimer l'option.");
  }
}
//////////////
// Mettre à jour la quantité d'une option de réservation
export async function updateOptionQuantity(
  bookingOptionId: string,
  newQuantity: number
) {
  try {
    const bookingOption = await prisma.bookingOption.findUnique({
      where: { id: bookingOptionId },
      include: { option: true },
    });

    if (!bookingOption) throw new Error("❌ Option non trouvée.");

    const oldQuantity = bookingOption.quantity;
    const amountDifference =
      (newQuantity - oldQuantity) * bookingOption.unitPrice;

    const updateAmountField = bookingOption.option?.payableOnline
      ? {
          totalAmount:
            amountDifference >= 0
              ? { increment: amountDifference }
              : { decrement: Math.abs(amountDifference) },
        }
      : {
          payableOnBoard:
            amountDifference >= 0
              ? { increment: amountDifference }
              : { decrement: Math.abs(amountDifference) },
        };

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingOption.bookingId },
      data: updateAmountField,
    });

    const updatedBookingOption = await prisma.bookingOption.update({
      where: { id: bookingOptionId },
      data: { quantity: newQuantity },
    });

    return {
      success: true,
      newTotal: updatedBooking.totalAmount,
      updatedBookingOption,
    };
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour :", error);
    throw new Error("Impossible de mettre à jour l'option.");
  }
}
