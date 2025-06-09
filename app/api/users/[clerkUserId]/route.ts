// app/api/users/[clerkUserId]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { getAuth } from "@clerk/nextjs/server";

// export const GET = async (
//   request: NextRequest,
//   context: { params: Promise<{ clerkUserId: string }> }
// ) => {
//   const { userId: requesterClerkId } = getAuth(request);
//   const { clerkUserId: targetUserId } = await context.params; // Correction ici !

//   if (!requesterClerkId) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   // Récupérer l'utilisateur qui fait la requête
//   const requester = await prisma.user.findUnique({
//     where: { clerkUserId: requesterClerkId },
//     include: { role: true },
//   });

//   if (!requester) {
//     return NextResponse.json(
//       { error: "Requester user not found" },
//       { status: 404 }
//     );
//   }

//   // Vérifier les autorisations
//   const isSelf = requesterClerkId === targetUserId;
//   const isAdmin = requester.role?.name === "admin";

//   if (!isSelf && !isAdmin) {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   try {
//     // Récupérer l'utilisateur cible
//     const user = await prisma.user.findUnique({
//       where: { clerkUserId: targetUserId },
//       include: { role: true },
//     });

//     if (!user) {
//       return NextResponse.json(
//         { error: "Target user not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(user, { status: 200 });
//   } catch (error) {
//     console.error("Erreur serveur:", error);
//     return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
//   }
// };
// /app/api/users/[clerkUserId]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { getAuth } from "@clerk/nextjs/server";

// export async function GET(
//   req: NextRequest,
//   context: { params: { clerkUserId: string } }
// ) {
//   const { userId: requesterClerkId } = getAuth(req);
//   const targetUserId = context.params.clerkUserId;

//   if (!requesterClerkId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const requester = await prisma.user.findUnique({
//     where: { clerkUserId: requesterClerkId },
//     include: { role: true },
//   });

//   const isSelf = requesterClerkId === targetUserId;
//   const isAdmin = requester?.role?.name === "admin";

//   if (!isSelf && !isAdmin) {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   const user = await prisma.user.findUnique({
//     where: { clerkUserId: targetUserId },
//     include: { role: true },
//   });

//   if (!user) {
//     return NextResponse.json({ error: "User not found" }, { status: 404 });
//   }

//   return NextResponse.json(user);
// }

// export async function PUT(
//   req: NextRequest,
//   context: { params: { clerkUserId: string } }
// ) {
//   const { userId: requesterClerkId } = getAuth(req);
//   const targetUserId = context.params.clerkUserId;

//   if (!requesterClerkId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const requester = await prisma.user.findUnique({
//     where: { clerkUserId: requesterClerkId },
//     include: { role: true },
//   });

//   const isAdmin = requester?.role?.name === "admin";
//   const isSelf = requesterClerkId === targetUserId;

//   if (!isAdmin && !isSelf) {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   const body = await req.json();
//   const { userName, userEmail, userPhone, userDescription } = body;

//   const updatedUser = await prisma.user.update({
//     where: { clerkUserId: targetUserId },
//     data: {
//       name: userName,
//       email: userEmail,
//       phoneNumber: userPhone,
//       description: userDescription,
//     },
//   });

//   return NextResponse.json({ message: "User updated", user: updatedUser });
// }

// export async function DELETE(
//   req: NextRequest,
//   context: { params: { clerkUserId: string } }
// ) {
//   const { userId: requesterClerkId } = getAuth(req);
//   const targetUserId = context.params.clerkUserId;

//   if (!requesterClerkId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const requester = await prisma.user.findUnique({
//     where: { clerkUserId: requesterClerkId },
//     include: { role: true },
//   });

//   if (requester?.role?.name !== "admin") {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   const userToDelete = await prisma.user.findUnique({
//     where: { clerkUserId: targetUserId },
//     include: { bookings: true },
//   });

//   if (!userToDelete) {
//     return NextResponse.json({ error: "User not found" }, { status: 404 });
//   }

//   if (userToDelete.id === requester.id) {
//     return NextResponse.json({ error: "Cannot delete self" }, { status: 403 });
//   }

//   if (userToDelete.bookings.length > 0) {
//     return NextResponse.json({ error: "User has bookings" }, { status: 409 });
//   }

//   await prisma.user.delete({ where: { id: userToDelete.id } });

//   return NextResponse.json({ message: "User deleted" });
// }
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

function getClerkUserIdFromUrl(url: string) {
  // Exemple: url = "http://localhost:3000/api/users/abc123"
  const segments = new URL(url).pathname.split("/");
  return segments[segments.length - 1]; // récupérer dernier segment, ici clerkUserId
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
}

export async function PUT(req: NextRequest) {
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

  const body = await req.json();
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
}

export async function DELETE(req: NextRequest) {
  const { userId: requesterClerkId } = getAuth(req);
  const targetUserId = getClerkUserIdFromUrl(req.url);

  if (!requesterClerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    return NextResponse.json({ error: "Cannot delete self" }, { status: 403 });
  }

  if (userToDelete.bookings.length > 0) {
    return NextResponse.json({ error: "User has bookings" }, { status: 409 });
  }

  await prisma.user.delete({ where: { id: userToDelete.id } });

  return NextResponse.json({ message: "User deleted" });
}
