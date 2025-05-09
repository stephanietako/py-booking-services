// /app/api/users/updateUser/route.ts
// /app/api/users/updateUser/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const {
    userId, // clerkUserId
    userName,
    userEmail,
    userPhone,
    userDescription,
  } = await req.json();

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

  if (requester.clerkUserId !== userId && requester.role?.name !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        name: userName || undefined,
        email: userEmail || undefined,
        phoneNumber: userPhone || undefined,
        description: userDescription || undefined,
      },
    });

    return NextResponse.json(
      { message: "User updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json({ error: "Error updating user" }, { status: 500 });
  }
}
