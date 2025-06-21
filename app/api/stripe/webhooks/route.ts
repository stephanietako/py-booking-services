import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil", // Version stable - changez de "2025-05-28.basil"
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  console.log("🔄 Webhook Stripe reçu");

  // Debug logs au début
  console.log("🔍 STRIPE_SECRET_KEY défini:", !!process.env.STRIPE_SECRET_KEY);
  console.log(
    "🔍 STRIPE_WEBHOOK_SECRET défini:",
    !!process.env.STRIPE_WEBHOOK_SECRET
  );
  console.log("🔍 URL appelée:", request.url);

  try {
    // Méthode simplifiée pour récupérer le body brut
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig || !endpointSecret) {
      console.log("❌ Signature ou secret manquant");
      return NextResponse.json(
        { error: "Signature ou secret manquant" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
      console.log("✅ Signature validée :", event.type);
    } catch (error: unknown) {
      if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
        console.error("❌ Signature Stripe invalide :", error.message);
      } else if (error instanceof Error) {
        console.error(
          "❌ Erreur inattendue lors de la validation :",
          error.message
        );
      } else {
        console.error("❌ Erreur inconnue lors de la validation :", error);
      }
      return NextResponse.json(
        { error: "Signature invalide" },
        { status: 400 }
      );
    }

    // Traitement des événements
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`ℹ️ Événement ignoré : ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Erreur de traitement :", error.message);
    } else {
      console.error("❌ Erreur inconnue :", error);
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const bookingId = session.metadata?.bookingId || session.metadata?.booking_id;
  if (!bookingId) {
    throw new Error("Booking ID manquant dans les métadonnées.");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parseInt(bookingId) },
  });
  if (!booking) {
    throw new Error(`Réservation ${bookingId} introuvable.`);
  }

  await prisma.booking.update({
    where: { id: parseInt(bookingId) },
    data: {
      paymentStatus: "PAID",
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Réservation ${bookingId} marquée comme payée`);
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntent.id,
    limit: 1,
  });

  const session = sessions.data[0];
  if (session) {
    await handleCheckoutSessionCompleted(session);
  } else {
    console.warn("⚠️ Aucune session liée au paiement.");
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntent.id,
    limit: 1,
  });

  const session = sessions.data[0];
  const bookingId =
    session?.metadata?.bookingId || session?.metadata?.booking_id;

  if (bookingId) {
    await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: {
        paymentStatus: "FAILED",
        updatedAt: new Date(),
      },
    });
    console.log(`⚠️ Réservation ${bookingId} marquée comme échec de paiement`);
  } else {
    console.warn("⚠️ Booking ID introuvable dans metadata pour payment failed");
  }
}
