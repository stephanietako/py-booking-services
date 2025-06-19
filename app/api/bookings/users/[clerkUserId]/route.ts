// app/api/bookings/users/[clerkUserId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

function getClerkUserIdFromUrl(url: string) {
  const segments = new URL(url).pathname.split("/");
  return segments[segments.length - 1];
}

export async function GET(req: NextRequest) {
  const { userId: requesterClerkId } = getAuth(req);
  const targetUserId = getClerkUserIdFromUrl(req.url);

  if (!requesterClerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requester = await prisma.user.findUnique({
    where: { clerkUserId: requesterClerkId },
    include: { role: true },
  });

  const isAdmin = requester?.role?.name === "admin";
  const isSelf = requesterClerkId === targetUserId;

  if (!isAdmin && !isSelf) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetUser = await prisma.user.findUnique({
    where: { clerkUserId: targetUserId },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      userId: targetUser.id,
    },
    orderBy: { reservedAt: "desc" },
    include: {
      service: true,
      client: true,
      user: true, // pour BookingDetailsDisplay quand pas de client
      bookingOptions: {
        include: {
          option: true,
        },
      },
    },
  });

  return NextResponse.json(bookings);
}
