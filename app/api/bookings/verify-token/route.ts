import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new Error("JWT_SECRET is missing in the environment variables");
}

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    const decoded = jwt.verify(token, secretKey as string) as JwtPayload & {
      bookingId: string;
      userId: string;
    };

    const booking = await prisma.booking.findUnique({
      where: { id: decoded.bookingId },
      include: { user: true },
    });

    console.log("Réservation vérifiée");

    if (!booking || booking.user.clerkUserId !== decoded.userId) {
      console.log("Accès non autorisé.");
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    return NextResponse.json({ decoded }, { status: 200 });
  } catch {
    console.error("Erreur lors de la vérification ");
    return NextResponse.json(
      { error: "Erreur lors de la vérification " },
      { status: 500 }
    );
  }
}
