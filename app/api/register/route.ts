import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Récupération des données en une seule fois ✅
    const { clerkUserId, termsAcceptedAt } = await req.json();

    // Vérification des données envoyées
    if (!clerkUserId || !termsAcceptedAt) {
      return NextResponse.json(
        {
          message: "Données invalides : clerkUserId et termsAcceptedAt requis.",
        },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe ✅
    const user = await prisma.user.findUnique({ where: { clerkUserId } });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour la date d'acceptation des CGU ✅
    await prisma.user.update({
      where: { clerkUserId },
      data: { termsAcceptedAt: new Date(termsAcceptedAt) },
    });

    return NextResponse.json(
      { message: "Inscription complétée avec acceptation des CGU." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur API register:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
