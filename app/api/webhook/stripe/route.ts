import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  console.log("✅ Webhook Stripe reçu !");

  const body = await req.text();

  const headerList = await headers();
  const signature = headerList.get("stripe-signature") as string;

  if (!signature) {
    return new Response("Signature Stripe manquante", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch {
    return new Response("Webhook error", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.metadata?.bookingId) {
          return new Response("Booking ID missing", { status: 400 });
        }

        const bookingId = session.metadata.bookingId;
        console.log("✅ Paiement réussi pour la réservation ");

        // Vérifier si la réservation existe et est approuvée
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
        });

        if (!booking || booking.status !== "APPROVED") {
          console.error("❌ Réservation invalide ou non approuvée.");
          return new Response("Invalid booking", { status: 400 });
        }

        if (!session.payment_intent) {
          console.error("❌ Payment Intent manquant.");
          return new Response("Payment Intent missing", { status: 400 });
        }

        const paymentIntentId = session.payment_intent as string;

        // Vérifier que le montant est défini avant de l'utiliser
        if (!session.amount_total) {
          console.error("❌ Montant total manquant dans la session.");
          return new Response("Amount total missing", { status: 400 });
        }

        // ✅ Mettre à jour la réservation en "PAID"
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "PAID",
            stripePaymentIntentId: paymentIntentId,
          },
        });

        // ✅ Enregistrer la transaction dans la base de données
        await prisma.transaction.create({
          data: {
            bookingId,
            amount: session.amount_total / 100, // Convertir centimes en devise
            description: `Paiement Stripe réussi (${session.id})`,
            createdAt: new Date(), // Ajout de la date de transaction
          },
        });

        console.log(
          "✅ Paiement validé et transaction enregistrée pour la réservation "
        );
        break;
      }

      case "payment_intent.payment_failed": {
        console.warn("❌ Paiement échoué.");
        break;
      }

      default:
        console.log("ℹ️ Événement Stripe non géré ");
    }
  } catch {
    return new Response("Erreur Webhook", { status: 500 });
  }

  return new Response("Webhook reçu", { status: 200 });
}
