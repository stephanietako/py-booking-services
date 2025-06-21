import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send";

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

// async function handleCheckoutSessionCompleted(
//   session: Stripe.Checkout.Session
// ) {
//   const bookingId = session.metadata?.bookingId || session.metadata?.booking_id;
//   if (!bookingId) {
//     throw new Error("Booking ID manquant dans les métadonnées.");
//   }

//   // Récupérer la réservation avec les relations nécessaires pour l'email
//   const bookingWithClient = await prisma.booking.findUnique({
//     where: { id: parseInt(bookingId) },
//     include: {
//       client: true,
//       service: true, // ou Service selon ton schéma
//     },
//   });

//   if (!bookingWithClient) {
//     throw new Error(`Réservation ${bookingId} introuvable.`);
//   }

//   // Mise à jour de la réservation
//   await prisma.booking.update({
//     where: { id: parseInt(bookingId) },
//     data: {
//       paymentStatus: "PAID",
//       stripeSessionId: session.id,
//       stripePaymentIntentId: session.payment_intent as string,
//       updatedAt: new Date(),
//     },
//   });

//   console.log(`✅ Réservation ${bookingId} marquée comme payée`);

//   // 🔥 Envoi de l'email de confirmation
//   if (bookingWithClient?.client?.email) {
//     try {
//       await sendEmail({
//         to: bookingWithClient.client.email,
//         subject: "Votre paiement a bien été reçu – Yachting Day",
//         html: `
//           <div style="font-family: Arial, sans-serif; color: #333;">
//             <h2 style="color: #0056b3;">Merci pour votre paiement !</h2>
//             <p>Bonjour <strong>${bookingWithClient.client.fullName}</strong>,</p>
//             <p>Nous confirmons la bonne réception de votre paiement pour la réservation <strong>#${bookingWithClient.id}</strong> du service <strong>${bookingWithClient.service?.name}</strong>.</p>
//             <p>Votre réservation est désormais validée. Nous restons à votre disposition pour toute question.</p>
//             <p style="margin-top: 20px; color: #666;">Cordialement,<br/>L'équipe Yachting Day</p>
//           </div>
//         `,
//       });
//       console.log(
//         `📧 Email de confirmation envoyé à ${bookingWithClient.client.email}`
//       );
//     } catch (emailError) {
//       console.error("❌ Erreur envoi email:", emailError);
//       // L'erreur d'email ne doit pas faire échouer le webhook
//       // Le paiement est déjà traité avec succès
//     }
//   } else {
//     console.warn("⚠️ Pas d'email client trouvé pour la réservation", bookingId);
//   }
// }
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const bookingId = session.metadata?.bookingId || session.metadata?.booking_id;
  if (!bookingId) {
    throw new Error("Booking ID manquant dans les métadonnées.");
  }

  // Récupérer la réservation avec les relations nécessaires pour l'email
  const bookingWithClient = await prisma.booking.findUnique({
    where: { id: parseInt(bookingId) },
    include: {
      client: true,
      service: true,
    },
  });

  if (!bookingWithClient) {
    throw new Error(`Réservation ${bookingId} introuvable.`);
  }

  // Mise à jour de la réservation
  const updatedBooking = await prisma.booking.update({
    where: { id: parseInt(bookingId) },
    data: {
      paymentStatus: "PAID",
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Réservation ${bookingId} marquée comme payée`);

  // 🔥 AJOUT : Créer la transaction de paiement
  await prisma.transaction.create({
    data: {
      description: `Paiement réservation #${bookingId}`,
      amount: session.amount_total
        ? session.amount_total / 100
        : updatedBooking.totalAmount,
      bookingId: parseInt(bookingId),
      paymentStatus: "PAID",
    },
  });

  console.log(`✅ Transaction créée pour la réservation ${bookingId}`);
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
    // Récupérer les infos client pour l'email d'échec (optionnel)
    const bookingWithClient = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: {
        client: true,
        service: true,
      },
    });

    await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: {
        paymentStatus: "FAILED",
        updatedAt: new Date(),
      },
    });

    console.log(`⚠️ Réservation ${bookingId} marquée comme échec de paiement`);

    // 🔥 Optionnel : Email d'échec de paiement
    if (bookingWithClient?.client?.email) {
      try {
        await sendEmail({
          to: bookingWithClient.client.email,
          subject: "Problème avec votre paiement – Yachting Day",
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h2 style="color: #d32f2f;">Problème avec votre paiement</h2>
              <p>Bonjour <strong>${bookingWithClient.client.fullName}</strong>,</p>
              <p>Nous avons rencontré un problème avec le paiement de votre réservation <strong>#${bookingWithClient.id}</strong> du service <strong>${bookingWithClient.service?.name}</strong>.</p>
              <p>Veuillez nous contacter ou essayer de nouveau votre paiement.</p>
              <p style="margin-top: 20px; color: #666;">Cordialement,<br/>L'équipe Yachting Day</p>
            </div>
          `,
        });
        console.log(
          `📧 Email d'échec envoyé à ${bookingWithClient.client.email}`
        );
      } catch (emailError) {
        console.error("❌ Erreur envoi email échec:", emailError);
      }
    }
  } else {
    console.warn("⚠️ Booking ID introuvable dans metadata pour payment failed");
  }
}
