// app/api/users/[clerkUserId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export const GET = async (
  request: NextRequest,
  context: { params: Promise<{ clerkUserId: string }> }
) => {
  const { userId: requesterClerkId } = getAuth(request);
  const { clerkUserId: targetUserId } = await context.params; // Correction ici !

  if (!requesterClerkId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Récupérer l'utilisateur qui fait la requête
  const requester = await prisma.user.findUnique({
    where: { clerkUserId: requesterClerkId },
    include: { role: true },
  });

  if (!requester) {
    return NextResponse.json(
      { error: "Requester user not found" },
      { status: 404 }
    );
  }

  // Vérifier les autorisations
  const isSelf = requesterClerkId === targetUserId;
  const isAdmin = requester.role?.name === "admin";

  if (!isSelf && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Récupérer l'utilisateur cible
    const user = await prisma.user.findUnique({
      where: { clerkUserId: targetUserId },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
  }
};
