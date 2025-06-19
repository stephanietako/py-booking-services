"use server";

import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { stripe } from "@/lib/stripe";
import { PaymentStatus, Prisma } from "@prisma/client";
import { Booking } from "@/types";
import { calculateBookingTotal } from "@/utils/calculateBookingTotal";
import { createStripeCheckoutSession } from "./actionsStripe";

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error("❌ JWT_SECRET est manquant dans l'environnement.");
}

interface Payload {
  bookingId: number;
  clientId?: number;
  userId?: string;
}

/// Fonction pour générer un token JWT
export async function generateBookingToken(
  bookingId: number,
  clientId?: number,
  userId?: string
) {
  try {
    if (!secret) {
      throw new Error("❌ JWT_SECRET est manquant dans l'environnement.");
    }

    const payload: Payload = {
      bookingId: bookingId,
      clientId: clientId,
      userId: userId,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "24h" }); // Ajustez l'expiration si nécessaire
    return token;
  } catch (error) {
    console.error("Erreur lors de la génération du token :", error);
    throw new Error(
      "Il y a un problème au niveau de la génération du token de réservation."
    );
  }
}
// Fonction pour créer une réservation
// export async function createBooking(
//   userId: string | null,
//   serviceId: string,
//   selectedDate: string,
//   startTime: string,
//   endTime: string,
//   options: { optionId: string; quantity: number }[],
//   withCaptain: boolean = false,
//   mealOption: boolean = false,
//   fullName?: string,
//   email?: string,
//   phoneNumber?: string,
//   comment?: string
// ): Promise<{ booking: Booking; token?: string }> {
//   try {
//     const start = new Date(startTime);
//     const end = new Date(endTime);
//     const reservedAt = new Date(selectedDate);

//     if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
//       throw new Error("Heures de début/fin invalides.");
//     }

//     const existingBookings = await prisma.booking.findMany({
//       where: {
//         serviceId,
//         reservedAt,
//         NOT: {
//           OR: [{ endTime: { lte: start } }, { startTime: { gte: end } }],
//         },
//       },
//     });

//     if (existingBookings.length > 0) {
//       throw new Error("Le créneau horaire est déjà réservé.");
//     }

//     let clientData = null;
//     let actualUserId: string | undefined = undefined;
//     let stripeCustomerId: string | undefined = undefined;

//     if (userId) {
//       const user = await prisma.user.findUnique({
//         where: { clerkUserId: userId },
//         select: {
//           id: true,
//           email: true,
//           stripeCustomerId: true,
//           name: true,
//           phoneNumber: true,
//         },
//       });
//       if (!user) throw new Error("Utilisateur introuvable.");

//       stripeCustomerId = user.stripeCustomerId ?? undefined;
//       actualUserId = user.id;

//       if (!stripeCustomerId) {
//         const customer = await stripe.customers.create({
//           email: user.email || undefined,
//         });
//         stripeCustomerId = customer.id;
//         await prisma.user.update({
//           where: { clerkUserId: userId },
//           data: { stripeCustomerId },
//         });
//       }
//     } else if (fullName && email && phoneNumber) {
//       const existingClient = await prisma.client.findUnique({
//         where: { email },
//       });

//       if (existingClient) {
//         clientData = existingClient;
//         if (
//           existingClient.fullName !== fullName ||
//           existingClient.phoneNumber !== phoneNumber
//         ) {
//           clientData = await prisma.client.update({
//             where: { id: existingClient.id },
//             data: { fullName, phoneNumber },
//           });
//         }
//       } else {
//         clientData = await prisma.client.create({
//           data: { fullName, email, phoneNumber },
//         });
//       }
//     } else {
//       throw new Error(
//         "Informations d'utilisateur/client manquantes pour la réservation."
//       );
//     }

//     const service = await prisma.service.findUnique({
//       where: { id: serviceId },
//       include: { pricingRules: true },
//     });
//     if (!service) throw new Error("Service introuvable.");

//     const rule = service.pricingRules.find(
//       (r) => reservedAt >= r.startDate && reservedAt <= r.endDate
//     );
//     const boatAmount = rule?.price ?? service.defaultPrice;

//     const optionDetails = await prisma.option.findMany({
//       where: { id: { in: options.map((opt) => opt.optionId) } },
//     });

//     const bookingOptionsData: Prisma.BookingOptionCreateWithoutBookingInput[] =
//       options.map((opt) => {
//         const optionMeta = optionDetails.find((o) => o.id === opt.optionId);
//         if (!optionMeta) throw new Error("Option invalide.");

//         const subtotal = optionMeta.amount * opt.quantity;

//         return {
//           quantity: opt.quantity,
//           unitPrice: optionMeta.amount,
//           amount: subtotal,
//           label: optionMeta.label,
//           description: optionMeta.description ?? "",
//           option: { connect: { id: opt.optionId } },
//         };
//       });

