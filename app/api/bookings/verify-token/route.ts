// // app/api/bookings/verify-token/route.ts
// import { NextResponse } from "next/server";
// import jwt, { JwtPayload } from "jsonwebtoken";
// import { prisma } from "@/lib/prisma";
// import { Booking } from "@/types";

// const secret = process.env.JWT_SECRET;
// if (!secret) {
//   console.error("❌ JWT_SECRET est manquant dans l'environnement.");
// }

// export async function POST(req: Request) {
//   console.log("➡️ Début de la fonction POST /app/api/bookings/verify-token");
//   try {
//     const { token } = await req.json();
//     console.log("➡️ Token reçu :", token);

//     if (!token) {
//       console.log("❌ Token manquant");
//       return NextResponse.json({ error: "Token manquant" }, { status: 400 });
//     }

//     if (!secret) {
//       console.log("❌ JWT_SECRET manquant");
//       return NextResponse.json(
//         { error: "Configuration serveur incorrecte" },
//         { status: 500 }
//       );
//     }

//     try {
//       console.log("➡️ Tentative de vérification du token avec le secret");
//       const decoded = jwt.verify(token, secret) as JwtPayload;
//       console.log("➡️ Token décodé :", decoded);

//       if (!decoded.bookingId) {
//         console.log("❌ bookingId manquant dans le token");
//         return NextResponse.json(
//           { error: "Token invalide : ID de réservation manquant" },
//           { status: 400 }
//         );
//       }

//       const bookingId = decoded.bookingId;
//       let booking: Booking | null = null;

//       console.log("➡️ bookingId extrait du token :", bookingId);
//       console.log("➡️ decoded.clientId :", decoded.clientId);
//       console.log("➡️ decoded.userId :", decoded.userId);

//       if (decoded.clientId) {
//         booking = await prisma.booking.findUnique({
//           where: { id: bookingId, clientId: decoded.clientId },
//           include: { Service: true, bookingOptions: true, client: true },
//         });
//         console.log("➡️ Résultat de la requête Prisma (clientId) :", booking);
//       } else if (decoded.userId) {
//         booking = await prisma.booking.findUnique({
//           where: { id: bookingId, userId: decoded.userId },
//           include: { Service: true, bookingOptions: true, user: true },
//         });
//         console.log("➡️ Résultat de la requête Prisma (userId) :", booking);
//       }

//       if (!booking) {
//         console.log("❌ Réservation introuvable ou non associée au token");
//         return NextResponse.json(
//           { error: "Réservation introuvable ou non associée à ce token" },
//           { status: 404 }
//         );
//       }

//       console.log("✅ Réservation trouvée, renvoi des données");
//       return NextResponse.json(booking);
//     } catch (error) {
//       let errorMessage = "Token invalide ou expiré";
//       if (error instanceof Error) {
//         console.error(
//           "❌ Erreur lors de la vérification du token :",
//           error.message
//         );
//         errorMessage = error.message;
//       } else {
//         console.error("❌ Erreur lors de la vérification du token :", error);
//       }
//       console.log(
//         "❌ Erreur de vérification du token, réponse :",
//         { error: errorMessage },
//         { status: 401 }
//       );
//       return NextResponse.json({ error: errorMessage }, { status: 401 });
//     }
//   } catch (error) {
//     console.error("❌ Erreur lors du traitement de la requête :", error);
//     return NextResponse.json(
//       { error: "Erreur interne du serveur" },
//       { status: 500 }
//     );
//   }
// }
// app/api/bookings/verify-token/route.ts
import { NextResponse } from "next/server";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { Booking } from "@/types";

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error("❌ JWT_SECRET est manquant dans l'environnement.");
}

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    if (!secret) {
      return NextResponse.json(
        { error: "Configuration serveur incorrecte" },
        { status: 500 }
      );
    }

    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;

      if (!decoded.bookingId) {
        return NextResponse.json(
          { error: "Token invalide : ID de réservation manquant" },
          { status: 400 }
        );
      }

      const bookingId = decoded.bookingId;
      let booking: Booking | null = null;

      if (decoded.clientId) {
        booking = await prisma.booking.findUnique({
          where: { id: bookingId, clientId: decoded.clientId },
          include: {
            Service: true,
            bookingOptions: {
              include: {
                option: true, // Inclure les détails de l'option
              },
            },
            client: true,
          },
        });
      } else if (decoded.userId) {
        booking = await prisma.booking.findUnique({
          where: { id: bookingId, userId: decoded.userId },
          include: {
            Service: true,
            bookingOptions: {
              include: {
                option: true, // Inclure les détails de l'option
              },
            },
            user: true,
          },
        });
      }

      if (!booking) {
        // 403 Forbidden, car token valide mais accès refusé
        return NextResponse.json(
          { error: "Accès refusé à cette réservation" },
          { status: 403 }
        );
      }

      return NextResponse.json({ data: booking });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return NextResponse.json({ error: "Token expiré" }, { status: 401 });
      }
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }
  } catch (error) {
    console.error("Erreur interne dans /verify-token :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
