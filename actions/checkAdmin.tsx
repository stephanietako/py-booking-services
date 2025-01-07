"use server";

import bcrypt from "bcrypt";
import prisma from "@/app/lib/prisma";

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

        // Générer un mot de passe haché pour la création d'utilisateur
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(
          adminPassword || "defaultPassword",
          saltRounds
        );

        await prisma.user.create({
          data: {
            email,
            password: hashedPassword, // Mot de passe haché requis
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
