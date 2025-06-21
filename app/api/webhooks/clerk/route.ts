// app/api/webhooks/clerk/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { verifyClerkWebhook } from "@/lib/clerk";
// import { PrismaClient } from "@prisma/client";
// import { addUserToDatabase } from "@/actions/actions";
// import { ClerkWebhookEvent } from "@/types";

// const prisma = new PrismaClient();
// const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

// export async function POST(req: NextRequest) {
//   console.log("🚀 Webhook Clerk appelé");

//   try {
//     const { event } = await verifyClerkWebhook(req, CLERK_WEBHOOK_SECRET);
//     const { type, data } = event as ClerkWebhookEvent;

//     console.log("📨 Clerk event type:", type);
//     console.log("📨 Clerk event data:", JSON.stringify(data, null, 2));

//     switch (type) {
//       case "user.created":
//       case "user.updated":
//         console.log("🔄 Début création/mise à jour user...");

//         const email = data.email_addresses[0]?.email_address ?? "";
//         const name = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim();
//         const imageUrl = data.image_url ?? "";
//         const clerkUserId = data.id;

//         console.log("📋 Données à insérer:", {
//           email,
//           name,
//           imageUrl,
//           clerkUserId,
//         });

//         // Vérifier que le rôle existe
//         const defaultRole = await prisma.role.findFirst({
//           where: { name: "user" },
//         });

//         console.log("👤 Rôle trouvé:", defaultRole);

//         if (!defaultRole) {
//           console.error("❌ Rôle 'user' introuvable !");
//           throw new Error("Rôle par défaut 'user' introuvable");
//         }

//         const result = await addUserToDatabase(
//           email,
//           name,
//           imageUrl,
//           clerkUserId,
//           ""
//         );

//         console.log("✅ User créé/mis à jour:", result);

//         // Vérification en base
//         const userInDb = await prisma.user.findUnique({
//           where: { clerkUserId },
//           include: { role: true },
//         });

//         console.log("🔍 User en base après création:", userInDb);

//         break;

//       case "user.deleted":
//         console.log("🗑️ Suppression user:", data.id);

//         const deleted = await prisma.user.deleteMany({
//           where: { clerkUserId: data.id },
//         });

//         console.log("🗑️ Users supprimés:", deleted.count);

//         if (deleted.count === 0) {
//           console.warn(
//             "⚠️ Tentative de suppression d'un user non trouvé:",
//             data.id
//           );
//         }

//         break;

//       default:
//         console.log("🔕 Unhandled Clerk event:", type);
//     }

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (err) {
//     console.error("❌ Clerk webhook error:", err);
//     console.error(
//       "❌ Stack trace:",
//       err instanceof Error ? err.stack : "No stack"
//     );
//     return NextResponse.json(
//       {
//         error: "Webhook error",
//         details: err instanceof Error ? err.message : "Unknown error",
//       },
//       { status: 400 }
//     );
//   }
// }
// app/api/webhooks/clerk/route.ts - Version debug
import { NextRequest, NextResponse } from "next/server";
import { verifyClerkWebhook } from "@/lib/clerk";
import { PrismaClient } from "@prisma/client";
import { addUserToDatabase } from "@/actions/actions";
import { ClerkWebhookEvent } from "@/types";

const prisma = new PrismaClient();
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  console.log("🚀 Webhook Clerk appelé");
  console.log("🔑 CLERK_WEBHOOK_SECRET exists:", !!CLERK_WEBHOOK_SECRET);
  console.log("🔗 DATABASE_URL exists:", !!process.env.DATABASE_URL);

  try {
    // Test de connexion Prisma
    console.log("🔌 Test connexion Prisma...");
    await prisma.$connect();
    console.log("✅ Prisma connecté");

    const { event } = await verifyClerkWebhook(req, CLERK_WEBHOOK_SECRET);
    const { type, data } = event as ClerkWebhookEvent;

    console.log("📨 Clerk event type:", type);
    console.log("📨 Clerk event data keys:", Object.keys(data));

    switch (type) {
      case "user.created":
      case "user.updated":
        console.log("🔄 Début création/mise à jour user...");

        // Vérification des données reçues
        const emailData = data.email_addresses?.[0];
        console.log("📧 Email data:", emailData);

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

        console.log("📋 Données extraites:", {
          email,
          name,
          imageUrl,
          clerkUserId,
          hasEmailAddresses: !!data.email_addresses,
          emailAddressesLength: data.email_addresses?.length || 0,
        });

        // Vérifier que le rôle existe
        console.log("🔍 Recherche du rôle 'user'...");
        const defaultRole = await prisma.role.findFirst({
          where: { name: "user" },
        });

        console.log("👤 Rôle trouvé:", defaultRole);

        if (!defaultRole) {
          console.error("❌ Rôle 'user' introuvable !");

          // Créer le rôle si il n'existe pas
          console.log("🔧 Création du rôle 'user'...");
          const newRole = await prisma.role.create({
            data: { name: "user" },
          });
          console.log("✅ Rôle créé:", newRole);
        }

        // Vérifier si l'utilisateur existe déjà
        console.log("🔍 Vérification utilisateur existant...");
        const existingUser = await prisma.user.findUnique({
          where: { clerkUserId },
        });
        console.log("👤 Utilisateur existant:", existingUser ? "OUI" : "NON");

        // Vérifier si l'email existe déjà
        const existingEmailUser = await prisma.user.findUnique({
          where: { email },
        });
        console.log("📧 Email existant:", existingEmailUser ? "OUI" : "NON");

        const result = await addUserToDatabase(
          email,
          name,
          imageUrl,
          clerkUserId,
          ""
        );

        console.log("✅ addUserToDatabase result:", result);

        // Double vérification en base
        const userInDb = await prisma.user.findUnique({
          where: { clerkUserId },
          include: { role: true },
        });

        console.log("🔍 User final en base:", userInDb);

        if (!userInDb) {
          console.error("❌ PROBLÈME: User non trouvé en base après création!");

          // Essayer de créer directement
          console.log("🔧 Tentative de création directe...");
          const directCreate = await prisma.user.create({
            data: {
              email,
              name,
              image: imageUrl,
              clerkUserId,
              phoneNumber: "",
              roleId:
                defaultRole?.id ||
                (await prisma.role.findFirst({ where: { name: "user" } }))!.id,
            },
            include: { role: true },
          });
          console.log("✅ Création directe réussie:", directCreate);
        }

        break;

      case "user.deleted":
        console.log("🗑️ Suppression user:", data.id);
        const deleted = await prisma.user.deleteMany({
          where: { clerkUserId: data.id },
        });
        console.log("🗑️ Users supprimés:", deleted.count);
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