//     const selectedOptionsForCalc = options.map((opt) => {
//       const optionMeta = optionDetails.find((o) => o.id === opt.optionId);
//       if (!optionMeta) throw new Error("Option invalide.");

//       return {
//         unitPrice: optionMeta.amount,
//         quantity: opt.quantity,
//       };
//     });

//     const { totalAmount, payableOnBoard } = calculateBookingTotal({
//       basePrice: boatAmount,
//       withCaptain,
//       captainPrice: service.captainPrice ?? 350,
//       selectedOptions: selectedOptionsForCalc,
//     });

//     const booking = await prisma.booking.create({
//       data: {
//         clientId: clientData?.id,
//         userId: actualUserId,
//         description: comment || "",
//         serviceId,
//         reservedAt,
//         startTime: start,
//         endTime: end,
//         expiresAt: new Date(end.getTime() + 24 * 60 * 60 * 1000),
//         status: "PENDING",
//         paymentStatus: "PENDING",
//         approvedByAdmin: false,
//         withCaptain,
//         boatAmount,
//         payableOnBoard,
//         totalAmount,
//         stripePaymentLink: "",
//         updatedAt: new Date(),
//         bookingOptions: {
//           create: bookingOptionsData,
//         },
//         mealOption,
//       },
//       include: {
//         bookingOptions: { include: { option: true } },
//         client: true,
//         user: true,
//         service: true,
//       },
//     });

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: totalAmount * 100,
//       currency: "eur",
//       customer: stripeCustomerId,
//       metadata: { bookingId: booking.id.toString() },
//     });

//     const updatedBooking = await prisma.booking.update({
//       where: { id: booking.id },
//       data: {
//         stripePaymentLink: paymentIntent.client_secret ?? "",
//       },
//       include: {
//         bookingOptions: { include: { option: true } },
//         client: true,
//         user: true,
//         service: true,
//       },
//     });

//     let token: string | undefined;
//     if (updatedBooking?.id) {
//       token = await generateBookingToken(
//         updatedBooking.id,
//         updatedBooking.clientId ?? undefined,
//         updatedBooking.userId ?? undefined
//       );
//     }

