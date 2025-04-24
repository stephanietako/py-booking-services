import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const { userId: getAuthenticatedUserId } = getAuth(req);
  if (!getAuthenticatedUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Vérifier si l'utilisateur est un administrateur
  const adminUser = await prisma.user.findUnique({
    where: { clerkUserId: getAuthenticatedUserId },
    include: { role: true },
  });

  if (!adminUser || (adminUser.role && adminUser.role.name !== "admin")) {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }

  try {
    // Assurez-vous que l'utilisateur existe avant d'essayer de le supprimer
    const userToDelete = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "User data deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error while deleting user:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting user data" },
      { status: 500 }
    );
  }
}
