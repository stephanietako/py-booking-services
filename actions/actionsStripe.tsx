import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { format } from "date-fns";

export async function createStripeCheckoutSession(
  bookingId: number,
  domainUrl: string,
  stripeCustomerId: string
): Promise<string> {
  try {
    // Récupérer les détails de la réservation
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        bookingOptions: {
          include: { option: true },
        },
      },
    });

    if (!booking) {
      throw new Error("Réservation introuvable");
    }

    // Créer les line items pour Stripe
    const lineItems = [
      {
        price_data: {
          currency: booking.service?.currency || "eur",
          product_data: {
            name: booking.service?.name || "Réservation bateau",
            description: `Réservation du ${format(booking.startTime, "dd/MM/yyyy")} de ${format(booking.startTime, "HH:mm")} à ${format(booking.endTime, "HH:mm")}`,
          },
          unit_amount: Math.round(booking.boatAmount * 100), // Stripe utilise les centimes
        },
        quantity: 1,
      },
    ];

    // Ajouter les options payables en ligne s'il y en a
    booking.bookingOptions?.forEach((option) => {
      if (option.option.payableOnline) {
        lineItems.push({
          price_data: {
            currency: booking.service?.currency || "eur",
            product_data: {
              name: option.label,
              description: option.description || "",
            },
            unit_amount: Math.round(option.unitPrice * 100),
          },
          quantity: option.quantity,
        });
      }
    });

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${domainUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${domainUrl}/booking/cancel?booking_id=${bookingId}`,
      metadata: {
        bookingId: bookingId.toString(),
        customerId: stripeCustomerId,
        type: "booking_payment",
      },
      // ✅ AJOUT IMPORTANT : Transférer les métadonnées au Payment Intent
      payment_intent_data: {
        metadata: {
          bookingId: bookingId.toString(),
          customerId: stripeCustomerId,
          type: "booking_payment",
        },
      },
    });

    if (!session.url) {
      throw new Error("Erreur lors de la création de la session Stripe");
    }

    // Mettre à jour la réservation avec l'ID de session
    await prisma.booking.update({
      where: { id: bookingId },
      data: { stripeSessionId: session.id },
    });

    console.log(`✅ Session Stripe créée avec métadonnées:`, {
      bookingId: bookingId.toString(),
      sessionId: session.id,
    });

    return session.url;
  } catch (error) {
    console.error("Erreur createStripeCheckoutSession:", error);
    throw new Error("Erreur lors de la création de la session de paiement");
  }
}
