// 1. API pour générer le token de succès (à appeler après paiement réussi)
// app/api/bookings/generate-success-token/route.ts
// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { prisma } from "@/lib/prisma";

// const secret = process.env.JWT_SECRET;

// export async function POST(req: Request) {
//   try {
//     const { sessionId, bookingId } = await req.json();

//     if (!sessionId || !bookingId) {
//       return NextResponse.json(
//         { error: "sessionId et bookingId requis" },
//         { status: 400 }
//       );
//     }

//     if (!secret) {
//       return NextResponse.json(
//         { error: "Configuration serveur incorrecte" },
//         { status: 500 }
//       );
//     }

//     // Vérifier que la réservation existe et que la session correspond
//     const booking = await prisma.booking.findUnique({
//       where: { id: parseInt(bookingId) },
//     });

//     if (!booking || booking.stripeSessionId !== sessionId) {
//       return NextResponse.json(
//         { error: "Réservation ou session invalide" },
//         { status: 403 }
//       );
//     }

//     // Générer un token temporaire (expire dans 1 heure)
//     const token = jwt.sign(
//       {
//         bookingId: parseInt(bookingId),
//         sessionId,
//         type: "payment_success",
//       },
//       secret,
//       { expiresIn: "1h" }
//     );

//     return NextResponse.json({ token });
//   } catch (error) {
//     console.error("Erreur génération token succès:", error);
//     return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
//   }
// }
// app/api/bookings/generate-success-token/route.ts
// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { prisma } from "@/lib/prisma";

// const secret = process.env.JWT_SECRET;

// export async function POST(req: Request) {
//   try {
//     const { sessionId, bookingId } = await req.json();

//     console.log("🔄 Génération token pour:", { sessionId, bookingId });

//     if (!sessionId) {
//       return NextResponse.json({ error: "sessionId requis" }, { status: 400 });
//     }

//     if (!secret) {
//       return NextResponse.json(
//         { error: "Configuration serveur incorrecte" },
//         { status: 500 }
//       );
//     }

//     // Chercher la réservation par sessionId OU par bookingId
//     let booking;

//     if (bookingId) {
//       // Si bookingId fourni, vérifier que sessionId correspond
//       booking = await prisma.booking.findUnique({
//         where: { id: parseInt(bookingId) },
//       });

//       if (booking && booking.stripeSessionId !== sessionId) {
//         return NextResponse.json(
//           { error: "Session ne correspond pas à la réservation" },
//           { status: 403 }
//         );
//       }
//     } else {
//       // Chercher uniquement par sessionId (cas normal depuis Stripe)
//       booking = await prisma.booking.findFirst({
//         where: { stripeSessionId: sessionId },
//       });
//     }

//     if (!booking) {
//       console.error("❌ Réservation introuvable pour sessionId:", sessionId);
//       return NextResponse.json(
//         { error: "Réservation introuvable" },
//         { status: 404 }
//       );
//     }

//     // Vérifier que le paiement est confirmé
//     if (booking.paymentStatus !== "PAID") {
//       console.error(
//         "❌ Paiement non confirmé pour la réservation:",
//         booking.id
//       );
//       return NextResponse.json(
//         { error: "Paiement non confirmé" },
//         { status: 400 }
//       );
//     }

//     // Générer un token temporaire (expire dans 1 heure)
//     const token = jwt.sign(
//       {
//         bookingId: booking.id,
//         sessionId,
//         type: "payment_success",
//       },
//       secret,
//       { expiresIn: "1h" }
//     );

//     console.log("✅ Token généré avec succès pour la réservation:", booking.id);

//     return NextResponse.json({
//       token,
//       bookingId: booking.id,
//     });
//   } catch (error) {
//     console.error("❌ Erreur génération token succès:", error);
//     return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
//   }
// }
// app/api/bookings/generate-success-token/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const secret = process.env.JWT_SECRET;

export async function POST(req: Request) {
  try {
    // On retire bookingId du destructuring, car il ne sera plus passé par défaut
    const { sessionId } = await req.json();

    console.log("🔄 Génération token pour sessionId:", sessionId);

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId requis" }, { status: 400 });
    }

    if (!secret) {
      return NextResponse.json(
        { error: "Configuration serveur incorrecte" },
        { status: 500 }
      );
    }

    // Chercher la réservation uniquement par stripeSessionId
    const booking = await prisma.booking.findFirst({
      where: { stripeSessionId: sessionId },
    });

    if (!booking) {
      console.error("❌ Réservation introuvable pour sessionId:", sessionId);
      return NextResponse.json(
        { error: "Réservation introuvable" },
        { status: 404 }
      );
    }

    // Le statut 'PAID' devrait déjà être mis à jour par le webhook,
    // mais une vérification ici est une bonne pratique.
    if (booking.paymentStatus !== "PAID") {
      console.warn(
        "⚠️ Paiement non confirmé (statut PENDING) pour la réservation:",
        booking.id
      );
      // On peut choisir de retourner une erreur 400 ou de laisser passer si on suppose que
      // le webhook finira par la mettre à jour, mais une erreur est plus sûr pour le client.
      return NextResponse.json(
        { error: "Paiement non confirmé ou en attente" },
        { status: 400 }
      );
    }

    // Générer un token temporaire (expire dans 1 heure)
    const token = jwt.sign(
      {
        bookingId: booking.id,
        sessionId,
        type: "payment_success",
        clientId: booking.clientId,
        userId: booking.userId,
      },
      secret,
      { expiresIn: "1h" }
    );

    console.log("✅ Token généré avec succès pour la réservation:", booking.id);

    return NextResponse.json({
      token,
      bookingId: booking.id, // On peut le renvoyer pour info, mais le token contient l'ID
    });
  } catch (error) {
    console.error("❌ Erreur génération token succès:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
