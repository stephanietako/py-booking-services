// app/api/admin/bookings/sendReservationDetails/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { requestConfirmationEmail } from "@/lib/emails/requestConfirmation";
import { sendEmail } from "@/lib/email/send";
import { PrismaClient } from "@prisma/client";
import { buildAdminReservationEmail } from "@/lib/emails/adminReservationDetails";

const prisma = new PrismaClient();
const adminEmail = process.env.ADMIN_EMAIL;

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

export async function POST(request: NextRequest) {
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

    // Uniformiser les infos contact
    const contactInfo = getContactInfo(booking);

    // Calcul du prix capitaine si nécessaire
    const needsCaptain =
      !booking.withCaptain && booking.service.requiresCaptain;
    const captainPrice = needsCaptain
      ? (booking.service.captainPrice ?? 350)
      : 0;

    // Somme des options payables à bord avec unitPrice corrigé
    const totalPayableOnBoardCalculated =
      (booking.bookingOptions ?? [])
        .filter((bo) => bo.option?.payableAtBoard)
        .reduce(
          (sum, bo) => sum + (bo.option?.unitPrice || 0) * (bo.quantity || 1),
          0
        ) + captainPrice;

    const boatAmount = booking.boatAmount ?? 0;

    const clientEmailParams = {
      bookingId: booking.id.toString(),
      clientName: contactInfo.fullName,
      clientEmail: contactInfo.email,
      clientPhoneNumber: contactInfo.phoneNumber,
      serviceName: booking.service.name || "",
      startTime: booking.startTime,
      endTime: booking.endTime,
      boatAmount,
      mealOption: booking.mealOption ?? null,
      withCaptain: booking.withCaptain,
      captainPrice,
      totalPayableOnBoardCalculated,
      cautionAmount: booking.service.cautionAmount || 0,
      bookingOptions: (booking.bookingOptions ?? []).map((bo) => ({
        quantity: bo.quantity,
        option: {
          unitPrice: bo.option?.unitPrice || 0,
          label: bo.option?.label || "Option inconnue",
          payableAtBoard: bo.option?.payableAtBoard || false,
        },
      })),
      comment: booking.description || "",
    };

    const emailParams = {
      bookingId: booking.id.toString(),
      firstName: contactInfo.fullName.split(" ")[0] || "",
      lastName: contactInfo.fullName.split(" ").slice(1).join(" ") || "",
      email: contactInfo.email,
      phoneNumber: contactInfo.phoneNumber,
      reservationTime: new Date(booking.startTime).toLocaleString("fr-FR"),
      stripeUrl,
      comment: booking.description || "",
      bookingOptions: (booking.bookingOptions ?? []).map((bo) => ({
        quantity: bo.quantity,
        option: {
          unitPrice: bo.option?.unitPrice || 0,
          label: bo.option?.label || "Option inconnue",
          payableAtBoard: bo.option?.payableAtBoard || false,
        },
      })),
      withCaptain: booking.withCaptain,
      mealOption: booking.mealOption ?? null,
      boatAmount,
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
