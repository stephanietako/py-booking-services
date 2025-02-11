import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL;

export async function POST(request: NextRequest) {
  const { userId, serviceId } = await request.json();

  // Vérifiez que userId et serviceId sont des chaînes de caractères valides
  if (typeof userId !== "string" || typeof serviceId !== "string") {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  // Recherche l'utilisateur par clerkUserId
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    console.error("Aucun utilisateur trouvé pour clerkUserId:", userId);
    return NextResponse.json(
      { error: "Utilisateur non trouvé" },
      { status: 404 }
    );
  }

  // Recherche le service avec l'id du service
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    console.error("Aucun service trouvé pour serviceId:", serviceId);
    return NextResponse.json({ error: "Service non trouvé" }, { status: 404 });
  }

  // Définir une date d'expiration (par exemple, 1 semaine après la création)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours après la création

  // Créer la réservation avec le champ expiresAt
  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      serviceId,
      status: "PENDING",
      expiresAt,
    },
  });

  if (!adminEmail) {
    console.error(
      "ADMIN_EMAIL n'est pas défini dans les variables d'environnement."
    );
    return NextResponse.json(
      { error: "Erreur de configuration" },
      { status: 500 }
    );
  }

  // Envoyez un email à l'administrateur
  await resend.emails.send({
    from: "no-reply@yourapp.com",
    to: adminEmail,
    subject: "Nouvelle réservation en attente",
    text: `Une nouvelle réservation (ID: ${booking.id}) nécessite votre approbation.`,
  });

  return NextResponse.json(booking, { status: 201 });
}
