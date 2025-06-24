// app/api/users/[clerkUserId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// ✅ Utilise les params de Next.js 15 avec await
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clerkUserId: string }> }
) {
  const { userId: requesterClerkId } = await auth();
  const { clerkUserId: targetUserId } = await params;

  if (!requesterClerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requester = await prisma.user.findUnique({
      where: { clerkUserId: requesterClerkId },
      include: { role: true },
    });

    const isSelf = requesterClerkId === targetUserId;
    const isAdmin = requester?.role?.name === "admin";

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: targetUserId },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("❌ Erreur dans GET users/[clerkUserId]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ clerkUserId: string }> }
) {
  const { userId: requesterClerkId } = await auth();
  const { clerkUserId: targetUserId } = await params;

  if (!requesterClerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requester = await prisma.user.findUnique({
      where: { clerkUserId: requesterClerkId },
      include: { role: true },
    });

    const isAdmin = requester?.role?.name === "admin";
    const isSelf = requesterClerkId === targetUserId;

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await _req.json();
    const { userName, userEmail, userPhone, userDescription } = body;

    const updatedUser = await prisma.user.update({
      where: { clerkUserId: targetUserId },
      data: {
        name: userName,
        email: userEmail,
        phoneNumber: userPhone,
        description: userDescription,
      },
    });

    return NextResponse.json({ message: "User updated", user: updatedUser });
  } catch (error) {
    console.error("❌ Erreur dans PUT users/[clerkUserId]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ clerkUserId: string }> }
) {
  const { userId: requesterClerkId } = await auth();
  const { clerkUserId: targetUserId } = await params;

  if (!requesterClerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requester = await prisma.user.findUnique({
      where: { clerkUserId: requesterClerkId },
      include: { role: true },
    });

    if (requester?.role?.name !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userToDelete = await prisma.user.findUnique({
      where: { clerkUserId: targetUserId },
      include: { bookings: true },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userToDelete.id === requester.id) {
      return NextResponse.json(
        { error: "Cannot delete self" },
        { status: 403 }
      );
    }

    if (userToDelete.bookings.length > 0) {
      return NextResponse.json({ error: "User has bookings" }, { status: 409 });
    }

    await prisma.user.delete({ where: { id: userToDelete.id } });

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("❌ Erreur dans DELETE users/[clerkUserId]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
