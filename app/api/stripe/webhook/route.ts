import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";
import { refundEmailTemplate } from "@/lib/emails/refundsEmail";

export const dynamic = "force-dynamic";
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function buffer(readable: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  console.log("✅ Webhook Stripe reçu");

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req.body as ReadableStream);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Signature Stripe invalide:", err);
    return NextResponse.json(
      { error: "Invalid Stripe signature" },
      { status: 400 }
    );
  }

  const eventType = event.type;
  const obj = event.data.object as
    | Stripe.Checkout.Session
    | Stripe.PaymentIntent
    | Stripe.Charge;

  const metadata =
    "metadata" in obj && typeof obj.metadata === "object" ? obj.metadata : {};

  console.log(`ℹ️ Event reçu: ${eventType}`);
  console.log(`📦 Metadata:`, metadata);

  switch (eventType) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = Number(session.metadata?.bookingId);

      if (!bookingId) {
        console.warn("⚠️ bookingId manquant dans checkout.session.completed");
        return NextResponse.json(
          { error: "bookingId missing" },
          { status: 400 }
        );
      }

      try {
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { service: true },
        });

        if (!booking || booking.paymentStatus === "PAID") {
          return NextResponse.json(
            { message: "Booking already handled" },
            { status: 200 }
          );
        }

        const expectedAmount = Math.round(booking.boatAmount * 100);
        const actualAmount = session.amount_total;

        if (actualAmount !== expectedAmount) {
          console.error(
            `❌ Montant incorrect : attendu ${expectedAmount}, reçu ${actualAmount}`
          );
          return NextResponse.json(
            { error: "Montant incorrect" },
            { status: 400 }
          );
        }

        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "PAID",
            paymentStatus: "PAID",
            stripeSessionId: session.id,
          },
        });

        await prisma.transaction.create({
          data: {
            bookingId,
            amount: booking.boatAmount,
            description: `Paiement Stripe #${session.id}`,
            paymentStatus: "PAID",
          },
        });

        await prisma.transaction.updateMany({
          where: { bookingId, paymentStatus: "PENDING" },
          data: { paymentStatus: "PAID" },
        });

        const bookingWithClient = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { client: true, service: true },
        });

        if (bookingWithClient?.client?.email) {
          await sendEmail({
            to: bookingWithClient.client.email,
            subject: "Votre paiement a bien été reçu – Yachting Day",
            html: `
              <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #0056b3;">Merci pour votre paiement !</h2>
                <p>Bonjour <strong>${bookingWithClient.client.fullName}</strong>,</p>
                <p>Nous confirmons la bonne réception de votre paiement pour la réservation <strong>#${bookingWithClient.id}</strong> du service <strong>${bookingWithClient.service?.name}</strong>.</p>
                <p>Votre réservation est désormais validée. Nous restons à votre disposition pour toute question.</p>
                <p style="margin-top: 20px; color: #666;">Cordialement,<br/>L'équipe Yachting Day</p>
              </div>
            `,
          });
        }

        return NextResponse.json({ received: true });
      } catch (err) {
        console.error("❌ Erreur lors du traitement:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
      }
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const bookingId = Number(charge.metadata?.bookingId);

      if (!bookingId) {
        console.warn("⚠️ bookingId manquant dans le refund");
        break;
      }

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: "REFUNDED",
          status: "CANCELLED",
        },
      });

      await prisma.transaction.create({
        data: {
          bookingId,
          amount: -Math.abs(charge.amount / 100),
          description: `Remboursement Stripe #${charge.id}`,
          paymentStatus: "REFUNDED",
        },
      });

      const bookingWithClient = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { client: true, service: true },
      });

      if (bookingWithClient?.client?.email) {
        await sendEmail({
          to: bookingWithClient.client.email,
          subject: "Votre remboursement a été effectué – Yachting Day",
          html: refundEmailTemplate(
            bookingWithClient.client.fullName,
            bookingWithClient.id,
            bookingWithClient.service?.name
          ),
        });
      }

      break;
    }

    default:
      // Juste log + confirmation OK
      console.log(`ℹ️ Aucun traitement pour l'événement ${eventType}`);
      break;
  }

  return NextResponse.json({ received: true });
}
