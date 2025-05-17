// app/api/options/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const options = await prisma.option.findMany();
    return NextResponse.json(options, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des options :", error);
    return NextResponse.json(
      {
        error: "Impossible de récupérer les options depuis la base de données.",
      },
      { status: 500 }
    );
  }
}
