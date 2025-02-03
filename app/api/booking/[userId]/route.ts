// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma"; // Assure-toi d’avoir un client Prisma configuré

// export async function GET(
//   req: Request,
//   { params }: { params: { userId: string } }
// ) {
//   try {
//     const { userId } = params;

//     // Récupérer toutes les réservations de l'utilisateur
//     const bookings = await prisma.booking.findMany({
//       where: { userId },
//       include: { service: true }, // Inclure les détails du service
//     });

//     return NextResponse.json(bookings, { status: 200 });
//   } catch (error) {
//     console.error(
//       "Erreur lors de la récupération des services réservés:",
//       error
//     );
//     return NextResponse.json(
//       { error: "Impossible de charger les services réservés." },
//       { status: 500 }
//     );
//   }
// }
