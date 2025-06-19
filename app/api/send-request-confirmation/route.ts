// app/api/send-request-confirmation/route.ts
// import { NextResponse } from "next/server";
// import { sendEmail } from "@/lib/email/send";
// import { requestConfirmationEmail } from "@/lib/emails/requestConfirmation";
// import { PrismaClient } from "@prisma/client"; // Import de PrismaClient
// //import { format } from 'date-fns'; // Pour formater les dates

// const prisma = new PrismaClient(); // Initialisation de Prisma
// //const CAPTAIN_PRICE = 350; // Prix fixe du capitaine, à définir ici ou dans une config partagée

// export async function POST(req: Request) {
//   try {
//     const { bookingId } = await req.json(); // Seul bookingId est nécessaire ici

//     if (!bookingId) {
//       return NextResponse.json(
//         { error: "bookingId manquant" },
//         { status: 400 }
//       );
//     }

//     // --- LOGIQUE DE RÉCUPÉRATION DES DÉTAILS DE LA RÉSERVATION (intégrée ici) ---
//     const booking = await prisma.booking.findUnique({
//       where: { id: parseInt(bookingId, 10) },
//       include: {
//         client: true,
//         service: true, // Inclure les détails du service
//         bookingOptions: {
//           include: {
//             option: true, // Inclure les détails de l'option
//           },
//         },
//       },
//     });

//     if (!booking) {
//       return NextResponse.json(
//         { error: `Réservation avec l'ID ${bookingId} introuvable.` },
//         { status: 404 }
//       );
//     }

//     const needsCaptain =
//       !booking.withCaptain && booking.service?.requiresCaptain;
//     const captainAmountToAdd = needsCaptain
//       ? (booking.service?.captainPrice ?? 350)
//       : 0;

//     const totalOptionsPayableAtBoard = booking.bookingOptions.reduce(
//       (sum, bo) =>
//         bo.option?.payableAtBoard
//           ? sum + bo.quantity * bo.option.unitPrice
//           : sum,
//       0
//     );

//     // Montant total à régler à bord (options payables à bord + capitaine si applicable)
//     const totalPayableOnBoardCalculated =
//       totalOptionsPayableAtBoard + captainAmountToAdd;
//     // --- FIN LOGIQUE DE RÉCUPÉRATION ---

//     // Préparer les paramètres pour l'e-mail de confirmation
//     const emailParams = {
//       bookingId: booking.id.toString(),
//       clientName: booking.client?.fullName || "Client",
//       clientEmail: booking.client?.email || "", // Assurez-vous que l'email client est toujours valide
//       serviceName: booking.service?.name || "Service",
//       startTime: booking.startTime,
//       endTime: booking.endTime,
//       boatAmount: booking.boatAmount,
//       mealOption: booking.mealOption,
//       withCaptain: booking.withCaptain,
//       captainPrice: captainAmountToAdd,
//       totalPayableOnBoardCalculated: totalPayableOnBoardCalculated,
//       cautionAmount: booking.service?.cautionAmount || 0,
//       bookingOptions: booking.bookingOptions.map((bo) => ({
//         quantity: bo.quantity,
//         option: {
//           unitPrice: bo.option?.unitPrice || 0,
//           label: bo.option?.label || "Option inconnue",
//           payableAtBoard: bo.option?.payableAtBoard || false,
//         },
//       })),
//       comment: booking.description || "",
//     };

//     // Vérification de l'email client après la récupération
//     if (!emailParams.clientEmail.includes("@")) {
//       return NextResponse.json(
//         { error: "Email client invalide dans les détails de la réservation." },
//         { status: 400 }
//       );
//     }

//     const emailData = requestConfirmationEmail(emailParams);

