// lib/linkClientToUser.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Lie un client existant (via email) à un utilisateur Clerk (userId)
 * @param userId ID Clerk de l'utilisateur connecté
 * @param email Email de l'utilisateur
 */
export async function linkClientToUser(userId: string, email: string) {
  const client = await prisma.client.findUnique({
    where: { email },
  });

  // Si un client existe avec cet email ET n’est pas déjà lié
  if (client && !client.userId) {
    await prisma.client.update({
      where: { id: client.id },
      data: { userId },
    });
    console.log(`✅ Client lié à l'utilisateur: ${userId}`);
    return true;
  }

  console.log("ℹ️ Aucun client à lier ou déjà lié");
  return false;
}
