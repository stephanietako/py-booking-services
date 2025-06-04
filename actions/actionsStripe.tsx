// action/actionsStripe.tsx
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getStripeCustomerIdForBooking } from "@/utils/stripe";

// Crée une session de paiement Stripe pour une réservation
export const createStripeCheckoutSession = async (
  bookingId: number,
  domainUrl: string
): Promise<string> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      client: true,
      Service: true,
    },
  });

  if (!booking) throw new Error("Réservation introuvable.");
  if (!booking.Service) throw new Error("Service introuvable.");
  if (!booking.Service.currency) throw new Error("Devise manquante.");

  // ✅ nouvelle logique : récupère ou crée un Stripe Customer ID
  const stripeCustomerId = await getStripeCustomerIdForBooking(booking);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: stripeCustomerId,
    billing_address_collection: "auto",
    line_items: [
      {
        price_data: {
          currency: booking.Service.currency,
          product_data: {
            name: `Location bateau : ${booking.Service.name}`,
          },
          unit_amount: Math.round(booking.boatAmount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: String(booking.id),
    },
    success_url: `${domainUrl}/payment/success?booking=${bookingId}`,
    cancel_url: `${domainUrl}/payment/cancel?booking=${bookingId}`,
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      stripeSessionId: session.id,
      stripePaymentLink: session.url,
      paymentStatus: "PENDING",
    },
  });

  return session.url!;
};
