// import { escapeHtml } from "@/utils/escapeHtml";

// interface DetailedBookingOption {
//   quantity: number;
//   option: {
//     unitPrice: number;
//     label: string;
//     payableAtBoard: boolean;
//   };
// }

// interface ServiceDetailsForAdminEmail {
//   name: string;
//   currency?: string;
//   cautionAmount: number;
//   requiresCaptain: boolean;
// }

// export interface AdminReservationEmailParams {
//   bookingId: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   reservationTime: string;
//   stripeUrl?: string | null;
//   bookingOptions?: DetailedBookingOption[];
//   withCaptain: boolean;
//   mealOption: boolean;
//   boatAmount: number;
//   service?: ServiceDetailsForAdminEmail;
//   captainPrice: number;
//   totalPayableOnBoardCalculated: number;
//   comment?: string;
// }

// const safe = (val?: string | null, fallback = "—") => val ?? fallback;

// export function buildAdminReservationEmail(
//   params: AdminReservationEmailParams
// ) {
//   const fullName = `${safe(params.firstName)} ${safe(params.lastName)}`;
//   const subject = `🛥️ Nouvelle réservation Yachting Day - #${params.bookingId}`;
//   const currency = params.service?.currency || "EUR";
//   const formatter = new Intl.NumberFormat("fr-FR", {
//     style: "currency",
//     currency,
//   });

//   const cautionText = params.service?.cautionAmount
//     ? `<tr><td><strong>Caution à régler à bord :</strong></td><td>${formatter.format(params.service.cautionAmount)}</td></tr>`
//     : "";

//   const captainDetailHtml =
//     !params.withCaptain && params.service?.requiresCaptain
//       ? `À fournir par nos soins (${formatter.format(params.captainPrice)}).`
//       : `Client fournit son propre capitaine.`;

//   const optionsHtmlList = params.bookingOptions?.length
//     ? `
//         <h3>Options supplémentaires (à régler à bord) :</h3>
//         <ul style="padding-left: 20px; margin-bottom: 10px;">
//           ${params.bookingOptions
//             .filter((opt) => opt.option.payableAtBoard)
//             .map(
//               (opt) =>
//                 `<li>${escapeHtml(opt.option.label)} x ${opt.quantity} - ${formatter.format(opt.quantity * opt.option.unitPrice)}</li>`
//             )
//             .join("")}
//         </ul>
//       `
//     : `<p>Aucune option supplémentaire à régler à bord.</p>`;

//   const html = `
//         <html>
//           <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
//             <h2 style="color: #1a73e8;">Nouvelle demande de réservation</h2>
//             <p>Une nouvelle demande de réservation a été soumise. Veuillez la consulter et prendre les mesures nécessaires.</p>
//             <table cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd;">
//               <tr style="background-color: #f0f0f0;">
//                 <td><strong>ID Réservation :</strong></td>
//                 <td>${params.bookingId}</td>
//               </tr>
//               <tr>
//                 <td><strong>Nom du client :</strong></td>
//                 <td>${fullName}</td>
//               </tr>
//               <tr>
//                 <td><strong>Email :</strong></td>
//                 <td>${safe(params.email)}</td>
//               </tr>
//               <tr>
//                 <td><strong>Téléphone :</strong></td>
//                 <td>${safe(params.phoneNumber)}</td>
//               </tr>
//               <tr style="background-color: #f0f0f0;">
//                 <td><strong>Date & heure :</strong></td>
//                 <td>${safe(params.reservationTime)}</td>
//               </tr>
//               <tr>
//                 <td><strong>Service :</strong></td>
//                 <td>${safe(params.service?.name)}</td>
//               </tr>
//               <tr>
//                 <td><strong>Montant location bateau (à régler en ligne) :</strong></td>
//                 <td>${formatter.format(params.boatAmount)}</td>
//               </tr>
//               <tr>
//                 <td><strong>Capitaine :</strong></td>
//                 <td>${captainDetailHtml}</td>
//               </tr>
//               <tr>
//                 <td><strong>Option repas traiteur :</strong></td>
//                 <td>${params.mealOption ? "Oui (à contacter pour les détails)" : "Non"}</td>
//               </tr>
//               ${cautionText}
//             </table>
//             ${
//               params.comment
//                 ? `<p style="margin-top:18px;"><strong>Commentaire client :</strong> ${escapeHtml(params.comment)}</p>`
//                 : ""
//             }
//             ${optionsHtmlList}

//             <table cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #ddd;">
//               <tr style="background-color: #e6e6e6;">
//                 <td><strong>TOTAL À RÉGLER À BORD (Options + Capitaine) :</strong></td>
//                 <td><strong>${formatter.format(params.totalPayableOnBoardCalculated)}</strong></td>
//               </tr>
//               ${
//                 params.stripeUrl
//                   ? `<tr><td><strong>Lien de paiement Stripe :</strong></td><td><a href="${params.stripeUrl}">${params.stripeUrl}</a></td></tr>`
//                   : "<tr><td colspan='2'>Lien de paiement Stripe non encore généré.</td></tr>"
//               }
//             </table>