//     return { booking: updatedBooking as Booking, token };
//   } catch (err) {
//     console.error("❌ Erreur createBooking:", err);
//     throw new Error("Erreur lors de la création de la réservation.");
//   }
// }
export async function createBooking(
  userId: string | null,
  serviceId: string,
  selectedDate: string,
  startTime: string,
  endTime: string,
  options: { optionId: string; quantity: number }[],
  withCaptain: boolean = false,
  mealOption: boolean = false,
  fullName?: string,
  email?: string,
  phoneNumber?: string,
  comment?: string
): Promise<{ booking: Booking; token?: string }> {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const reservedAt = new Date(selectedDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new Error("Heures de début/fin invalides.");
    }

    const existingBookings = await prisma.booking.findMany({
      where: {
        serviceId,
        reservedAt,
        NOT: {
          OR: [{ endTime: { lte: start } }, { startTime: { gte: end } }],
        },
      },
    });

    if (existingBookings.length > 0) {
      throw new Error("Le créneau horaire est déjà réservé.");
    }

    let clientData = null;
    let actualUserId: string | undefined = undefined;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
        select: {
          id: true,
        },
      });
      if (!user) throw new Error("Utilisateur introuvable.");
      actualUserId = user.id;
    } else if (fullName && email && phoneNumber) {
      const existingClient = await prisma.client.findUnique({
        where: { email },
      });

      if (existingClient) {
        clientData = existingClient;
        if (
          existingClient.fullName !== fullName ||
          existingClient.phoneNumber !== phoneNumber
        ) {
          clientData = await prisma.client.update({
            where: { id: existingClient.id },
            data: { fullName, phoneNumber },
          });
        }
      } else {
        clientData = await prisma.client.create({
          data: { fullName, email, phoneNumber },
        });
      }
    } else {
      throw new Error(
        "Informations d'utilisateur/client manquantes pour la réservation."
      );
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

    const bookingOptionsData = options.map((opt) => {
      const optionMeta = optionDetails.find((o) => o.id === opt.optionId);
      if (!optionMeta) throw new Error("Option invalide.");

      //const subtotal = optionMeta.amount * opt.quantity;
      const subtotal = optionMeta.unitPrice * opt.quantity;

      return {
        quantity: opt.quantity,
        unitPrice: optionMeta.unitPrice,
        amount: subtotal,
        label: optionMeta.label,
        description: optionMeta.description ?? "",
        option: { connect: { id: opt.optionId } },
      };
    });

    const selectedOptionsForCalc = options.map((opt) => {
      const optionMeta = optionDetails.find((o) => o.id === opt.optionId);
      if (!optionMeta) throw new Error("Option invalide.");

      return {
        unitPrice: optionMeta.amount,
        quantity: opt.quantity,
      };
    });

    const { totalAmount, payableOnBoard } = calculateBookingTotal({
      basePrice: boatAmount,
      withCaptain,
      captainPrice: service.captainPrice ?? 350,
      selectedOptions: selectedOptionsForCalc,
    });

    const booking = await prisma.booking.create({
      data: {
        clientId: clientData?.id,
        userId: actualUserId,
        description: comment || "",
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
        totalAmount,
        payableOnBoard,
        stripePaymentLink: "",
        email: clientData?.email ?? email ?? "",
        mealOption,
        updatedAt: new Date(),
        bookingOptions: {
          create: bookingOptionsData,
        },
      },
      include: {
        bookingOptions: { include: { option: true } },
        client: true,
        user: true,
        service: true,
      },
    });

    const domainUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const checkoutUrl = await createStripeCheckoutSession(
      booking.id,
      domainUrl
    );

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        stripePaymentLink: checkoutUrl,
      },
      include: {
        bookingOptions: { include: { option: true } },
        client: true,
        user: true,
        service: true,
      },
    });

    let token: string | undefined;
    if (updatedBooking?.id) {
      token = await generateBookingToken(
        updatedBooking.id,
        updatedBooking.clientId ?? undefined,
        updatedBooking.userId ?? undefined
      );
    }

    return { booking: updatedBooking, token };
  } catch (err) {
    console.error("❌ Erreur createBooking:", err);
    throw new Error("Erreur lors de la création de la réservation.");
  }
}
//////////
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
          serviceId,
          reservedAt: reservedAtDate,
          id: { not: parseInt(bookingId, 10) },
          OR: [
            {
              startTime: { lte: endTimeDate },
              endTime: { gte: startTimeDate },
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
      service: serviceId ? { connect: { id: serviceId } } : undefined, // Utilisation de 'Service' avec 'connect'
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

      // Annuler le paiement si pas encore capturé
      await stripe.paymentIntents.cancel(booking.stripePaymentLink);
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
      where: {
        userId: userId,
      },
      include: {
        service: true,
        user: true,
        client: true,
        bookingOptions: {
          include: { option: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return bookings.map((booking) => {
      const enrichedService = booking.service
        ? {
            ...booking.service,
            description: booking.service.description ?? undefined,
            categories: booking.service.categories ?? [],
            imageUrl: booking.service.imageUrl ?? "",
            active: booking.service.active ?? true,
          }
        : null;

      return {
        ...booking,
        startTime: new Date(booking.startTime),
        endTime: new Date(booking.endTime),
        clientId: booking.clientId ?? null,
        stripePaymentLink: booking.stripePaymentLink ?? undefined,
        service: enrichedService,
        options: booking.bookingOptions.map((bookingOption) => ({
          id: bookingOption.optionId,
          label: bookingOption.label,
          quantity: bookingOption.quantity,
          unitPrice: bookingOption.unitPrice,
          description: bookingOption.description ?? null,
          amount: bookingOption.unitPrice,
          createdAt: bookingOption.option?.createdAt ?? new Date(),
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
      service: true,
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
    service: booking.service
      ? {
          ...booking.service,
          description: booking.service.description ?? undefined,
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
      service: true,
      bookingOptions: true,
      transactions: true,
    },
  });
};
/////////////////////
// Récupérer toutes les réservations

export const getBookings = async (userId?: string): Promise<Booking[]> => {
  const bookings = await prisma.booking.findMany({
    where: userId ? { user: { clerkUserId: userId } } : {},
    include: {
      service: true,
      user: {
        include: {
          client: true,
        },
      },
      client: true,
      bookingOptions: {
        include: { option: true },
      },
    },
  });

  return bookings.map((booking) => {
    // Récupérer le téléphone, priorité : booking.client.phoneNumber, sinon user.client.phoneNumber
    const phoneNumber =
      booking.client?.phoneNumber ||
      booking.user?.client?.phoneNumber ||
      booking.user?.phoneNumber ||
      null;

    return {
      ...booking,
      phoneNumber, // ici on ajoute explicitement
      createdAt: booking.createdAt ? new Date(booking.createdAt) : null,
      updatedAt: booking.updatedAt ? new Date(booking.updatedAt) : null,
      expiresAt: booking.expiresAt ? new Date(booking.expiresAt) : null,
      reservedAt: booking.reservedAt ? new Date(booking.reservedAt) : null,
      service: booking.service
        ? {
            ...booking.service,
            description: booking.service.description ?? undefined,
          }
        : null,
      clientId: booking.clientId ?? undefined,
    };
  }) as Booking[];
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
        service: true,
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
      service: booking.service,
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
        service: true,
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
      service: booking.service,
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
          amount: option.amount * quantity, // Ajout de la propriété amount ici
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
