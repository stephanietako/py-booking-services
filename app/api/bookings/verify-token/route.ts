// app/api/bookings/verify-token/route.ts
import { NextResponse } from "next/server";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { Booking } from "@/types";

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error("❌ JWT_SECRET est manquant dans l'environnement.");
}

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    if (!secret) {
      return NextResponse.json(
        { error: "Configuration serveur incorrecte" },
        { status: 500 }
      );
    }

    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;

      if (!decoded.bookingId) {
        return NextResponse.json(
          { error: "Token invalide : ID de réservation manquant" },
          { status: 400 }
        );
      }

      const bookingId = decoded.bookingId;
      let booking: Booking | null = null;

      if (decoded.clientId) {
        booking = await prisma.booking.findUnique({
          where: { id: bookingId, clientId: decoded.clientId },
          include: {
            Service: true,
            bookingOptions: {
              include: {
                option: true, // Inclure les détails de l'option
              },
            },
            client: true,
          },
        });
      } else if (decoded.userId) {
        booking = await prisma.booking.findUnique({
          where: { id: bookingId, userId: decoded.userId },
          include: {
            Service: true,
            bookingOptions: {
              include: {
                option: true, // Inclure les détails de l'option
              },
            },
            user: true,
          },
        });
      }

      if (!booking) {
        // 403 Forbidden, car token valide mais accès refusé
        return NextResponse.json(
          { error: "Accès refusé à cette réservation" },
          { status: 403 }
        );
      }

      return NextResponse.json({ data: booking });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return NextResponse.json({ error: "Token expiré" }, { status: 401 });
      }
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }
  } catch (error) {
    console.error("Erreur interne dans /verify-token :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
