import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

// Définir un type personnalisé pour le payload JWT
interface CustomJwtPayload extends JwtPayload {
  bookingId: string;
  userId: string;
}

// Récupérer la clé secrète depuis les variables d'environnement
const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new Error("JWT_SECRET is missing in the environment variables");
}

export async function POST(req: NextRequest) {
  try {
    // Récupérer le token depuis le corps de la requête
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    // Vérifier et décoder le token JWT
    let decoded: CustomJwtPayload;
    try {
      const decodedToken = jwt.verify(token, secretKey as string) as unknown;
      decoded = decodedToken as CustomJwtPayload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return NextResponse.json({ error: "Token invalide" }, { status: 400 });
      }
      if (error instanceof jwt.TokenExpiredError) {
        return NextResponse.json({ error: "Token expiré" }, { status: 401 });
      }
      throw error;
    }

    // Vérifier que le token contient les informations nécessaires
    if (!decoded.bookingId || !decoded.userId) {
      return NextResponse.json({ error: "Token invalide" }, { status: 400 });
    }

    // Récupérer la réservation depuis la base de données
    const booking = await prisma.booking.findUnique({
      where: { id: Number(decoded.bookingId) },
      include: {
        user: true, // Inclure les informations de l'utilisateur
        Service: true, // Inclure les informations du service
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est autorisé à accéder à cette réservation
    if (!booking.user || booking.user.clerkUserId !== decoded.userId) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Réponse avec les informations nécessaires de la réservation
    return NextResponse.json(
      {
        userId: decoded.userId,
        bookingId: decoded.bookingId,
        service: booking.Service
          ? {
              id: booking.Service.id,
              name: booking.Service.name,
              amount: booking.Service.amount,
              description: booking.Service.description,
              categories: booking.Service.categories,
              imageUrl: booking.Service.imageUrl,
            }
          : null,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalAmount: booking.totalAmount,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la vérification :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
