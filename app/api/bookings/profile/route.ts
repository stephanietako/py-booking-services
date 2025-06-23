// app/api/bookings/profile/route.ts
// app/api/bookings/profile/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function GET() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("🔍 ClerkUserId:", clerkUserId);

  try {
    // Récupérer l'utilisateur interne à partir du clerkUserId
    let user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    // Si l'utilisateur n'existe pas, gérer la création/mise à jour
    if (!user) {
      console.log(
        "⚠️ Utilisateur non trouvé par clerkUserId, vérification par email..."
      );

      // Récupérer les infos depuis Clerk
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return NextResponse.json(
          { error: "Impossible de récupérer l'utilisateur Clerk" },
          { status: 404 }
        );
      }

      const userEmail = clerkUser.emailAddresses[0]?.emailAddress;

      if (!userEmail) {
        return NextResponse.json(
          { error: "Email non trouvé dans Clerk" },
          { status: 404 }
        );
      }

      // Vérifier si un utilisateur existe déjà avec cet email
      const existingUser = await prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (existingUser) {
        // Mettre à jour le clerkUserId de l'utilisateur existant
        console.log(
          "✅ Utilisateur trouvé par email, mise à jour du clerkUserId..."
        );
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: { clerkUserId },
        });
      } else {
        // Créer un nouvel utilisateur seulement si aucun n'existe avec cet email
        console.log("⚠️ Création d'un nouvel utilisateur...");

        try {
          // Récupérer le rôle par défaut
          const defaultRole = await prisma.role.findFirst({
            where: { name: "user" },
          });

          if (!defaultRole) {
            console.error("❌ Rôle par défaut 'user' non trouvé");
            return NextResponse.json(
              { error: "Configuration du système incorrecte" },
              { status: 500 }
            );
          }

          // Construire le nom complet avec vérification
          const firstName = clerkUser.firstName || "";
          const lastName = clerkUser.lastName || "";
          const fullName = `${firstName} ${lastName}`.trim() || "Utilisateur";

          user = await prisma.user.create({
            data: {
              clerkUserId,
              name: fullName,
              email: userEmail,
              roleId: defaultRole.id,
            },
          });

          console.log("✅ Utilisateur créé:", user.id);
        } catch (createError) {
          // Si l'erreur est une contrainte unique sur l'email
          if (
            createError instanceof PrismaClientKnownRequestError &&
            createError.code === "P2002" &&
            Array.isArray(createError.meta?.target) &&
            createError.meta.target.includes("email")
          ) {
            console.log("⚠️ Email déjà utilisé, tentative de récupération...");

            // Récupérer l'utilisateur existant par email
            const existingUserByEmail = await prisma.user.findUnique({
              where: { email: userEmail },
            });

            if (existingUserByEmail) {
              // Mettre à jour le clerkUserId
              user = await prisma.user.update({
                where: { id: existingUserByEmail.id },
                data: { clerkUserId },
              });
              console.log(
                "✅ ClerkUserId mis à jour pour l'utilisateur existant"
              );
            } else {
              throw createError;
            }
          } else {
            throw createError;
          }
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Impossible de créer ou récupérer l'utilisateur" },
        { status: 500 }
      );
    }

    console.log("✅ Utilisateur trouvé:", user.id);

    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { reservedAt: "desc" },
      include: {
        service: true,
        bookingOptions: { include: { option: true } },
        client: true,
      },
    });

    console.log("✅ Bookings trouvés:", bookings.length);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("❌ Erreur dans GET bookings/profile:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
