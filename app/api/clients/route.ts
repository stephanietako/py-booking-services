// api/clients/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAllClients } from "@/actions/actions";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const { clients, pagination } = await getAllClients(page, limit);

    return NextResponse.json({ clients, pagination });
  } catch {
    return NextResponse.json(
      { clients: [], error: "Erreur lors du chargement des clients" },
      { status: 500 }
    );
  }
}
