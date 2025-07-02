// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    const sessionId = request.nextUrl.searchParams.get("session_id");

    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: "ID de réservation invalide" },
        { status: 400 }
      );
    }

    // Récupérer la réservation avec toutes les relations
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          select: {
            name: true,
            description: true,
          },
        },
        bookingOptions: {
          include: {
            option: true,
          },
        },
        client: {
          select: {
            fullName: true,
            email: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation introuvable" },
        { status: 404 }
      );
    }

    if (
      sessionId &&
      booking.stripeSessionId &&
      booking.stripeSessionId !== sessionId
    ) {
      return NextResponse.json(
        { error: "Session non valide" },
        { status: 403 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Erreur API bookings:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
