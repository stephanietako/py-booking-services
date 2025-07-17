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

  try {
    let user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      console.log("⚠️ Utilisateur non trouvé, tentative de création...");

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

      const existingUser = await prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (existingUser) {
        console.log("⚠️ Utilisateur existant trouvé, mise à jour...");
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: { clerkUserId },
        });
      } else {
        const defaultRole = await prisma.role.findFirst({
          where: { name: "user" },
        });

        if (!defaultRole) {
          return NextResponse.json(
            { error: "Configuration du système incorrecte" },
            { status: 500 }
          );
        }

        const fullName =
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          "Utilisateur";

        try {
          user = await prisma.user.create({
            data: {
              clerkUserId,
              name: fullName,
              email: userEmail,
              roleId: defaultRole.id,
            },
          });
        } catch (createError) {
          if (
            createError instanceof PrismaClientKnownRequestError &&
            createError.code === "P2002" &&
            Array.isArray(createError.meta?.target) &&
            createError.meta.target.includes("email")
          ) {
            const existingUserByEmail = await prisma.user.findUnique({
              where: { email: userEmail },
            });

            if (existingUserByEmail) {
              user = await prisma.user.update({
                where: { id: existingUserByEmail.id },
                data: { clerkUserId },
              });
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

    console.log("✅ Utilisateur trouvé");

    // (optionnel) Met à jour les anciennes réservations sans userId mais avec le bon email
    await prisma.booking.updateMany({
      where: {
        userId: null,
        client: {
          email: user.email,
        },
      },
      data: {
        userId: user.id,
      },
    });

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { userId: user.id },
          { client: { email: user.email } }, // Ajout clé ici
        ],
      },
      orderBy: { reservedAt: "desc" },
      include: {
        service: true,
        bookingOptions: { include: { option: true } },
        client: true,
      },
    });

    console.log("✅ Réservations récupérées :", bookings.length);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("❌ Erreur dans GET bookings/profile:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
