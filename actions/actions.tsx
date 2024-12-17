"use server";

import prisma from "@/app/lib/prisma";

// Va nous permettre de vérifier si un user exsiste déjà dans la bd sinon on l'ajoute
export async function checkAndAddUser(email: string | undefined) {
  if (!email) return;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email,
        },
      });
      console.log("Nouvel utilisateur ajouté dans la base de données");
    } else {
      console.log("Utilisateur déjà présent dans la base de données");
    }
  } catch (error) {
    console.error("Erreur lorsn de la vérification de l'utilisateur:", error);
  }
}
// Ajouter les services
export async function addService(email: string, name: string, amount: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new Error("utilisateur non trouvé");
    }
    await prisma.service.create({
      data: {
        name,
        amount,
        userId: user.id,
      },
    });
  } catch (error) {
    console.log("erreur lors de l'ajout du service:", error);
    throw error;
  }
}

// Afficher les services
export async function getServicesByUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        services: {
          include: {
            transactions: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    // On va retourner la liste de tous les services
    return user.services;
  } catch (error) {
    console.log("erreur lors de la récupération des services:", error);
    throw error;
  }
}