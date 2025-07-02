// app/api/bookings/generate-success-token/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const secret = process.env.JWT_SECRET;

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId requis" }, { status: 400 });
    }

    if (!secret) {
      return NextResponse.json(
        { error: "Configuration serveur incorrecte" },
        { status: 500 }
      );
    }

    // Chercher la réservation uniquement par stripeSessionId
    const booking = await prisma.booking.findFirst({
      where: { stripeSessionId: sessionId },
    });

    if (!booking) {
      console.error("❌ Réservation introuvable pour sessionId:", sessionId);
      return NextResponse.json(
        { error: "Réservation introuvable" },
        { status: 404 }
      );
    }

    if (booking.paymentStatus !== "PAID") {
      console.warn(
        "⚠️ Paiement non confirmé (statut PENDING) pour la réservation:",
        booking.id
      );

      return NextResponse.json(
        { error: "Paiement non confirmé ou en attente" },
        { status: 400 }
      );
    }

    // Générer un token temporaire (expire dans 1 heure)
    const token = jwt.sign(
      {
        bookingId: booking.id,
        sessionId,
        type: "payment_success",
        clientId: booking.clientId,
        userId: booking.userId,
      },
      secret,
      { expiresIn: "1h" }
    );

    console.log("✅ Token généré avec succès pour la réservation:", booking.id);

    return NextResponse.json({
      token,
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("❌ Erreur génération token succès:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
