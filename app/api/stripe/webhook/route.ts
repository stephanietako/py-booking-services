// app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
//import { sendConfirmationEmails } from "@/lib/sendEmails";

// ✅ Force le runtime Node.js (pas Edge)
export const dynamic = "force-dynamic";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// 🔄 Utilitaire pour convertir ReadableStream -> Buffer
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
  const sig = req.headers.get("stripe-signature");
  if (!sig)
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );

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

  // ✅ Traite les événements nécessaires
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = Number(session.metadata?.bookingId);

      if (!bookingId)
        return NextResponse.json(
          { error: "bookingId missing" },
          { status: 400 }
        );

      try {
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
        });
        if (!booking)
          return NextResponse.json(
            { error: "Booking not found" },
            { status: 404 }
          );

        if (booking.paymentStatus !== "PAID") {
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
          //await sendConfirmationEmails(bookingId);
        }

        return NextResponse.json({ received: true });
      } catch (err) {
        console.error("❌ Erreur Stripe:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
      }
    }

    default:
      console.log(`ℹ️ Ignored event type: ${event.type}`);
      return NextResponse.json({ message: "Event ignored" }, { status: 200 });
  }
}
