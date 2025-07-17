// app/api/stripe/webhooks/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send";
import { BookingWithDetails } from "@/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  console.log("🔄 Webhook Stripe reçu");

  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig || !endpointSecret) {
      return NextResponse.json(
        { error: "Signature ou secret du webhook manquant" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (error: unknown) {
      if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
        console.error("❌ Signature Stripe invalide :", error.message);
      } else if (error instanceof Error) {
        console.error(
          "❌ Erreur inattendue lors de la validation de l'événement :",
          error.message
        );
      } else {
        console.error(
          "❌ Erreur inconnue lors de la validation de l'événement :",
          error
        );
      }
      return NextResponse.json(
        { error: "Signature invalide ou événement malformé" },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      case "payment_intent.succeeded":
        console.log(
          `ℹ️ Événement 'payment_intent.succeeded' reçu mais ignoré pour la mise à jour de réservation.`
        );
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(
          `ℹ️ Événement Stripe non géré explicitement : ${event.type}`
        );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Erreur de traitement du webhook :", error.message);
    } else {
      console.error(
        "❌ Erreur inconnue lors du traitement du webhook :",
        error
      );
    }
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const bookingId = session.metadata?.bookingId || session.metadata?.booking_id;
  if (!bookingId) {
    console.error(
      "❌ Booking ID manquant dans les métadonnées de la session Stripe."
    );
    throw new Error("Booking ID manquant dans les métadonnées.");
  }

  const bookingWithClient = (await prisma.booking.findUnique({
    where: { id: parseInt(bookingId) },
    include: {
      client: true,
      user: true,
      service: true,
      bookingOptions: {
        include: {
          option: true,
        },
      },
    },
  })) as BookingWithDetails | null;

  if (!bookingWithClient) {
    console.error(`❌ Réservation ${bookingId} introuvable après le paiement.`);
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
  console.log("✅ Réservation marquée comme payée");

  await prisma.transaction.create({
    data: {
      description: `Paiement réservation #${bookingId}`,
      amount: session.amount_total
        ? session.amount_total / 100
        : bookingWithClient.totalAmount,
      bookingId: parseInt(bookingId),
      paymentStatus: "PAID",
    },
  });
  console.log("✅ Transaction créée ");

  const token = await generateAndStoreSuccessToken(session, bookingWithClient);

  await sendConfirmationEmail(bookingWithClient, token);
}

async function generateAndStoreSuccessToken(
  session: Stripe.Checkout.Session,
  booking: BookingWithDetails
) {
  try {
    const tokenResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/bookings/generate-success-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("❌ Réponse non OK de generate-success-token");
      throw new Error(`Impossible de générer le token de succès: ${errorText}`);
    }

    const { token } = await tokenResponse.json();
    console.log("✅ Token de succès généré pour la réservation ");

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        updatedAt: new Date(),
      },
    });

    return token;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la génération du token de succès :",
      error
    );
    throw error;
  }
}

async function sendConfirmationEmail(
  booking: BookingWithDetails,
  token: string
) {
  const customerEmail = booking.client?.email || booking.user?.email || "";
  if (!customerEmail) {
    console.warn(
      "⚠️ Aucun email disponible pour l'envoi de confirmation pour la réservation "
    );
    return;
  }
  const customerName =
    booking.client?.fullName || booking.user?.name || "Client";

  try {
    const successLink = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?token=${token}`;

    await sendEmail({
      to: customerEmail,
      subject: "✅ Confirmation de votre réservation – Yachting Day",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🚤 Yachting Day</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #2c3e50;">✅ Réservation confirmée !</h2>
            <p>Bonjour <strong>${customerName}</strong>,</p>
            <p>Votre paiement a été confirmé avec succès. Voici les détails de votre réservation :</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #34495e; margin-top: 0;">📋 Détails de la réservation</h3>
              <p><strong>Référence:</strong> #${booking.id}</p>
              <p><strong>Service:</strong> ${booking.service?.name}</p>
              <p><strong>Date:</strong> ${new Date(booking.reservedAt).toLocaleDateString("fr-FR")}</p>
              <p><strong>Horaire:</strong> ${new Date(booking.startTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} - ${new Date(booking.endTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
              <p><strong>Montant total:</strong> ${booking.totalAmount}€</p>
              ${booking.payableOnBoard > 0 ? `<p><strong>À payer sur place:</strong> ${booking.payableOnBoard}€</p>` : ""}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${successLink}" 
                 style="background: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                📄 Voir les détails complets
              </a>
            </div>

            <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="color: #27ae60; margin-top: 0;">🎯 Prochaines étapes</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li>✅ Votre paiement est confirmé</li>
                <li> Nous vous contacterons pour finaliser les détails</li>
                <li>🚤 Préparez-vous pour une expérience inoubliable !</li>
                ${booking.payableOnBoard > 0 ? `<li>💰 N'oubliez pas : ${booking.payableOnBoard}€ à régler sur place</li>` : ""}
              </ul>
            </div>

            <p style="color: #7f8c8d; font-size: 0.9em; margin-top: 30px;">
              Si vous avez des questions, n'hésitez pas à nous contacter.<br/>
              Cordialement,<br/>
              <strong>L'équipe Yachting Day</strong>
            </p>
          </div>
        </div>
      `,
    });

    console.log("📧 Email de confirmation envoyé ");
  } catch (emailError) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email de confirmation :",
      emailError
    );
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntent.id,
    limit: 1,
  });

  const session = sessions.data[0];
  const bookingId =
    session?.metadata?.bookingId ||
    session?.metadata?.booking_id ||
    paymentIntent.metadata?.bookingId ||
    paymentIntent.metadata?.booking_id;

  if (bookingId) {
    const bookingWithClient = (await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: {
        client: true,
        user: true,
        service: true,
      },
    })) as BookingWithDetails | null;

    if (!bookingWithClient) {
      console.warn(
        "⚠️ Réservation ${bookingId} introuvable lors de l'échec de paiement"
      );
      return;
    }

    await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: {
        paymentStatus: "FAILED",
        updatedAt: new Date(),
      },
    });

    console.log("⚠️ Réservation  marquée comme échec de paiement");

    const customerEmail =
      bookingWithClient.client?.email || bookingWithClient.user?.email || "";
    const customerName =
      bookingWithClient.client?.fullName ||
      bookingWithClient.user?.name ||
      "Client";

    if (customerEmail) {
      try {
        await sendEmail({
          to: customerEmail,
          subject: "❌ Problème avec votre paiement – Yachting Day",
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h2 style="color: #d32f2f;">❌ Problème avec votre paiement</h2>
              <p>Bonjour <strong>${customerName}</strong>,</p>
              <p>Nous avons rencontré un problème avec le paiement de votre réservation <strong>#${bookingWithClient.id}</strong> du service <strong>${bookingWithClient.service?.name}</strong>.</p>
              <p>Veuillez nous contacter ou essayer de nouveau votre paiement.</p>
              <p style="margin-top: 20px; color: #666;">Cordialement,<br/>L'équipe Yachting Day</p>
            </div>
          `,
        });
        console.log("📧 Email d'échec envoyépour la réservation ");
      } catch (emailError) {
        console.error(
          "❌ Erreur lors de l'envoi de l'email d'échec :",
          emailError
        );
      }
    } else {
      console.warn(
        "⚠️ Aucun email disponible pour l'envoi d'échec de confirmation pour la réservation :"
      );
    }
  } else {
    console.warn(
      "⚠️ Booking ID introuvable dans metadata pour payment failed. Impossible de lier à une réservation."
    );
  }
}
