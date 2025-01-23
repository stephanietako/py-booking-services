// app/api/getCloseDays/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { formatISO } from "date-fns";

export async function GET(req: NextRequest) {
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
    // Récupération des jours et des jours fermés
    const closedDays = await prisma.closedDay.findMany();
    return NextResponse.json(
      { closedDays: closedDays.map((d) => formatISO(d.date)) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching closed days:", error);
    return NextResponse.json(
      { error: "Error fetching closed days" },
      { status: 500 }
    );
  }
}
