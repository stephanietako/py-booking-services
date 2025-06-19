// app/api/bookings/verify-token/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { TokenExpiredError } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { BookingWithDetails, BookingTokenPayload } from "@/types";

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
      const decoded = jwt.verify(token, secret) as BookingTokenPayload;

      if (!decoded.bookingId) {
        return NextResponse.json(
          { error: "Token invalide : ID de réservation manquant" },
          { status: 400 }
        );
      }

      const bookingId = decoded.bookingId;

      const booking: BookingWithDetails | null =
        await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            service: true,
            bookingOptions: {
              include: { option: true },
            },
            client: true,
            user: true,
          },
        });

      if (
        !booking ||
        !(
          (decoded.clientId && booking.clientId === decoded.clientId) ||
          (decoded.userId && booking.userId === decoded.userId)
        )
      ) {
        return NextResponse.json(
          { error: "Accès refusé à cette réservation" },
          { status: 403 }
        );
      }

      console.log("Booking récupérée:", booking);
      console.log("📞 USER DATA:", booking?.user);

      // ✅ CORRECTION ICI : Sélection du numéro de téléphone
      const resolvedPhoneNumber =
        // Si l'utilisateur est présent ET son numéro n'est pas vide, on le prend
        booking.user?.phoneNumber && booking.user.phoneNumber !== ""
          ? booking.user.phoneNumber
          : // Sinon, si le client est présent ET son numéro n'est pas vide, on le prend
            booking.client?.phoneNumber && booking.client.phoneNumber !== ""
            ? booking.client.phoneNumber
            : // Sinon, aucun numéro n'est disponible
              null;

      return NextResponse.json({
        data: {
          id: booking.id,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          withCaptain: booking.withCaptain,
          mealOption: booking.mealOption,
          boatAmount: booking.boatAmount,
          service: booking.service,
          bookingOptions: booking.bookingOptions,
          client: booking.client || null,
          user: booking.user || null,
          phoneNumber: resolvedPhoneNumber, // Utilisation du numéro résolu
          userId: booking.userId ?? null,
          stripePaymentLink: booking.stripePaymentLink ?? null,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          description: booking.description,
        },
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return NextResponse.json({ error: "Token expiré" }, { status: 401 });
      }
      console.error("Erreur de vérification du token :", error);
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }
  } catch (error) {
    console.error("Erreur interne dans /verify-token (global) :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
