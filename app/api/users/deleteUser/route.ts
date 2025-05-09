// /app/api/users/deleteUser/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const { userId: authenticatedClerkId } = getAuth(req);
  if (!authenticatedClerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminUser = await prisma.user.findUnique({
    where: { clerkUserId: authenticatedClerkId },
    include: { role: true },
  });

  if (!adminUser || adminUser.role?.name !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }

  if (id === adminUser.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 403 }
    );
  }

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      include: { bookings: true },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userToDelete.bookings.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete user with existing bookings" },
        { status: 409 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
