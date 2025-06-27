import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAllClients } from "@/actions/actions";

// export async function GET(
//   _req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;
//   try {
//     const client = await prisma.client.findUnique({
//       where: { id: Number(id) },
//     });
//     if (!client) {
//       return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
//     }
//     return NextResponse.json({ client });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
//   }
// }

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const { clients, pagination } = await getAllClients(page, limit);
    if (!clients || !pagination) {
      return NextResponse.json(
        { error: "Erreur lors du chargement des clients" },
        { status: 500 }
      );
    }
    return NextResponse.json({ clients, pagination });
  } catch {
    return NextResponse.json(
      { clients: [], error: "Erreur lors du chargement des clients" },
      { status: 500 }
    );
  }
}
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { fullName, email, phoneNumber } = body;

    const updated = await prisma.client.update({
      where: { id: Number(id) },
      data: { fullName, email, phoneNumber },
    });

    return NextResponse.json({ client: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.client.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
