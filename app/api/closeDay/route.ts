import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Ajouter un jour fermé
export async function POST(request: Request) {
  const { date } = await request.json();

  const existing = await prisma.closedDay.findUnique({
    where: { date },
  });

  if (existing) {
    return NextResponse.json({ error: "Day already closed" }, { status: 400 });
  }

  const closedDay = await prisma.closedDay.create({
    data: { date: new Date(date) },
  });

  return NextResponse.json(closedDay);
}

// Supprimer un jour fermé
export async function DELETE(request: Request) {
  const { date } = await request.json();

  const closedDay = await prisma.closedDay.findUnique({
    where: { date },
  });

  if (!closedDay) {
    return NextResponse.json({ error: "Day is not closed" }, { status: 400 });
  }

  await prisma.closedDay.delete({
    where: { id: closedDay.id },
  });

  return NextResponse.json({ message: "Day reopened" });
}
