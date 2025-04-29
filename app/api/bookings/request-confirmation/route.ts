export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmailToAdmin } from "@/actions/email";

interface RequestBody {
  userId: string;
  bookingId: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, bookingId }: RequestBody = await request.json();

    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      include: { user: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation introuvable" },
        { status: 404 }
      );
    }

    if (!booking.user || booking.user.clerkUserId !== userId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await sendEmailToAdmin({ bookingId, userEmail: booking.user.email });

    return NextResponse.json({
      message: "Demande de confirmation envoyée avec succès.",
    });
  } catch (error) {
    console.error("Erreur lors du traitement de la requête :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
