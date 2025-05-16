// /app/api/users/updateUser/route.ts
// /app/api/users/updateUser/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { getAuth } from "@clerk/nextjs/server";

// export async function POST(req: NextRequest) {
//   const {
//     userId, // clerkUserId
//     userName,
//     userEmail,
//     userPhone,
//     userDescription,
//   } = await req.json();

//   const { userId: requesterClerkId } = getAuth(req);

//   if (!requesterClerkId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const requester = await prisma.user.findUnique({
//     where: { clerkUserId: requesterClerkId },
//     include: { role: true },
//   });

//   if (!requester) {
//     return NextResponse.json({ error: "User not found" }, { status: 404 });
//   }

//   if (requester.clerkUserId !== userId && requester.role?.name !== "admin") {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   try {
//     const updatedUser = await prisma.user.update({
//       where: { clerkUserId: userId },
//       data: {
//         name: userName || undefined,
//         email: userEmail || undefined,
//         phoneNumber: userPhone || undefined,
//         description: userDescription || undefined,
//       },
//     });

//     return NextResponse.json(
//       { message: "User updated successfully", user: updatedUser },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Erreur serveur:", error);
//     return NextResponse.json({ error: "Error updating user" }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId: requesterClerkId } = getAuth(req);
  if (!requesterClerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch (error) {
    console.error("Erreur lors du parsing JSON:", error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userId, userName, userEmail, userPhone, userDescription } = body;

  if (!userId || typeof userId !== "string") {
    return NextResponse.json(
      { error: "Invalid or missing userId" },
      { status: 400 }
    );
  }

  if (userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  if (userPhone && typeof userPhone !== "string") {
    return NextResponse.json(
      { error: "Invalid phone number format" },
      { status: 400 }
    );
  }

  try {
    const requester = await prisma.user.findUnique({
      where: { clerkUserId: requesterClerkId },
      include: { role: true },
    });

    if (!requester) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAdmin = requester.role?.name === "admin";
    const isSelf = requester.clerkUserId === userId;

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        name: typeof userName === "string" ? userName : undefined,
        email: typeof userEmail === "string" ? userEmail : undefined,
        phoneNumber: typeof userPhone === "string" ? userPhone : undefined,
        description:
          typeof userDescription === "string" ? userDescription : undefined,
      },
    });

    return NextResponse.json(
      { message: "User updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
