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

      // ✅ CORRECTION : Ajout de l'include pour transactions
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          service: true,
          bookingOptions: {
            include: { option: true },
          },
          client: true,
          user: true,
          transactions: true, // ✅ Ajouté pour correspondre au type BookingWithDetails
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

      // ✅ Sélection du numéro de téléphone
      const resolvedPhoneNumber =
        booking.user?.phoneNumber?.trim() ||
        booking.client?.phoneNumber?.trim() ||
        "";

      // ✅ Construction de la réponse qui correspond exactement au type BookingWithDetails
      const bookingWithDetails: BookingWithDetails = {
        id: booking.id,
        status: booking.status,
        approvedByAdmin: booking.approvedByAdmin,
        reservedAt: booking.reservedAt,
        startTime: booking.startTime,
        endTime: booking.endTime,
        withCaptain: booking.withCaptain,
        boatAmount: booking.boatAmount,
        payableOnBoard: booking.payableOnBoard,
        totalAmount: booking.totalAmount,
        expiresAt: booking.expiresAt,
        updatedAt: booking.updatedAt,
        createdAt: booking.createdAt,
        stripePaymentLink: booking.stripePaymentLink,
        clientId: booking.clientId,
        userId: booking.userId,
        serviceId: booking.serviceId,
        mealOption: booking.mealOption,
        description: booking.description,
        email: booking.email,
        stripeSessionId: booking.stripeSessionId,
        stripePaymentIntentId: booking.stripePaymentIntentId,
        paymentStatus: booking.paymentStatus,
        invoiceSent: booking.invoiceSent,
        // Relations
        service: booking.service,
        client: booking.client,
        user: booking.user,
        bookingOptions: booking.bookingOptions, // Déjà typé correctement grâce à l'include
        transactions: booking.transactions, // ✅ Maintenant inclus
        // Propriété calculée
        phoneNumber: resolvedPhoneNumber,
      };

      return NextResponse.json({
        data: bookingWithDetails,
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
