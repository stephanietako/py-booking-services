// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const bookingId = parseInt(params.id, 10);
//   if (isNaN(bookingId)) {
//     return NextResponse.json({ error: "ID invalide" }, { status: 400 });
//   }
//   const booking = await prisma.booking.findUnique({
//     where: { id: bookingId },
//     include: {
//       client: true,
//       Service: true,
//       bookingOptions: { include: { option: true } },
//     },
//   });
//   if (!booking) {
//     return NextResponse.json(
//       { error: "Réservation introuvable" },
//       { status: 404 }
//     );
//   }
//   return NextResponse.json(booking);
// }
// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { pathname } = req.nextUrl; // ex: /api/bookings/123
  const parts = pathname.split("/");
  const id = parts[parts.length - 1];

  const bookingId = parseInt(id, 10);
  if (isNaN(bookingId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      client: true,
      Service: true,
      bookingOptions: { include: { option: true } },
    },
  });

  if (!booking) {
    return NextResponse.json(
      { error: "Réservation introuvable" },
      { status: 404 }
    );
  }

  return NextResponse.json(booking);
}
