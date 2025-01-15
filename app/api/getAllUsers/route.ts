import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

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
    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching error data", error);
    return NextResponse.json(
      { error: "Error fetching error data" },
      { status: 500 }
    );
  }
}
