// app/api/stripe/webhook
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendInvoiceEmails } from "@/lib/emailService";

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
  console.log("Webhook Stripe reçu");
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

  const eventType = event.type as Stripe.Event["type"]; // ✅ Typage strict

  switch (eventType) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = Number(session.metadata?.bookingId);

      if (!bookingId) {
        console.warn("📭 bookingId manquant dans metadata", session.metadata);
        return NextResponse.json(
          { error: "bookingId missing" },
          { status: 400 }
        );
      }

      try {
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            Service: true,
          },
        });

        if (!booking || booking.paymentStatus === "PAID") {
          return NextResponse.json(
            { message: "Booking already handled" },
            { status: 200 }
          );
        }

        // ✅ Vérification du montant payé
        const expectedAmount = Math.round(booking.totalAmount * 100); // en centimes
        const actualAmount = session.amount_total;

        if (actualAmount !== expectedAmount) {
          console.error(
            `❌ Montant Stripe incorrect : attendu ${expectedAmount}, reçu ${actualAmount}`
          );
          return NextResponse.json(
            { error: "Montant payé non valide" },
            { status: 400 }
          );
        }

        // ✅ Vérification (optionnelle) de la devise (avec normalisation)
        const expectedCurrency = booking.Service?.currency;
        const expectedCurrencyNormalized = expectedCurrency?.toUpperCase();
        const receivedCurrency = session.currency?.toUpperCase();

        if (receivedCurrency !== expectedCurrencyNormalized) {
          console.warn(
            `⚠️ Devise différente : attendu ${expectedCurrencyNormalized}, reçu ${receivedCurrency}`
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
            amount: booking.totalAmount,
            description: `Paiement Stripe #${session.id}`,
            paymentStatus: "PAID",
          },
        });

        const fullBooking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            Service: true,
            client: true,
            bookingOptions: true,
          },
        });

        if (fullBooking) {
          const safeBooking = {
            ...fullBooking,
            service: {
              ...fullBooking.Service!,
              description: fullBooking.Service?.description ?? undefined,
            },
            bookingOptions: fullBooking.bookingOptions.map((opt) => ({
              ...opt,
              description: opt.description ?? undefined,
            })),
          };

          await sendInvoiceEmails(safeBooking);
        }

        return NextResponse.json({ received: true });
      } catch (err) {
        console.error("❌ Erreur traitement paiement:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
      }
    }

    default:
      console.log(`ℹ️ Événement ignoré : ${eventType}`);
      break;
  }

  return NextResponse.json({ received: true });
}
