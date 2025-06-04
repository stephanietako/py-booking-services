// app/api/send-request-confirmation/route.ts
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";
import { requestConfirmationEmail } from "@/lib/emails/requestConfirmation";
import { PrismaClient } from "@prisma/client"; // Import de PrismaClient
//import { format } from 'date-fns'; // Pour formater les dates

const prisma = new PrismaClient(); // Initialisation de Prisma
//const CAPTAIN_PRICE = 350; // Prix fixe du capitaine, à définir ici ou dans une config partagée

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json(); // Seul bookingId est nécessaire ici

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId manquant" },
        { status: 400 }
      );
    }

    // --- LOGIQUE DE RÉCUPÉRATION DES DÉTAILS DE LA RÉSERVATION (intégrée ici) ---
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId, 10) },
      include: {
        client: true,
        Service: true, // Inclure les détails du service
        bookingOptions: {
          include: {
            option: true, // Inclure les détails de l'option
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: `Réservation avec l'ID ${bookingId} introuvable.` },
        { status: 404 }
      );
    }

    const needsCaptain =
      !booking.withCaptain && booking.Service?.requiresCaptain;
    const captainAmountToAdd = needsCaptain
      ? (booking.Service?.captainPrice ?? 350)
      : 0;

    const totalOptionsPayableAtBoard = booking.bookingOptions.reduce(
      (sum, bo) =>
        bo.option?.payableAtBoard
          ? sum + bo.quantity * bo.option.unitPrice
          : sum,
      0
    );

    // Montant total à régler à bord (options payables à bord + capitaine si applicable)
    const totalPayableOnBoardCalculated =
      totalOptionsPayableAtBoard + captainAmountToAdd;
    // --- FIN LOGIQUE DE RÉCUPÉRATION ---

    // Préparer les paramètres pour l'e-mail de confirmation
    const emailParams = {
      bookingId: booking.id.toString(),
      clientName: booking.client?.fullName || "Client",
      clientEmail: booking.client?.email || "", // Assurez-vous que l'email client est toujours valide
      serviceName: booking.Service?.name || "Service",
      startTime: booking.startTime,
      endTime: booking.endTime,
      boatAmount: booking.boatAmount,
      mealOption: booking.mealOption,
      withCaptain: booking.withCaptain,
      captainPrice: captainAmountToAdd,
      totalPayableOnBoardCalculated: totalPayableOnBoardCalculated,
      cautionAmount: booking.Service?.cautionAmount || 0,
      bookingOptions: booking.bookingOptions.map((bo) => ({
        quantity: bo.quantity,
        option: {
          unitPrice: bo.option?.unitPrice || 0,
          label: bo.option?.label || "Option inconnue",
          payableAtBoard: bo.option?.payableAtBoard || false,
        },
      })),
      comment: booking.description || "",
    };

    // Vérification de l'email client après la récupération
    if (!emailParams.clientEmail.includes("@")) {
      return NextResponse.json(
        { error: "Email client invalide dans les détails de la réservation." },
        { status: 400 }
      );
    }

    const emailData = requestConfirmationEmail(emailParams);

    await sendEmail(emailData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email de confirmation :",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne lors de l'envoi de l'email" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Déconnexion de Prisma
  }
}
