// api/clients/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAllUsers } from "@/actions/actions";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const { users, pagination } = await getAllUsers(page, limit);

    return NextResponse.json({ users, pagination });
  } catch {
    return NextResponse.json(
      { users: [], error: "Erreur lors du chargement des utilisateurs" },
      { status: 500 }
    );
  }
}
