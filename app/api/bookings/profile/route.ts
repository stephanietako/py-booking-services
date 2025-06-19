// app/api/bookings/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId: clerkUserId } = getAuth(req);

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Récupérer l'utilisateur interne à partir du clerkUserId
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur non trouvé" },
      { status: 404 }
    );
  }

  const bookings = await prisma.booking.findMany({
    where: {
      userId: user.id,
    },
    orderBy: { reservedAt: "desc" },
    include: {
      service: true,
      bookingOptions: { include: { option: true } },
      client: true,
    },
  });

  return NextResponse.json(bookings);
}
