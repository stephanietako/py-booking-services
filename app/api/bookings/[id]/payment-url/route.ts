import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    // 🔍 Extraction de l'ID depuis l'URL
    const url = new URL(req.url);
    const match = url.pathname.match(/\/bookings\/(\d+)\/payment-url/);
    const bookingId = match ? parseInt(match[1], 10) : NaN;

    const domainUrl = process.env.DOMAIN_URL;
    if (!domainUrl) {
      return NextResponse.json(
        { error: "DOMAIN_URL manquant dans l'environnement." },
        { status: 500 }
      );
    }

    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: "ID de réservation invalide." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        Service: true,
      },
    });

    if (!booking || !booking.user || !booking.Service) {
      return NextResponse.json(
        { error: "Réservation ou données associées introuvables." },
        { status: 404 }
      );
    }

    if (!booking.Service.currency) {
      return NextResponse.json(
        { error: "Devise du service manquante." },
        { status: 400 }
      );
    }

    if (!booking.totalAmount || booking.totalAmount <= 0) {
      return NextResponse.json(
        { error: "Montant de la réservation invalide." },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer: booking.user.stripeCustomerId || undefined,
      line_items: [
        {
          price_data: {
            currency: booking.Service.currency,
            unit_amount: booking.totalAmount * 100,
            product_data: {
              name: `Réservation - ${booking.Service.name}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: String(booking.id),
      },
      success_url: `${domainUrl}/dashboard/payment/success`,
      cancel_url: `${domainUrl}/dashboard/payment/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(
      "❌ Erreur serveur lors de la création du lien Stripe :",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur lors de la création du lien Stripe." },
      { status: 500 }
    );
  }
}
