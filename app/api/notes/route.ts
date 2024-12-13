import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const notes = await prisma.note.findMany();
    return NextResponse.json(notes, { status: 200 });
  } catch (error) {
    console.log(error, "error : failed to get notes ");
    return NextResponse.json({ error: "Il y a un problème" }, { status: 500 });
  }
}

// POST
export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const newNote = await prisma.note.create({
      data: {
        title,
        content,
      },
    });

    return NextResponse.json({ message: "ok", note: newNote }, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    //console.log(error, "error : failed to create notes ");
    return NextResponse.json({ error: "Il y'a un probleme" }, { status: 500 });
  }
}

// PATCH
export async function PATCH(request: Request) {
  try {
    const { id, title, content } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const updatedNote = await prisma.note.update({
      where: { id: Number(id) },
      data: {
        title: title || undefined,
        content: content || undefined,
      },
    });

    return NextResponse.json(
      { message: "ok", note: updatedNote },
      { status: 200 }
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    //console.log(error, "error : failed to update note ");
    return NextResponse.json({ error: "Il y a un problème" }, { status: 500 });
  }
}

// DELETE
// PATCH
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const deleteNote = await prisma.note.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      { message: "ok", note: deleteNote },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "error : failed to delete note ");
    return NextResponse.json({ error: "Il y a un problème" }, { status: 500 });
  }
}
