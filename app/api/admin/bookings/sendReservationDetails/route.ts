import { NextResponse } from "next/server";
import { buildAdminReservationEmail } from "@/lib/emails/adminReservationDetails";
import { requestConfirmationEmail } from "@/lib/emails/requestConfirmation";
import { sendEmail } from "@/lib/email/send";
import { PrismaClient } from "@prisma/client";
import { Service, PricingRule } from "@/types";

const prisma = new PrismaClient();
const adminEmail = process.env.ADMIN_EMAIL;

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

    if (!adminEmail) {
      console.error("❌ ADMIN_EMAIL non défini");
      return NextResponse.json(
        { error: "ADMIN_EMAIL manquant dans l'environnement" },
        { status: 500 }
      );
    }

    // --- Récupération des détails de la réservation ---
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId, 10) },
      include: {
        client: true,
        user: true,
        Service: {
          include: {
            pricingRules: true,
          },
        },
        bookingOptions: {
          include: {
            option: true,
          },
        },
      },
    });

    if (booking && booking.Service) {
      console.log(
        "booking.Service.pricingRules:",
        booking.Service.pricingRules
      );
    }
    if (!booking?.Service?.pricingRules) {
      throw new Error("Aucune règle de prix trouvée pour ce service !");
    }

    if (!booking) {
      return NextResponse.json(
        { error: `Réservation avec l'ID ${bookingId} introuvable.` },
        { status: 404 }
      );
    }

    // Vérification des données de réservation
    const needsCaptain =
      !booking.withCaptain && booking.Service?.requiresCaptain;
    const captainPrice = needsCaptain
      ? (booking.Service?.captainPrice ?? 350)
      : 0;

    const totalPayableOnBoardCalculated =
      booking.bookingOptions
        .filter((bo) => bo.option?.payableAtBoard)
        .reduce(
          (sum, bo) => sum + (bo.option?.unitPrice || 0) * (bo.quantity || 1),
          0
        ) + captainPrice;

    // Préparer les paramètres pour l'email client
    const clientEmailParams = {
      bookingId: booking.id.toString(),
      clientName: booking.client?.fullName || "",
      clientEmail: booking.client?.email || "",
      serviceName: booking.Service?.name || "",
      startTime: booking.startTime,
      endTime: booking.endTime,
      boatAmount: booking.boatAmount,
      mealOption: booking.mealOption,
      withCaptain: booking.withCaptain,
      captainPrice: captainPrice,
      totalPayableOnBoardCalculated,
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

    function getBoatPriceForDate(date: Date, service: Service): number {
      const rules = service.pricingRules ?? [];
      const rule = rules.find(
        (r: PricingRule) =>
          date >= new Date(r.startDate) && date <= new Date(r.endDate)
      );
      return rule?.price ?? service.defaultPrice ?? 1500;
    }

    const dynamicBoatAmount = booking.Service
      ? getBoatPriceForDate(booking.startTime, {
          ...booking.Service,
          pricingRules: (booking.Service.pricingRules ?? []).map((rule) => ({
            ...rule,
            startDate: new Date(rule.startDate),
            endDate: new Date(rule.endDate),
          })),
        })
      : 1500;

    const emailParams = {
      bookingId: booking.id.toString(),
      firstName: booking.client?.fullName.split(" ")[0] || "",
      lastName: booking.client?.fullName.split(" ").slice(1).join(" ") || "",
      email: booking.client?.email || "",
      phoneNumber: booking.client?.phoneNumber || "",
      reservationTime: new Date(booking.startTime).toLocaleString("fr-FR"),
      stripeUrl,
      comment: booking.description || "",
      bookingOptions: booking.bookingOptions.map((bo) => ({
        quantity: bo.quantity,
        option: {
          unitPrice: bo.option?.unitPrice || 0,
          label: bo.option?.label || "Option inconnue",
          payableAtBoard: bo.option?.payableAtBoard || false,
        },
      })),
      withCaptain: booking.withCaptain,
      mealOption: booking.mealOption,
      boatAmount: dynamicBoatAmount,
      service: {
        name: booking.Service?.name || "",
        currency: booking.Service?.currency || "EUR",
        cautionAmount: booking.Service?.cautionAmount || 0,
        requiresCaptain: booking.Service?.requiresCaptain || false,
      },
      captainPrice,
      totalPayableOnBoardCalculated,
    };
    console.log("EMAIL PARAMS ADMIN:", emailParams);
    // Envoi de l'email à l'admin
    const { subject, html, text } = buildAdminReservationEmail(emailParams);
    await sendEmail({
      to: adminEmail,
      subject,
      html,
      text,
    });

    // Envoi de l'email de confirmation au client
    const clientMail = requestConfirmationEmail(clientEmailParams);
    await sendEmail({
      to: clientMail.to,
      subject: clientMail.subject,
      html: clientMail.html,
      text: clientMail.text,
    });

    // Envoi de la facture à l'admin
    const invoiceResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/bookings/send-invoice`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: body.bookingId,
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
