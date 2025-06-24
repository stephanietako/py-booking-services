// lib/emails/clientConfirmationEmail.ts
import {
  Booking,
  BookingOption,
  Client,
  Option,
  Service,
} from "@prisma/client";
import { format } from "date-fns";
import { escapeHtml } from "@/utils/escapeHtml";

export interface BookingWithDetailsForEmail extends Booking {
  client: Client | null;
  service: Service | null;
  bookingOptions: (BookingOption & { option: Option | null })[];
  captainPrice: number;
  totalPayableOnBoardCalculated: number;
  cautionAmount: number;
  comment?: string;
}

function safeDate(date: Date | string | null | undefined): Date {
  if (!date) return new Date();

  if (date instanceof Date && !isNaN(date.getTime())) {
    return date;
  }

  if (typeof date === "string") {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
}

export function buildClientConfirmationEmail(
  booking: BookingWithDetailsForEmail
): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    client,
    service,
    bookingOptions = [],
    startTime,
    endTime,
    boatAmount,
    mealOption,
    withCaptain,
    captainPrice,
    totalPayableOnBoardCalculated,
    cautionAmount,
    comment,
  } = booking;

  const fullName = client?.fullName ?? "Client";
  const email = client?.email ?? "Non renseigné";
  const phoneNumber = client?.phoneNumber ?? "Non renseigné";
  const currency = service?.currency || "EUR";

  const formatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  });

  const formattedStart = format(safeDate(startTime), "dd/MM/yyyy 'à' HH:mm");
  const formattedEnd = format(safeDate(endTime), "HH:mm");

  const serviceName = service?.name || "Service Réservé";

  const captainText = withCaptain
    ? `Vous avez votre propre capitaine.`
    : `Un capitaine vous sera fourni pour ${formatter.format(captainPrice)}.`;

  const optionsHtmlList = bookingOptions
    .filter((opt) => opt.option?.payableAtBoard)
    .map((opt) => {
      const qty = opt.quantity ?? 1;
      const pricePerUnit = opt.option?.unitPrice ?? 0;
      const name = opt.option?.label ?? "Option inconnue";
      return `<li>${qty} × ${name} — ${formatter.format(pricePerUnit * qty)}</li>`;
    })
    .filter(Boolean)
    .join("");

  const optionsHtml = optionsHtmlList
    ? `<h3 style="color: #0056b3; margin-top: 20px;">Options supplémentaires (à régler à bord) :</h3><ul style="padding-left: 20px; margin-bottom: 25px;">${optionsHtmlList}</ul>`
    : `<p>Aucune option supplémentaire à régler à bord.</p>`;

  const subject = `Confirmation de votre réservation - ${serviceName} le ${format(
    safeDate(startTime),
    "dd/MM/yyyy"
  )}`;

  const html = `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day Logo" width="180" style="max-width: 100%; height: auto;">
    </div>
    <h2 style="color: #005ea2; text-align: center; margin-bottom: 25px;">Bonjour ${fullName},</h2>
    <p style="font-size: 16px;">
      Merci pour votre réservation de <strong style="color: #007bff;">${serviceName}</strong> avec <strong style="color: #005ea2;">Yachting Day</strong>.
    </p>
    <p style="font-size: 16px;">
      Votre réservation a été confirmée ! Voici les détails :
    </p>
    <ul style="list-style-type: none; padding: 0; margin-bottom: 25px;">
      <li><strong>Date et heure :</strong> Du ${formattedStart} au ${formattedEnd}</li>
      <li><strong>Service réservé :</strong> ${serviceName}</li>
      <li><strong>Montant de la location du bateau réglé en ligne :</strong> <span style="color: #28a745; font-weight: bold;">${formatter.format(
        boatAmount
      )}</span></li>
      <li><strong>Capitaine :</strong> ${captainText}</li>
      <li><strong>Option repas traiteur :</strong> ${
        mealOption
          ? "Oui. L'administrateur vous contactera pour les détails et prix."
          : "Non."
      }</li>
    </ul>
    ${
      comment
        ? `<p style="margin-top:18px;"><strong>Commentaire client :</strong> ${escapeHtml(
            comment
          )}</p>`
        : ""
    }
    ${optionsHtml}

    <p style="font-size: 17px; font-weight: bold; color: #005ea2; margin-top: 25px;">
        Total à régler à bord (options + capitaine) : ${formatter.format(
          totalPayableOnBoardCalculated
        )}
    </p>
    <p style="font-size: 17px; font-weight: bold; color: #dc3545; margin-top: 10px;">
        Caution à prévoir et à régler à bord : ${formatter.format(cautionAmount)}
    </p>

    <p style="font-size: 16px;">
      Informations client :<br/>
      Email : ${email}<br/>
      Téléphone : ${phoneNumber}
    </p>
    <p style="font-size: 16px;">
      Nous avons hâte de vous accueillir à bord et vous souhaitons une excellente expérience !
    </p>
    <p style="font-style: italic; text-align: center; color: #666; margin-top: 30px;">
      Cordialement,<br/>
      L’équipe Yachting Day
    </p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">
      Cet e-mail est une confirmation de votre réservation.
    </p>
  </div>
`;

  const text =
    `Bonjour ${fullName},\n` +
    `Merci pour votre réservation de ${serviceName} avec Yachting Day.\n\n` +
    `Votre réservation a été confirmée ! Voici les détails :\n` +
    `Date et heure : Du ${formattedStart} au ${formattedEnd}\n` +
    `Service réservé : ${serviceName}\n` +
    `Montant de la location du bateau réglé en ligne : ${formatter.format(
      boatAmount
    )}\n` +
    `Capitaine : ${captainText}\n` +
    `Option repas traiteur : ${
      mealOption
        ? "Oui. L'administrateur vous contactera pour les détails et prix."
        : "Non."
    }\n\n` +
    `Options supplémentaires (à régler à bord) :\n` +
    bookingOptions
      .filter((opt) => opt.option?.payableAtBoard)
      .map((opt) => {
        const qty = opt.quantity ?? 1;
        const pricePerUnit = opt.option?.unitPrice ?? 0;
        const name = opt.option?.label ?? "Option inconnue";
        return ` - ${qty} × ${name} — ${formatter.format(pricePerUnit * qty)}`;
      })
      .filter(Boolean)
      .join("\n") +
    `\n\nTotal à régler à bord (options + capitaine) : ${formatter.format(
      totalPayableOnBoardCalculated
    )}\n` +
    `Caution à prévoir et à régler à bord : ${formatter.format(cautionAmount)}\n\n` +
    `Informations client:\n` +
    `Email : ${email}\n` +
    `Téléphone : ${phoneNumber}\n\n` +
    `Nous avons hâte de vous accueillir à bord et vous souhaitons une excellente expérience !\n\n` +
    (comment ? `Commentaire client : ${comment}\n` : "") +
    `Cordialement,\n` +
    `L’équipe Yachting Day`;

  return { subject, html, text };
}
