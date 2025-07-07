// lib/emails/requestConfirmation.ts
import { format } from "date-fns";
import { escapeHtml } from "@/utils/escapeHtml";

interface DetailedBookingOption {
  quantity: number;
  option: {
    unitPrice: number;
    label: string;
    payableAtBoard: boolean;
  };
}

export interface RequestConfirmationEmailParams {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  clientPhoneNumber: string;
  serviceName: string;
  startTime: Date | string;
  endTime: Date | string;
  boatAmount: number;
  mealOption: boolean;
  withCaptain: boolean;
  captainPrice: number;
  totalPayableOnBoardCalculated: number;
  cautionAmount: number;
  bookingOptions: DetailedBookingOption[];
  comment?: string;
}

// Réutilisation de safeDate pour bien gérer les dates
function safeDate(date: Date | string | null | undefined): Date {
  if (!date) return new Date();
  if (date instanceof Date && !isNaN(date.getTime())) return date;
  if (typeof date === "string") {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export function requestConfirmationEmail(
  params: RequestConfirmationEmailParams
) {
  const subject = `Votre demande de réservation #${params.bookingId} a bien été reçue !`;
  const domainUrl = process.env.DOMAIN_URL || "https://www.yachting-day.com/";
  const currency = "EUR";

  const formatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  });

  const formattedStart = format(
    safeDate(params.startTime),
    "dd/MM/yyyy 'à' HH:mm"
  );
  const formattedEnd = format(safeDate(params.endTime), "HH:mm");

  const captainDetailText = params.withCaptain
    ? `Vous avez votre propre capitaine. Le capitaine n'est pas inclus dans le montant à régler à bord.`
    : `Un capitaine vous sera fourni, pour un coût de ${formatter.format(
        params.captainPrice
      )}, inclus dans le montant à régler à bord.`;

  const optionsHtmlList =
    params.bookingOptions.length > 0
      ? `
    <h3 style="color: #0056b3; margin-top: 20px;">Options supplémentaires (à régler à bord) :</h3>
    <ul style="list-style-type: disc; padding-left: 20px;">
      ${params.bookingOptions
        .map(
          (opt) =>
            `<li>${opt.option.label} x ${opt.quantity} - ${formatter.format(
              opt.quantity * opt.option.unitPrice
            )}</li>`
        )
        .join("")}
    </ul>
  `
      : `<p style="margin-top: 10px;">Aucune option supplémentaire à régler à bord.</p>`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <img src="${domainUrl}/assets/logo/logo-new.png" alt="Yachting Day" width="150" style="display: block; margin-bottom: 20px;" />
      <h2 style="color: #0056b3; text-align: center;">Bonjour ${params.clientName},</h2>
      <p>Nous avons bien reçu votre demande de réservation <strong>#${params.bookingId}</strong> pour le service <strong>${params.serviceName}</strong>.</p>
      <p>Notre équipe est en train de la traiter. Vous recevrez prochainement un email de confirmation avec un lien de paiement si votre demande est validée.</p>

      <h3 style="color: #0056b3;">Récapitulatif de votre demande :</h3>
      <ul style="list-style-type: none; padding: 0;">
        <li><strong>Service :</strong> ${params.serviceName}</li>
        <li><strong>Téléphone :</strong> ${params.clientPhoneNumber}</li>
        <li><strong>Date et heure :</strong> Du ${formattedStart} au ${formattedEnd}</li>
        <li><strong>Prix de la location du bateau :</strong> ${formatter.format(params.boatAmount)}</li>
        <li><strong>Capitaine :</strong> ${captainDetailText}</li>
        <li><strong>Repas traiteur demandé :</strong> ${
          params.mealOption
            ? "Oui. L'administrateur vous contactera pour les détails et prix."
            : "Non."
        }</li>
      </ul>

      ${optionsHtmlList}
      ${
        params.comment
          ? `<p style="margin-top:18px;"><strong>Commentaire client :</strong> ${escapeHtml(
              params.comment
            )}</p>`
          : ""
      }
      <p style="font-size: 17px; font-weight: bold; color: #0056b3; margin-top: 25px;">
          Montant total des options et capitaine à régler à bord : ${formatter.format(
            params.totalPayableOnBoardCalculated
          )}
      </p>
      <p style="font-size: 17px; font-weight: bold; color: #dc3545; margin-top: 10px;">
          Caution à prévoir à bord : ${formatter.format(params.cautionAmount)}
      </p>

      <p style="margin-bottom: 25px; margin-top: 30px;">Merci pour votre confiance et votre patience. Nous vous recontacterons bientôt !</p>
      <p style="font-size: 14px; color: #666; text-align: center;">
        Cordialement,<br/>
        <strong style="color: #0056b3;">L'équipe Yachting Day</strong>
      </p>
      <hr style="border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">Cet email est une confirmation automatique. Merci de ne pas y répondre.</p>
    </div>
  `;

  const text = `
Bonjour ${params.clientName},

Nous avons bien reçu votre demande de réservation #${params.bookingId} pour le service ${params.serviceName}.

Notre équipe est en train de la traiter. Vous recevrez prochainement un email de confirmation avec un lien de paiement si votre demande est validée.

Récapitulatif de votre demande :
- Service : ${params.serviceName}
- Téléphone : ${params.clientPhoneNumber}
- Date et heure : Du ${formattedStart} au ${formattedEnd}
- Prix de la location du bateau : ${formatter.format(params.boatAmount)}
- Capitaine : ${captainDetailText}
- Repas traiteur demandé : ${
    params.mealOption
      ? "Oui. L'administrateur vous contactera pour les détails et prix."
      : "Non."
  }

Options supplémentaires (à régler à bord) :
${
  params.bookingOptions.length > 0
    ? params.bookingOptions
        .map(
          (opt) =>
            `- ${opt.option.label} x ${opt.quantity} - ${formatter.format(
              opt.quantity * opt.option.unitPrice
            )}`
        )
        .join("\n")
    : "Aucune option supplémentaire à régler à bord."
}

${params.comment ? `Commentaire client : ${params.comment}\n` : ""}
Montant total des options et capitaine à régler à bord : ${formatter.format(
    params.totalPayableOnBoardCalculated
  )}
Caution à prévoir à bord : ${formatter.format(params.cautionAmount)}

Merci pour votre confiance et votre patience. Nous vous recontacterons bientôt !

Cordialement,
L'équipe Yachting Day
`;

  return {
    to: params.clientEmail,
    subject,
    html,
    text,
  };
}