//             <p style="margin-top: 30px;">Merci de confirmer rapidement cette demande et d'envoyer le lien de paiement si applicable.</p>
//           </body>
//         </html>
//       `;

//   const text = `
//   Nouvelle demande de réservation Yachting Day:
//   ID Réservation: ${params.bookingId}
//   Nom du client: ${fullName}
//   Email: ${safe(params.email)}
//   Téléphone: ${safe(params.phoneNumber)}
//   Date & heure: ${safe(params.reservationTime)}
//   Service: ${safe(params.service?.name)}
//   Montant location bateau (à régler en ligne): ${formatter.format(params.boatAmount)}
//   Capitaine: ${captainDetailHtml}
//   Option repas traiteur: ${params.mealOption ? "Oui (à contacter pour les détails)" : "Non"}
//   Caution à régler à bord: ${params.service?.cautionAmount ? formatter.format(params.service.cautionAmount) : "Non applicable"}
//   Commentaire client: ${params.comment || "Aucun commentaire"}
//   Options supplémentaires (à régler à bord):
//   ${
//     params.bookingOptions?.length
//       ? params.bookingOptions
//           .filter((opt) => opt.option.payableAtBoard)
//           .map(
//             (opt) =>
//               `- ${opt.option.label} x ${opt.quantity} - ${formatter.format(opt.quantity * opt.option.unitPrice)}`
//           )
//           .join("\n")
//       : "Aucune option supplémentaire."
//   }

//   TOTAL À RÉGLER À BORD (Options + Capitaine): ${formatter.format(params.totalPayableOnBoardCalculated)}
//   ${params.stripeUrl ? `Lien de paiement Stripe: ${params.stripeUrl}` : "Lien de paiement Stripe non encore généré."}

//   Merci de confirmer rapidement cette demande.
//     `;

//   return { subject, html, text };
// }
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { escapeHtml } from "@/utils/escapeHtml";

interface DetailedBookingOption {
  quantity: number;
  option: {
    unitPrice: number;
    label: string;
    payableAtBoard: boolean;
  };
}

interface ServiceDetailsForAdminEmail {
  name: string;
  currency?: string;
  cautionAmount: number;
  requiresCaptain: boolean;
}

export interface AdminReservationEmailParams {
  bookingId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  // Amélioration : accepter Date | string au lieu de juste string
  startTime: Date | string;
  endTime: Date | string;
  stripeUrl?: string | null;
  bookingOptions?: DetailedBookingOption[];
  withCaptain: boolean;
  mealOption: boolean;
  boatAmount: number;
  service?: ServiceDetailsForAdminEmail;
  captainPrice: number;
  totalPayableOnBoardCalculated: number;
  comment?: string;
}

