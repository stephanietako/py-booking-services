import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId, userDescription } = await req.json();

  const { userId: getAuthenticatedUserId } = getAuth(req);
  if (!getAuthenticatedUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        description: userDescription || null,
      },
    });

    return NextResponse.json(
      {
        message: "User data updated successfully",
        user: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Error updating user data" },
      { status: 500 }
    );
  }
}
