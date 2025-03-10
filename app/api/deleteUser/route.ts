import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  const { userId: getAuthenticatedUserId } = getAuth(req);
  if (!getAuthenticatedUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminUser = await prisma.user.findUnique({
    where: { clerkUserId: getAuthenticatedUserId },
    include: { role: true },
  });

  if (!adminUser || (adminUser.role && adminUser.role.name !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        message: "User data delete successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Error deleting user data" },
      { status: 500 }
    );
  }
}
