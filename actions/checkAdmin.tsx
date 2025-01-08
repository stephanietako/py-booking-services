"use server";

import prisma from "@/lib/prisma";

export async function checkAdmin(
  email: string,
  provider: string,
  password?: string
) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (email === adminEmail) {
    if (provider === "google" || password === adminPassword) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        const user = await prisma.user.update({
          where: { email },
          data: { isAdmin: true },
        });
        console.log("Utilisateur mis à jour", user);
        return { isAdmin: true };
      } else {
        console.log("Utilisateur non trouvé, création...");

        await prisma.user.create({
          data: {
            email,
            isAdmin: true,
          },
        });
        return { isAdmin: true, message: "Nouvel administrateur créé" };
      }
    } else {
      return { isAdmin: false, message: "Mot de passe incorrect" };
    }
  } else {
    return { isAdmin: false, message: "Email non autorisé" };
  }
}
