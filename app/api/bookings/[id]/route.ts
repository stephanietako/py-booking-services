// app/api/bookings/[id]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { getAuth } from "@clerk/nextjs/server";

// export async function GET(req: NextRequest) {
//   const { userId: requesterClerkId } = getAuth(req);

//   if (!requesterClerkId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { pathname } = req.nextUrl; // ex: /api/bookings/123
//   const parts = pathname.split("/");
//   const id = parts[parts.length - 1];

//   const bookingId = parseInt(id, 10);
//   if (isNaN(bookingId)) {
//     return NextResponse.json({ error: "ID invalide" }, { status: 400 });
//   }

//   // Récupérer le requester avec son rôle
//   const requester = await prisma.user.findUnique({
//     where: { clerkUserId: requesterClerkId },
//     include: { role: true },
//   });

//   if (!requester) {
//     return NextResponse.json(
//       { error: "Utilisateur non trouvé" },
//       { status: 401 }
//     );
//   }

//   // Récupérer la réservation avec relations
//   const booking = await prisma.booking.findUnique({
//     where: { id: bookingId },
//     include: {
//       client: true,
//       service: true,
//       bookingOptions: { include: { option: true } },
//       user: { include: { client: true } },
//     },
//   });

//   if (!booking) {
//     return NextResponse.json(
//       { error: "Réservation introuvable" },
//       { status: 404 }
//     );
//   }

//   // Vérifier si requester est admin ou propriétaire de la réservation (userId)
//   const isAdmin = requester.role?.name === "admin";
//   const isOwner = booking.userId === requester.id;

//   if (!isAdmin && !isOwner) {
//     return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
//   }

//   // Priorité téléphone booking.client > booking.user.client
//   const phoneNumber =
//     booking.client?.phoneNumber || booking.user?.client?.phoneNumber || null;

//   const bookingWithPhone = {
//     ...booking,
//     phoneNumber,
//   };

//   return NextResponse.json(bookingWithPhone);
// }
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { getAuth } from "@clerk/nextjs/server";
// import { BookingStatus } from "@prisma/client";

// export async function GET(req: NextRequest) {
//   const { userId: requesterClerkId } = getAuth(req);

//   if (!requesterClerkId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { pathname } = req.nextUrl; // ex: /api/bookings/123
//   const parts = pathname.split("/");
//   const id = parts[parts.length - 1];
//   const bookingId = parseInt(id, 10);
//   if (isNaN(bookingId)) {
//     return NextResponse.json({ error: "ID invalide" }, { status: 400 });
//   }

//   const requester = await prisma.user.findUnique({
//     where: { clerkUserId: requesterClerkId },
//     include: { role: true },
//   });

//   if (!requester) {
//     return NextResponse.json(
//       { error: "Utilisateur non trouvé" },
//       { status: 401 }
//     );
//   }

//   const booking = await prisma.booking.findUnique({
//     where: { id: bookingId },
//     include: {
//       client: true,
//       service: true,
//       bookingOptions: { include: { option: true } },
//       user: { include: { client: true } },
//     },
//   });

//   if (!booking) {
//     return NextResponse.json(
//       { error: "Réservation introuvable" },
//       { status: 404 }
//     );
//   }

//   const isAdmin = requester.role?.name === "admin";
//   const isOwner = booking.userId === requester.id;

//   if (!isAdmin && !isOwner) {
//     return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
//   }

//   const phoneNumber =
//     booking.client?.phoneNumber || booking.user?.client?.phoneNumber || null;

//   const bookingWithPhone = {
//     ...booking,
//     phoneNumber,
//   };

//   return NextResponse.json(bookingWithPhone);
// }

// export async function PUT(req: NextRequest) {
//   const { userId: requesterClerkId } = getAuth(req);

//   if (!requesterClerkId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { pathname } = req.nextUrl;
//   const idStr = pathname.split("/").pop();
//   const bookingId = Number(idStr);

//   if (!bookingId || isNaN(bookingId)) {
//     return NextResponse.json({ error: "ID invalide" }, { status: 400 });
//   }

//   const { status } = await req.json();

//   if (!status || typeof status !== "string") {
//     return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
//   }

//   // Valider que status est un des BookingStatus valides
//   if (!Object.values(BookingStatus).includes(status as BookingStatus)) {
//     return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
//   }

//   const requester = await prisma.user.findUnique({
//     where: { clerkUserId: requesterClerkId },
//     include: { role: true },
//   });

//   if (!requester) {
//     return NextResponse.json(
//       { error: "Utilisateur non trouvé" },
//       { status: 401 }
//     );
//   }

//   // Ici, par exemple, on autorise uniquement les admins à modifier le statut
//   if (requester.role?.name !== "admin") {
//     return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
//   }

//   try {
//     const updatedBooking = await prisma.booking.update({
//       where: { id: bookingId },
//       data: {
//         status: status as BookingStatus,
//         approvedByAdmin: status === BookingStatus.APPROVED,
//         paymentStatus: status === BookingStatus.PAID ? "PAID" : undefined,
//       },
//     });

//     return NextResponse.json(updatedBooking);
//   } catch (error) {
//     console.error("Erreur mise à jour réservation:", error);

//     if (
//       error instanceof Error &&
//       error.message.includes("Record to update not found")
//     ) {
//       return NextResponse.json(
//         { error: "Réservation introuvable" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       { error: "Échec mise à jour réservation" },
//       { status: 500 }
//     );
//   }
// }
// app/api/bookings/[id]/route.ts
// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ajuste selon ton setup

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    const sessionId = request.nextUrl.searchParams.get("session_id");

    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: "ID de réservation invalide" },
        { status: 400 }
      );
    }

    // Récupérer la réservation avec toutes les relations
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          select: {
            name: true,
            description: true,
          },
        },
        bookingOptions: {
          include: {
            option: true,
          },
        },
        client: {
          select: {
            fullName: true,
            email: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
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

    // Optionnel : vérifier que la session Stripe correspond
    if (
      sessionId &&
      booking.stripeSessionId &&
      booking.stripeSessionId !== sessionId
    ) {
      return NextResponse.json(
        { error: "Session non valide" },
        { status: 403 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Erreur API bookings:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
