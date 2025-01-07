import bcrypt from "bcrypt";
import prisma from "@/app/lib/prisma";

export async function createAdminUser() {
  // Utilisation des variables d'environnement
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const saltRounds = 10;

  if (!email || !password) {
    throw new Error(
      "Les variables ADMIN_EMAIL et ADMIN_PASSWORD doivent être définies dans le fichier .env"
    );
  }

  // Hachage du mot de passe
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Création de l'utilisateur administrateur dans la base de données
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      isAdmin: true,
    },
  });

  console.log("Utilisateur administrateur créé avec succès :", user);
}
