// app/api/admin/bookings/[id]/payment-url/route.ts
import { createStripeCheckoutSession } from "@/actions/actionsStripe";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;
  const bookingId = parseInt(id, 10);
  const domainUrl = process.env.DOMAIN_URL;

  if (!domainUrl || isNaN(bookingId)) {
    return NextResponse.json(
      { error: "Paramètres invalides." },
      { status: 400 }
    );
  }

  try {
    const url = await createStripeCheckoutSession(bookingId, domainUrl);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("❌ Erreur Stripe:", error);
    return NextResponse.json(
      { error: "Erreur serveur Stripe." },
      { status: 500 }
    );
  }
};