//     await sendEmail(emailData);

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error(
//       "❌ Erreur lors de l'envoi de l'email de confirmation :",
//       error
//     );
//     return NextResponse.json(
//       { error: "Erreur interne lors de l'envoi de l'email" },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect(); // Déconnexion de Prisma
//   }
// }
import { NextResponse } from "next/server";
import { buildAdminReservationEmail } from "@/lib/emails/adminReservationDetails";
import { requestConfirmationEmail } from "@/lib/emails/requestConfirmation";
import { sendEmail } from "@/lib/email/send";
import { PrismaClient } from "@prisma/client";
import type { Service, PricingRule } from "@/types";

const prisma = new PrismaClient();
const adminEmail = process.env.ADMIN_EMAIL;

// type BookingWithContact = {
//   client: {
//     fullName: string;
//     email: string;
//     phoneNumber?: string | null;
//   } | null;
//   user: { name: string; email: string; phoneNumber?: string | null } | null;
// };

function getContactInfo(booking: {
  client?: {
    fullName?: string;
    email?: string;
    phoneNumber?: string | null;
  } | null;
  user?: {
    name?: string;
    email?: string;
    phoneNumber?: string | null;
    client?: { phoneNumber?: string | null } | null;
  } | null;
}) {
  const phoneNumber =
    booking.client?.phoneNumber?.trim() ||
    booking.user?.phoneNumber?.trim() ||
    booking.user?.client?.phoneNumber?.trim() ||
    "";

  if (booking.client && booking.client.fullName && booking.client.email) {
    return {
      fullName: booking.client.fullName,
      email: booking.client.email,
      phoneNumber,
    };
  } else if (booking.user && booking.user.name && booking.user.email) {
    return {
      fullName: booking.user.name,
      email: booking.user.email,
      phoneNumber,
    };
  } else {
    return {
      fullName: "",
      email: "",
      phoneNumber: "",
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, stripeUrl } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: `Champ manquant : bookingId` },
        { status: 400 }
      );
    }

    const bookingIdNum = parseInt(bookingId, 10);
    if (isNaN(bookingIdNum)) {
      return NextResponse.json(
        { error: "bookingId invalide" },
        { status: 400 }
      );
    }

    if (!adminEmail) {
      console.error("❌ ADMIN_EMAIL non défini");
      return NextResponse.json(
        { error: "ADMIN_EMAIL manquant dans l'environnement" },
        { status: 500 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingIdNum },
      include: {
        client: true,
        user: true,
        service: {
          include: { pricingRules: true },
        },
        bookingOptions: {
          include: { option: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: `Réservation avec l'ID ${bookingIdNum} introuvable.` },
        { status: 404 }
      );
    }

    if (!booking.service) {
      return NextResponse.json(
        { error: "Service lié à la réservation introuvable" },
        { status: 404 }
      );
    }

    if (!booking.service.pricingRules) {
      throw new Error("Aucune règle de prix trouvée pour ce service !");
    }

    // Utilisation de getContactInfo pour uniformiser les infos contact
    const contactInfo = getContactInfo(booking);

    // Calcul du prix capitaine si nécessaire
    const needsCaptain =
      !booking.withCaptain && booking.service.requiresCaptain;
    const captainPrice = needsCaptain
      ? (booking.service.captainPrice ?? 350)
      : 0;

    // Somme des options payables à bord
    const totalPayableOnBoardCalculated =
      booking.bookingOptions
        .filter((bo) => bo.option?.payableAtBoard)
        .reduce(
          (sum, bo) => sum + (bo.option?.amount || 0) * (bo.quantity || 1),
          0
        ) + captainPrice;

    // Fonction pour obtenir le prix du bateau selon la date et règles
    function getBoatPriceForDate(date: Date, service: Service): number {
      const rules = service.pricingRules ?? [];
      const rule = rules.find(
        (r: PricingRule) =>
          date >= new Date(r.startDate) && date <= new Date(r.endDate)
      );
      return rule?.price ?? service.defaultPrice ?? 1500;
    }

    // Calcul dynamique du prix bateau
    const dynamicBoatAmount = getBoatPriceForDate(booking.startTime, {
      ...booking.service,
      pricingRules: (booking.service.pricingRules ?? []).map((rule) => ({
        ...rule,
        startDate: new Date(rule.startDate),
        endDate: new Date(rule.endDate),
      })),
    });

    // Préparer params email client
    const clientEmailParams = {
      bookingId: booking.id.toString(),
      clientName: contactInfo.fullName,
      clientEmail: contactInfo.email,
      clientPhoneNumber: contactInfo.phoneNumber,
      serviceName: booking.service.name || "",
      startTime: booking.startTime,
      endTime: booking.endTime,
      boatAmount: booking.boatAmount,
      mealOption: booking.mealOption ?? null,
      withCaptain: booking.withCaptain,
      captainPrice,
      totalPayableOnBoardCalculated,
      cautionAmount: booking.service.cautionAmount || 0,
      bookingOptions: booking.bookingOptions.map((bo) => ({
        quantity: bo.quantity,
        option: {
          unitPrice: bo.option?.amount || 0,
          label: bo.option?.label || "Option inconnue",
          payableAtBoard: bo.option?.payableAtBoard || false,
        },
      })),
      comment: booking.description || "",
    };

    // Préparer params email admin
    const emailParams = {
      bookingId: booking.id.toString(),
      firstName: contactInfo.fullName.split(" ")[0] || "",
      lastName: contactInfo.fullName.split(" ").slice(1).join(" ") || "",
      email: contactInfo.email,
      phoneNumber: contactInfo.phoneNumber,
      reservationTime: new Date(booking.startTime).toLocaleString("fr-FR"),
      stripeUrl,
      comment: booking.description || "",
      bookingOptions: booking.bookingOptions.map((bo) => ({
        quantity: bo.quantity,
        option: {
          unitPrice: bo.option?.amount || 0,
          label: bo.option?.label || "Option inconnue",
          payableAtBoard: bo.option?.payableAtBoard || false,
        },
      })),
      withCaptain: booking.withCaptain,
      mealOption: booking.mealOption ?? null,
      boatAmount: dynamicBoatAmount,
      service: {
        name: booking.service.name || "",
        currency: booking.service.currency || "EUR",
        cautionAmount: booking.service.cautionAmount || 0,
        requiresCaptain: booking.service.requiresCaptain || false,
      },
      captainPrice,
      totalPayableOnBoardCalculated,
    };

    // Envoi email admin
    const { subject, html, text } = buildAdminReservationEmail(emailParams);
    await sendEmail({ to: adminEmail, subject, html, text });

    // Envoi email client
    const clientMail = requestConfirmationEmail(clientEmailParams);
    await sendEmail({
      to: clientMail.to,
      subject: clientMail.subject,
      html: clientMail.html,
      text: clientMail.text,
    });

    // Envoi facture à admin via API interne
    const invoiceResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/bookings/send-invoice`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingIdNum,
          sendToClient: false,
        }),
      }
    );

    if (!invoiceResponse.ok) {
      console.warn(
        "⚠️ Facture non envoyée correctement :",
        await invoiceResponse.text()
      );
    }

    return NextResponse.json(
      { message: "Email et facture envoyés à l'admin avec succès !" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erreur dans sendReservationDetails:", error);
    const message = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
