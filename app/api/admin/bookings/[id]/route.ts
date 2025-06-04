// app/api/bookings/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const bookingId = parseInt((await context.params).id, 10);

  if (isNaN(bookingId)) {
    return NextResponse.json(
      { error: "ID de réservation invalide" },
      { status: 400 }
    );
  } else if (bookingId) {
    return NextResponse.json(
      { message: "ID de réservation valide" },
      { status: 200 }
    );
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Service: true,
        bookingOptions: {
          include: {
            option: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error(
      "Erreur serveur lors de la récupération de la réservation:",
      error
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
};

export const DELETE = async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const bookingId = parseInt((await context.params).id, 10);

  if (isNaN(bookingId)) {
    return NextResponse.json(
      { error: "ID de réservation invalide" },
      { status: 400 }
    );
  }

  try {
    // Supprimer d'abord les BookingOption associées
    await prisma.bookingOption.deleteMany({
      where: { bookingId },
    });
    // Ensuite, supprimer la réservation elle-même
    const deleted = await prisma.booking.delete({
      where: { id: bookingId },
    });

    return NextResponse.json(
      { success: true, deletedBookingId: deleted.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la réservation" },
      { status: 500 }
    );
  }
};