// Même fonction safeDate que dans l'autre fichier
function safeDate(
  date: Date | string | null | undefined,
  context?: string
): Date {
  if (!date) {
    console.warn(`Date manquante dans le contexte: ${context}`);
    return new Date();
  }

  if (date instanceof Date && !isNaN(date.getTime())) return date;

  if (typeof date === "string") {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  console.error(`Date invalide dans le contexte: ${context}`, date);
  return new Date();
}

// Fonction pour formater la période de réservation
function formatReservationPeriod(
  startTime: Date | string,
  endTime: Date | string
): string {
  const start = safeDate(startTime, "startTime");
  const end = safeDate(endTime, "endTime");

  const startFormatted = format(start, "dd/MM/yyyy 'à' HH:mm", { locale: fr });

  // Si c'est le même jour, on affiche juste l'heure de fin
  const isSameDay = format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");
  const endFormatted = isSameDay
    ? format(end, "HH:mm", { locale: fr })
    : format(end, "dd/MM/yyyy 'de' HH:mm", { locale: fr });

  return `Le ${startFormatted} / ${endFormatted}`;
}

const safe = (val?: string | null, fallback = "—") => val ?? fallback;

export function buildAdminReservationEmail(
  params: AdminReservationEmailParams
) {
  const fullName = `${safe(params.firstName)} ${safe(params.lastName)}`;
  const subject = `🛥️ Nouvelle réservation Yachting Day - #${params.bookingId}`;
  const currency = params.service?.currency || "EUR";
  const formatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  });

  // Formatage sécurisé des dates
  const reservationTimeFormatted = formatReservationPeriod(
    params.startTime,
    params.endTime
  );

  const cautionText = params.service?.cautionAmount
    ? `<tr><td><strong>Caution à régler à bord :</strong></td><td>${formatter.format(params.service.cautionAmount)}</td></tr>`
    : "";

  const captainDetailHtml =
    !params.withCaptain && params.service?.requiresCaptain
      ? `À fournir par nos soins (${formatter.format(params.captainPrice)}).`
      : `Client fournit son propre capitaine.`;

  const optionsHtmlList = params.bookingOptions?.length
    ? `
        <h3>Options supplémentaires (à régler à bord) :</h3>
        <ul style="padding-left: 20px; margin-bottom: 10px;">
          ${params.bookingOptions
            .filter((opt) => opt.option.payableAtBoard)
            .map(
              (opt) =>
                `<li>${escapeHtml(opt.option.label)} x ${opt.quantity} - ${formatter.format(opt.quantity * opt.option.unitPrice)}</li>`
            )
            .join("")}
        </ul>
      `
    : `<p>Aucune option supplémentaire à régler à bord.</p>`;

  const html = `
        <html>
          <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
            <h2 style="color: #1a73e8;">Nouvelle demande de réservation</h2>
            <p>Une nouvelle demande de réservation a été soumise. Veuillez la consulter et prendre les mesures nécessaires.</p>
            <table cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd;">
              <tr style="background-color: #f0f0f0;">
                <td><strong>ID Réservation :</strong></td>
                <td>${params.bookingId}</td>
              </tr>
              <tr>
                <td><strong>Nom du client :</strong></td>
                <td>${fullName}</td>
              </tr>
              <tr>
                <td><strong>Email :</strong></td>
                <td>${safe(params.email)}</td>
              </tr>
              <tr>
                <td><strong>Téléphone :</strong></td>
                <td>${safe(params.phoneNumber)}</td>
              </tr>
              <tr style="background-color: #f0f0f0;">
                <td><strong>Date & heure :</strong></td>
                <td>${reservationTimeFormatted}</td>
              </tr>
              <tr>
                <td><strong>Service :</strong></td>
                <td>${safe(params.service?.name)}</td>
              </tr>
              <tr>
                <td><strong>Montant location bateau (à régler en ligne) :</strong></td>
                <td>${formatter.format(params.boatAmount)}</td>
              </tr>
              <tr>
                <td><strong>Capitaine :</strong></td>
                <td>${captainDetailHtml}</td>
              </tr>
              <tr>
                <td><strong>Option repas traiteur :</strong></td>
                <td>${params.mealOption ? "Oui (à contacter pour les détails)" : "Non"}</td>
              </tr>
              ${cautionText}
            </table>
            ${
              params.comment
                ? `<p style="margin-top:18px;"><strong>Commentaire client :</strong> ${escapeHtml(params.comment)}</p>`
                : ""
            }
            ${optionsHtmlList}
  
            <table cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #ddd;">
              <tr style="background-color: #e6e6e6;">
                <td><strong>TOTAL À RÉGLER À BORD (Options + Capitaine) :</strong></td>
                <td><strong>${formatter.format(params.totalPayableOnBoardCalculated)}</strong></td>
              </tr>
              ${
                params.stripeUrl
                  ? `<tr><td><strong>Lien de paiement Stripe :</strong></td><td><a href="${params.stripeUrl}">${params.stripeUrl}</a></td></tr>`
                  : "<tr><td colspan='2'>Lien de paiement Stripe non encore généré.</td></tr>"
              }
            </table>
  
            <p style="margin-top: 30px;">Merci de confirmer rapidement cette demande et d'envoyer le lien de paiement si applicable.</p>
          </body>
        </html>
      `;

  const text = `
  Nouvelle demande de réservation Yachting Day:
  ID Réservation: ${params.bookingId}
  Nom du client: ${fullName}
  Email: ${safe(params.email)}
  Téléphone: ${safe(params.phoneNumber)}
  Date & heure: ${reservationTimeFormatted}
  Service: ${safe(params.service?.name)}
  Montant location bateau (à régler en ligne): ${formatter.format(params.boatAmount)}
  Capitaine: ${captainDetailHtml}
  Option repas traiteur: ${params.mealOption ? "Oui (à contacter pour les détails)" : "Non"}
  Caution à régler à bord: ${params.service?.cautionAmount ? formatter.format(params.service.cautionAmount) : "Non applicable"}
  Commentaire client: ${params.comment || "Aucun commentaire"}
  Options supplémentaires (à régler à bord):
  ${
    params.bookingOptions?.length
      ? params.bookingOptions
          .filter((opt) => opt.option.payableAtBoard)
          .map(
            (opt) =>
              `- ${opt.option.label} x ${opt.quantity} - ${formatter.format(opt.quantity * opt.option.unitPrice)}`
          )
          .join("\n")
      : "Aucune option supplémentaire."
  }
  
  TOTAL À RÉGLER À BORD (Options + Capitaine): ${formatter.format(params.totalPayableOnBoardCalculated)}
  ${params.stripeUrl ? `Lien de paiement Stripe: ${params.stripeUrl}` : "Lien de paiement Stripe non encore généré."}
  
  Merci de confirmer rapidement cette demande.
    `;

  return { subject, html, text };
}
