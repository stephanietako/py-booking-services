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
          where: { id: bookingId },
          include: {
            Service: true,
            bookingOptions: {
              include: {
                option: true,
              },
            },
            client: true,
          },
        });

        if (booking?.clientId !== decoded.clientId) {
          booking = null;
        }
      } else if (decoded.userId) {
        booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            Service: true,
            bookingOptions: {
              include: { option: true },
            },
            user: true,
          },
        });

        if (booking?.userId !== decoded.userId) {
          booking = null;
        }
      }

      if (!booking) {
        return NextResponse.json(
          { error: "Accès refusé à cette réservation" },
          { status: 403 }
        );
      }

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
