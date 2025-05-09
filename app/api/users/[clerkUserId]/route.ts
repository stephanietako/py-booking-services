// /app/api/users/[clerkUserId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { clerkUserId: string } }
) {
  const { userId: requesterClerkId } = getAuth(req);

  if (!requesterClerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requester = await prisma.user.findUnique({
    where: { clerkUserId: requesterClerkId },
    include: { role: true },
  });

  if (!requester) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { clerkUserId } = params;

  // ❗ autorisé si :
  // - admin
  // - OU demande son propre profil
  if (
    requester.clerkUserId !== clerkUserId &&
    requester.role?.name !== "admin"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
  }
}
