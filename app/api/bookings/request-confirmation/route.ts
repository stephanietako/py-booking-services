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

    console.log("📌 Requête reçue avec succès");

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true }, // On inclut l'utilisateur pour comparer son ID Clerk
    });

    if (!booking) {
      console.error("⛔ Réservation introuvable.");
      return NextResponse.json(
        { error: "Réservation introuvable" },
        { status: 404 }
      );
    }

    if (booking.user.clerkUserId !== userId) {
      // Vérifie bien avec `clerkUserId`
      console.error("⛔ Accès refusé : L'utilisateur ne correspond pas !");
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    console.log("✅ Accès autorisé, envoi d'email...");

    await sendEmailToAdmin({ bookingId, userEmail: booking.user.email });

    return NextResponse.json({
      message: "Demande de confirmation envoyée avec succès.",
    });
  } catch (error) {
    console.error("❌ Erreur lors du traitement de la requête :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
