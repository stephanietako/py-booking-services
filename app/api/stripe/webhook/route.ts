import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!endpointSecret) {
  throw new Error("❌ STRIPE_WEBHOOK_SECRET is missing in environment");
}

export async function POST(req: NextRequest) {
  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      endpointSecret as string
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingIdRaw = session.metadata?.bookingId;

    if (!bookingIdRaw) {
      console.error("⚠️ bookingId is missing from Stripe metadata");
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    const bookingId = Number(bookingIdRaw);

    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        console.error("❌ Booking not found.");
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      if (booking.paymentStatus === "PAID") {
        console.log("✅ Booking already marked as paid.");
        return NextResponse.json({ message: "Already paid" });
      }

      const existingTx = await prisma.transaction.findFirst({
        where: { bookingId },
      });

      if (existingTx) {
        console.log("🔁 Payment already processed for this booking.");
        return NextResponse.json({ message: "Already processed" });
      }

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "PAID",
          paymentStatus: "PAID",
        },
      });

      await prisma.transaction.create({
        data: {
          bookingId,
          amount: booking.totalAmount,
          description: `Paiement Stripe de la réservation #${booking.id}`,
          paymentStatus: "PAID",
        },
      });

      console.log(`✅ Paiement confirmé pour la réservation #${bookingId}`);
      return NextResponse.json({ message: "Webhook handled" }, { status: 200 });
    } catch (err) {
      console.error("❌ Error during Stripe handling:", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "Event ignored" }, { status: 200 });
}
