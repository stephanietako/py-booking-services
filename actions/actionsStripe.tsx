"use server";

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// ✅ Créer une session Stripe Checkout à partir d'une réservation
export const createStripeCheckoutSession = async (
  bookingId: number,
  domainUrl: string
): Promise<string> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      Service: true,
      bookingOptions: {
        include: {
          option: true,
        },
      },
    },
  });

  if (!booking) throw new Error("Réservation introuvable.");
  if (!booking.user?.stripeCustomerId) {
    throw new Error("Client Stripe non trouvé pour l'utilisateur.");
  }
  if (!booking.Service) throw new Error("Service introuvable.");

  const line_items = [];

  // 1. Ligne pour le bateau
  line_items.push({
    price_data: {
      currency: booking.Service.currency,
      product_data: {
        name: `Location bateau : ${booking.Service.name}`,
      },
      unit_amount: Math.round(booking.boatAmount * 100),
    },
    quantity: 1,
  });

  // 2. Options à payer en ligne
  for (const bo of booking.bookingOptions) {
    if (bo.option.payableOnline) {
      line_items.push({
        price_data: {
          currency: booking.Service.currency,
          product_data: {
            name: `Option : ${bo.label}`,
          },
          unit_amount: Math.round(bo.unitPrice * 100),
        },
        quantity: bo.quantity,
      });
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: booking.user.stripeCustomerId,
    billing_address_collection: "auto",
    line_items,
    payment_method_types: ["card"],
    metadata: {
      bookingId: String(bookingId),
    },
    success_url: `${domainUrl}/dashboard/payment/success?booking=${bookingId}`,
    cancel_url: `${domainUrl}/dashboard/payment/cancel?booking=${bookingId}`,
  });

  return session.url!;
};

// ✅ Récupérer le Stripe Customer ID d’un utilisateur
export const getDataStripeUser = async (clerkUserId: string) => {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { stripeCustomerId: true },
  });

  if (!user) throw new Error("Utilisateur non trouvé.");
  return user;
};

// ✅ Créer une session pour le portail Stripe (facturation & historique)
export async function createStripePortalSession(
  stripeCustomerId: string,
  domainUrl: string,
  bookingId: string
) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${domainUrl}/manage-booking/${bookingId}`,
    });

    return session.url;
  } catch {
    console.error(
      "Erreur lors de la création de la session du portail Stripe."
    );
    throw new Error("Impossible de créer la session du portail Stripe.");
  }
}

// ✅ Marquer la réservation comme payée après webhook Stripe
export async function updateBookingStatusToPaid(bookingId: string) {
  try {
    return await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: { status: "PAID", paymentStatus: "PAID" },
    });
  } catch {
    console.error("Erreur lors de la mise à jour du statut à PAID.");
    throw new Error("Impossible de mettre à jour le statut à PAID.");
  }
}
