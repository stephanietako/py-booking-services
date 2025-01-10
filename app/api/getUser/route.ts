import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

//on peut pas utiliser une methode post alors qu'on est dans une methode get c'est parce-que sinon on ne pourrait pas renvoyer le body de la requète
// et comme je veux donner userId directement dans le body de la requète et pas à travers l'url je suis obligé de mettre la methode en post
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    const { userId: getAuthenticatedUserId } = getAuth(req);

    if (!getAuthenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Invalid userId provided" },
        { status: 400 }
      );
    }

    console.log("Request received for userId:", userId);
    console.log("Authenticated user:", getAuthenticatedUserId);

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user); // 200 OK est implicite
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Error fetching user data" },
      { status: 500 }
    );
  }
}
