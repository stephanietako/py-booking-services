import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { format } from "date-fns";

export async function createStripeCheckoutSession(
  bookingId: number,
  stripeCustomerId: string
): Promise<string> {
  try {
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

    const lineItems = [
      {
        price_data: {
          currency: booking.service?.currency || "eur",
          product_data: {
            name: booking.service?.name || "Réservation bateau",
            description: `Réservation du ${format(booking.startTime, "dd/MM/yyyy")} de ${format(booking.startTime, "HH:mm")} à ${format(booking.endTime, "HH:mm")}`,
          },
          unit_amount: Math.round(booking.boatAmount * 100),
        },
        quantity: 1,
      },
    ];

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

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",

      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,

      metadata: {
        bookingId: bookingId.toString(),
        customerId: stripeCustomerId,
        type: "booking_payment",
      },
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

    await prisma.booking.update({
      where: { id: bookingId },
      data: { stripeSessionId: session.id },
    });

    console.log("Stripe Checkout Session créée avec succès");

    return session.url;
  } catch (error) {
    console.error("Erreur createStripeCheckoutSession:", error);
    throw new Error("Erreur lors de la création de la session de paiement");
  }
}
