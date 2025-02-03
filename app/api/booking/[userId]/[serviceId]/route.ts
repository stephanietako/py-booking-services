// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function DELETE(
//   req: Request,
//   { params }: { params: { userId: string; serviceId: string } }
// ) {
//   try {
//     const { userId, serviceId } = params;

//     // Supprimer la réservation correspondante
//     await prisma.booking.deleteMany({
//       where: { userId, serviceId },
//     });

//     return NextResponse.json(
//       { message: "Service retiré du booking avec succès." },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Erreur lors de la suppression du service réservé:", error);
//     return NextResponse.json(
//       { error: "Impossible de supprimer la réservation." },
//       { status: 500 }
//     );
//   }
// }
