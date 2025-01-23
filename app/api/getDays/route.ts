// // app/api/getDays/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { formatISO } from "date-fns";
// import { getAuth } from "@clerk/nextjs/server";

// export async function GET(req: NextRequest) {
//   const { userId: getAuthenticatedUserId } = getAuth(req);
//   if (!getAuthenticatedUserId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }
//   const adminUser = await prisma.user.findUnique({
//     where: { clerkUserId: getAuthenticatedUserId },
//     include: { role: true },
//   });
//   if (!adminUser || (adminUser.role && adminUser.role.name !== "admin")) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
//   }

//   try {
//     // Récupération des jours et des jours
//     const days = await prisma.day.findMany();
//     const closedDays = (await prisma.closedDay.findMany()).map((d) =>
//       formatISO(d.date)
//     );

//     // Retourne les données dans la réponse
//     return NextResponse.json({ days, closedDays }, { status: 200 });
//   } catch (error) {
//     console.error("Erreur serveur:", error);
//     return NextResponse.json(
//       { error: "Erreur lors de la récupération des données" },
//       { status: 500 }
//     );
//   }
// }
