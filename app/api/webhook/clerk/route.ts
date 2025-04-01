//app/api/webhook/clerk/route.ts

import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { data } = req.body;
  console.log("Webhook reçu avec :", req.body);
  // Vérification des données
  if (!data || !data.email_addresses || !data.id) {
    return res.status(400).json({ message: "Données invalides." });
  }

  const email = data.email_addresses[0].email_address;
  const clerkUserId = data.id; // ID Clerk
  const termsAcceptedAt = data.unsafe_metadata?.termsAcceptedAt || null;

  try {
    const role = await prisma.role.findUnique({
      where: { name: "member" },
    });
    if (!role) {
      return res
        .status(500)
        .json({ message: "Le rôle 'member' n'existe pas." });
    }

    await prisma.user.upsert({
      where: { clerkUserId },
      update: { termsAcceptedAt },
      create: {
        clerkUserId,
        email,
        termsAcceptedAt,
        name: "Utilisateur",
        roleId: role.id, // Utiliser roleId au lieu de connect
      },
    });

    return res.status(200).json({ message: "Utilisateur enregistré." });
  } catch (error) {
    console.error("Erreur Prisma :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
}
