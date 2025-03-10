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
  // Récupérer les détails du service depuis la base de données (prix, devise, etc.)
  const service = await getServicePriceWithName(serviceId);

  // Si le service n'existe pas ou n'a pas de prix, renvoyer une erreur
  if (!service) {
    throw new Error("Service non trouvé");
  }

  // Crée une session Stripe avec un prix dynamique basé sur le service
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    billing_address_collection: "auto",
    line_items: [
      {
        price_data: {
          currency: service.currency, // Devise du service
          product_data: {
            name: `Service: ${service.name}`, // Utilise le nom du service
          },
          unit_amount: service.price * 100, // Conversion en centimes
        },
        quantity: 1, // Quantité, ici 1 pour un paiement unique
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

// Fonction pour récupérer les données Stripe d'un utilisateur
export const getDataStripeUser = async (clerkUserId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: clerkUserId,
    },
    select: {
      stripeCustomerId: true,
    },
  });

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  return user;
};

// Fonction pour créer une session du portail Stripe
export async function createStripePortalSession(
  stripeCustomerId: string,
  domainUrl: string,
  bookingId: string // ID de la réservation
) {
  try {
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: stripeCustomerId }, // 👈 Cherche bien par Stripe ID
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      throw new Error("Utilisateur non trouvé ou pas de stripeCustomerId");
    }

    // Crée une session du portail Stripe avec une URL de redirection personnalisée
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

// Fonction pour créer une session de paiement Stripe Checkout
export const createStripeCheckoutSession = async (
  customerId: string,
  amount: number, // Montant de la réservation
  currency: string,
  serviceName: string, // Nom du service
  domainUrl: string, // URL du domaine
  bookingId: string // ID de la réservation pour les métadonnées
) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: serviceName, // Nom de la réservation ou service
            },
            unit_amount: amount * 100, // Montant en centimes
          },
          quantity: 1,
        },
      ],
      mode: "payment", // Mode de paiement
      customer: customerId, // Le client Stripe
      metadata: {
        bookingId: String(bookingId), // 🔥 Conversion explicite en string
      },
      success_url: `${domainUrl}/dashboard/payment/success`, // URL après paiement réussi
      cancel_url: `${domainUrl}/dashboard/payment/cancel`, // URL après annulation
    });

    return session.url; // L'URL de la session de paiement
  } catch {
    throw new Error("Erreur lors de la création de la session Stripe Checkout");
  }
};

// Mise à jour du statut après un paiement réussi via Stripe
export async function updateBookingStatusToPaid(bookingId: string) {
  try {
    // Mettre à jour le statut de la réservation à "PAID"
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "PAID",
      },
    });
    return updatedBooking;
  } catch {
    console.log("Erreur lors de la mise à jour du statut à PAID ");
    throw new Error("Impossible de mettre à jour le statut à PAID.");
  }
}

// Fonction pour récupérer le prix et la devise d'un service
export const getServicePriceWithName = async (serviceId: string) => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { price: true, currency: true, name: true },
  });

  if (!service) {
    throw new Error("Service non trouvé");
  }

  return service;
};
