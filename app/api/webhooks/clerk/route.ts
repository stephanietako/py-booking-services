// app/api/webhooks/clerk/route.ts - Version corrigée
import { NextRequest, NextResponse } from "next/server";
import { verifyClerkWebhook } from "@/lib/clerk";
import { PrismaClient } from "@prisma/client";
import { addUserToDatabase } from "@/actions/actions";
import { ClerkWebhookEvent } from "@/types";

const prisma = new PrismaClient();
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    // Test de connexion Prisma
    console.log("🔌 Test connexion Prisma...");
    await prisma.$connect();
    console.log("✅ Prisma connecté");

    const { event } = await verifyClerkWebhook(req, CLERK_WEBHOOK_SECRET);
    const { type, data } = event as ClerkWebhookEvent;

    switch (type) {
      case "user.created":
      case "user.updated":
        console.log("🔄 Début création/mise à jour user...");

        // Vérification des données reçues
        const emailData = data.email_addresses?.[0];

        if (!emailData?.email_address) {
          throw new Error(
            "Aucune adresse email trouvée dans les données Clerk"
          );
        }

        const email = emailData.email_address;
        const name =
          `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() ||
          "Sans nom";
        const imageUrl = data.image_url ?? "";
        const clerkUserId = data.id;

        // Vérifier que le rôle existe
        console.log("🔍 Recherche du rôle 'user'...");
        const defaultRole = await prisma.role.findFirst({
          where: { name: "user" },
        });

        if (!defaultRole) {
          console.error("❌ Rôle 'user' introuvable !");
          console.log("🔧 Création du rôle 'user'...");
          const newRole = await prisma.role.create({
            data: { name: "user" },
          });
          console.log("✅ Rôle créé:", newRole);
        }

        // Vérifier si l'utilisateur existe déjà par clerkUserId
        console.log("🔍 Vérification utilisateur existant par clerkUserId...");
        const existingUser = await prisma.user.findUnique({
          where: { clerkUserId },
        });
        console.log(
          "👤 Utilisateur existant (clerkUserId):",
          existingUser ? "OUI" : "NON"
        );

        // Vérifier si l'email existe déjà
        console.log("🔍 Vérification email existant...");
        const existingEmailUser = await prisma.user.findUnique({
          where: { email },
        });
        console.log("📧 Email existant:", existingEmailUser ? "OUI" : "NON");

        // NOUVEAU: Gérer le conflit d'email
        if (
          existingEmailUser &&
          existingEmailUser.clerkUserId !== clerkUserId
        ) {
          console.log("⚠️ CONFLIT: Email existe avec un autre clerkUserId");
          console.log(
            "📧 Email existant avec clerkUserId:",
            existingEmailUser.clerkUserId
          );
          console.log("🆕 Nouveau clerkUserId:", clerkUserId);

          // Option 1: Mettre à jour l'utilisateur existant avec le nouveau clerkUserId
          console.log(
            "🔄 Mise à jour de l'utilisateur existant avec le nouveau clerkUserId..."
          );
          const updatedUser = await prisma.user.update({
            where: { email },
            data: {
              clerkUserId, // Mettre à jour avec le nouveau clerkUserId
              name,
              image: imageUrl,
            },
            include: { role: true },
          });

          console.log("✅ Utilisateur mis à jour:", updatedUser);
          return NextResponse.json(
            { success: true, action: "updated_existing" },
            { status: 200 }
          );
        }

        // Si pas de conflit, procéder normalement
        const result = await addUserToDatabase(
          email,
          name,
          imageUrl,
          clerkUserId,
          ""
        );

        console.log("✅ addUserToDatabase result:", result);

        break;

      case "user.deleted":
        console.log("🗑️ Suppression user");
        await prisma.user.deleteMany({
          where: { clerkUserId: data.id },
        });
        console.log("🗑️ Users supprimés");
        break;

      default:
        console.log("🔕 Unhandled Clerk event:", type);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ Clerk webhook error:", err);
    console.error("❌ Error details:", {
      message: err instanceof Error ? err.message : "Unknown error",
      stack: err instanceof Error ? err.stack : "No stack",
      name: err instanceof Error ? err.name : "Unknown",
    });

    return NextResponse.json(
      {
        error: "Webhook error",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 400 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
