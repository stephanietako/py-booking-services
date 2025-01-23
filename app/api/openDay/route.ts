// app/api/openDay/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
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
    const { date } = await req.json();

    if (!date || isNaN(new Date(date).getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    await prisma.closedDay.delete({
      where: {
        date: new Date(date), // Ensure this is a valid date object
      },
    });

    return NextResponse.json(
      { message: "Day opened successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error opening day:", error);
    return NextResponse.json(
      { error: "Error opening the day" },
      { status: 500 }
    );
  }
}
