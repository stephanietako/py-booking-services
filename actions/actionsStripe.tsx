"use server";

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Fonction pour créer une session Stripe avec un prix dynamique basé sur un service spécifique
export const getStripeSession = async ({
  serviceId,
  domainUrl,
  customerId,
}: {
  serviceId: string;
  domainUrl: string;
  customerId: string;
}) => {
  const service = await getServicePriceWithName(serviceId);
  if (!service) throw new Error("Service non trouvé");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    billing_address_collection: "auto",
    line_items: [
      {
        price_data: {
          currency: service.currency,
          product_data: {
            name: `Service: ${service.name}`,
          },
          unit_amount: service.price * 100,
        },
        quantity: 1,
      },
    ],
    payment_method_types: ["card"],
    customer: customerId,
    customer_update: {
      address: "auto",
      name: "auto",
    },
    success_url: `${domainUrl}/dashboard/payment/success`,
    cancel_url: `${domainUrl}/dashboard/payment/cancel`,
  });

  return session.url as string;
};

export const getDataStripeUser = async (clerkUserId: string) => {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { stripeCustomerId: true },
  });

  if (!user) throw new Error("Utilisateur non trouvé");
  return user;
};

export async function createStripePortalSession(
  stripeCustomerId: string,
  domainUrl: string,
  bookingId: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      throw new Error("Utilisateur non trouvé ou pas de stripeCustomerId");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${domainUrl}/manage-booking/${bookingId}`,
    });

    return session.url;
  } catch {
    console.error("ℹ️ Une erreur s'est produite lors du traitement.");
    throw new Error("Impossible de créer la session du portail Stripe.");
  }
}

export const createStripeCheckoutSession = async (
  customerId: string,
  amount: number,
  currency: string,
  serviceName: string,
  domainUrl: string,
  bookingId: string
) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: serviceName },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer: customerId,
      metadata: {
        bookingId: String(bookingId),
      },
      success_url: `${domainUrl}/dashboard/payment/success`,
      cancel_url: `${domainUrl}/dashboard/payment/cancel`,
    });

    return session.url;
  } catch {
    throw new Error("Erreur lors de la création de la session Stripe Checkout");
  }
};

export async function updateBookingStatusToPaid(bookingId: string) {
  try {
    return await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: { status: "PAID" },
    });
  } catch {
    console.log("Erreur lors de la mise à jour du statut à PAID ");
    throw new Error("Impossible de mettre à jour le statut à PAID.");
  }
}

export const getServicePriceWithName = async (serviceId: string) => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { price: true, currency: true, name: true },
  });

  if (!service) throw new Error("Service non trouvé");
  return service;
};
