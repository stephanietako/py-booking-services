// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { generateInvoice } from "@/lib/pdf/generateInvoice";
// import { Resend } from "resend";
// import { Booking, BookingOption, Option, Service, Client } from "@/types";
// import { escapeHtml } from "@/utils/escapeHtml";

// const resend = new Resend(process.env.RESEND_API_KEY);
// const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// type BookingForInvoice = Booking & {
//   service: Service;
//   client: Client;
//   bookingOptions: (BookingOption & { option: Option })[];
//   totalPayableOnBoardCalculated: number;
// };

// export async function POST(req: Request) {
//   try {
//     const { bookingId, sendToClient = true } = await req.json();

//     if (!bookingId) {
//       return NextResponse.json(
//         { error: "bookingId manquant" },
//         { status: 400 }
//       );
//     }

//     const booking = await prisma.booking.findUnique({
//       where: { id: Number(bookingId) },
//       include: {
//         service: true,
//         client: true,
//         bookingOptions: {
//           include: {
//             option: true,
//           },
//         },
//       },
//     });

//     if (!booking || !booking.client || !booking.service) {
//       return NextResponse.json(
//         { error: "Données de réservation incomplètes" },
//         { status: 404 }
//       );
//     }

//     if (sendToClient && booking.invoiceSent) {
//       return NextResponse.json(
//         { error: "La facture a déjà été envoyée au client." },
//         { status: 409 }
//       );
//     }

//     const optionsPayableAtBoard = booking.bookingOptions.filter(
//       (bo) => bo.option?.payableAtBoard
//     );

//     const totalOptionsPayableAtBoard = optionsPayableAtBoard.reduce(
//       (sum, bo) => sum + (bo.option?.unitPrice || 0) * (bo.quantity || 1),
//       0
//     );

//     const needsCaptain =
//       !booking.withCaptain && booking.service?.requiresCaptain;

//     const displayWithCaptain = booking.withCaptain || needsCaptain;

//     const captainPrice = needsCaptain
//       ? (booking.service?.captainPrice ?? 350)
//       : 0;

//     const totalPayableOnBoard = totalOptionsPayableAtBoard + captainPrice;

//     const bookingForInvoice: BookingForInvoice = {
//       ...booking,
//       status: booking.status,
//       service: booking.service as Service,
//       client: booking.client as Client,
//       bookingOptions: booking.bookingOptions as (BookingOption & {
//         option: Option;
//       })[],
//       totalPayableOnBoardCalculated: totalPayableOnBoard,
//     };

//     const pdfBuffer = await generateInvoice(bookingForInvoice);
//     const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

//     const adminEmail = process.env.ADMIN_EMAIL || "gabeshine@live.fr";
//     const fileName = `facture-booking-${booking.id}.pdf`;

//     const formatter = new Intl.NumberFormat("fr-FR", {
//       style: "currency",
//       currency: booking.service?.currency ?? "EUR",
//     });

//     await resend.emails.send({
//       from: fromEmail,
//       to: adminEmail,
//       subject: `📄 Facture de réservation #${booking.id}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
//           <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day" width="150" style="display: block; margin-bottom: 20px;" />
//           <h2 style="color: #0056b3;">Nouvelle Facture de Réservation</h2>
//           <p>Facture de la réservation <strong style="color: #d9534f;">#${booking.id}</strong> jointe en PDF.</p>
//         <ul style="list-style-type: none; padding: 0;">
//           <li style="margin-bottom: 5px;"><strong>Client :</strong> ${booking.client.fullName}</li>
//           <li style="margin-bottom: 5px;"><strong>Email Client :</strong> ${booking.client.email}</li>
//           <li style="margin-bottom: 5px;"><strong>Téléphone Client :</strong> ${booking.client.phoneNumber || "—"}</li>
//           <li style="margin-bottom: 5px;"><strong>Service :</strong> ${booking.service.name}</li>
//           <li style="margin-bottom: 5px;"><strong>Date de début :</strong> ${new Date(booking.startTime).toLocaleString("fr-FR")}</li>
//           <li style="margin-bottom: 5px;"><strong>Date de fin :</strong> ${new Date(booking.endTime).toLocaleString("fr-FR")}</li>
//           <li><strong>Prix de la location du bateau :</strong> ${formatter.format(booking.boatAmount)}</li>
//           <li style="margin-bottom: 5px;"><strong>Capitaine :</strong> ${displayWithCaptain ? "Oui" : "Non"}</li>
//           <li style="margin-bottom: 5px;"><strong>Repas traiteur :</strong> ${booking.mealOption ? "Oui" : "Non"}</li>
//           <li style="margin-bottom: 5px;"><strong>Commentaire client :</strong> ${booking.description ? escapeHtml(booking.description) : "—"}</li>
//           ${
//             booking.bookingOptions.length > 0
//               ? `<li style="margin-bottom: 5px;"><strong>Options réservées :</strong>
//                   <ul>
//                     ${booking.bookingOptions
//                       .map(
//                         (bo) =>
//                           `<li>${bo.quantity} × ${bo.option.label} (${bo.option.unitPrice.toLocaleString("fr-FR", { style: "currency", currency: booking.service?.currency ?? "EUR" })}/unité) = ${(bo.quantity * bo.option.unitPrice).toLocaleString("fr-FR", { style: "currency", currency: booking.service?.currency ?? "EUR" })}</li>`
//                       )
//                       .join("")}
//                   </ul>
//                 </li>`
//               : "<li>Aucune option réservée.</li>"
//           }
//           <li style="margin-bottom: 5px;"><strong>Total options à régler à bord :</strong> ${totalOptionsPayableAtBoard.toFixed(2)} €</li>
//           <li style="margin-bottom: 5px;"><strong>Total à régler à bord (options + capitaine) :</strong> ${totalPayableOnBoard.toFixed(2)} €</li>
//           <li style="margin-bottom: 5px; color: #dc3545;"><strong>Caution à prévoir à bord :</strong> ${booking.service.cautionAmount.toLocaleString("fr-FR", { style: "currency", currency: booking.service.currency })}</li>
//         </ul>
//         <p style="font-size: 17px; font-weight: bold; color: #0056b3; margin-top: 25px;">
//           Montant total des options et capitaine à régler à bord : ${formatter.format(totalPayableOnBoard)}
//         </p>
//         </div>
//       `,
//       attachments: [
//         {
//           filename: fileName,
//           content: pdfBase64,
//           contentType: "application/pdf",
//         },
//       ],
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("❌ Erreur send-invoice:", error);
//     return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
//   }
// }
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { generateInvoice } from "@/lib/pdf/generateInvoice";
// import { Resend } from "resend";
// import { Booking, BookingOption, Option, Service, Client } from "@/types";
// import { escapeHtml } from "@/utils/escapeHtml";

// const resend = new Resend(process.env.RESEND_API_KEY);
// const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
// const domainUrl = process.env.DOMAIN_URL || "https://votre-domaine.com";

// type BookingForInvoice = Booking & {
//   service: Service;
//   client: Client;
//   bookingOptions: (BookingOption & { option: Option })[];
//   totalPayableOnBoardCalculated: number;
// };

// export async function POST(req: Request) {
//   try {
//     const { bookingId, sendToClient = true } = await req.json();

//     if (!bookingId) {
//       return NextResponse.json(
//         { error: "bookingId manquant" },
//         { status: 400 }
//       );
//     }

//     const booking = await prisma.booking.findUnique({
//       where: { id: Number(bookingId) },
//       include: {
//         service: true,
//         client: true,
//         bookingOptions: {
//           include: {
//             option: true,
//           },
//         },
//       },
//     });

//     if (!booking || !booking.client || !booking.service) {
//       return NextResponse.json(
//         { error: "Données de réservation incomplètes" },
//         { status: 404 }
//       );
//     }

//     if (sendToClient && booking.invoiceSent) {
//       return NextResponse.json(
//         { error: "La facture a déjà été envoyée au client." },
//         { status: 409 }
//       );
//     }

//     const optionsPayableAtBoard = booking.bookingOptions.filter(
//       (bo) => bo.option?.payableAtBoard
//     );

//     const totalOptionsPayableAtBoard = optionsPayableAtBoard.reduce(
//       (sum, bo) => sum + (bo.option?.unitPrice || 0) * (bo.quantity || 1),
//       0
//     );

//     const needsCaptain =
//       !booking.withCaptain && booking.service?.requiresCaptain;

//     const displayWithCaptain = booking.withCaptain || needsCaptain;

//     const captainPrice = needsCaptain
//       ? (booking.service?.captainPrice ?? 350)
//       : 0;

//     const totalPayableOnBoard = totalOptionsPayableAtBoard + captainPrice;

//     const bookingForInvoice: BookingForInvoice = {
//       ...booking,
//       status: booking.status,
//       service: booking.service,
//       client: booking.client,
//       bookingOptions: booking.bookingOptions as (BookingOption & {
//         option: Option;
//       })[],
//       totalPayableOnBoardCalculated: totalPayableOnBoard,
//     };

//     const pdfBuffer = await generateInvoice(bookingForInvoice);
//     const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

//     const adminEmail = process.env.ADMIN_EMAIL || "gabeshine@live.fr";
//     const fileName = `facture-booking-${booking.id}.pdf`;

//     const formatter = new Intl.NumberFormat("fr-FR", {
//       style: "currency",
//       currency: booking.service.currency,
//     });

//     const emailHtml = `
//       <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
//         <img src="${domainUrl}/assets/logo/logo-new.png" alt="Yachting Day" width="150" style="display: block; margin-bottom: 20px;" />
//         <h2 style="color: #0056b3;">Nouvelle Facture de Réservation</h2>
//         <p>Facture de la réservation <strong style="color: #d9534f;">#${booking.id}</strong> jointe en PDF.</p>
//         <ul style="list-style-type: none; padding: 0;">
//           <li><strong>Client :</strong> ${booking.client.fullName}</li>
//           <li><strong>Email Client :</strong> ${booking.client.email}</li>
//           <li><strong>Téléphone Client :</strong> ${booking.client.phoneNumber || "—"}</li>
//           <li><strong>Service :</strong> ${booking.service.name}</li>
//           <li><strong>Date de début :</strong> ${new Date(booking.startTime).toLocaleString("fr-FR")}</li>
//           <li><strong>Date de fin :</strong> ${new Date(booking.endTime).toLocaleString("fr-FR")}</li>
//           <li><strong>Prix de la location du bateau :</strong> ${formatter.format(booking.boatAmount)}</li>
//           <li><strong>Capitaine :</strong> ${displayWithCaptain ? "Oui" : "Non"}</li>
//           <li><strong>Repas traiteur :</strong> ${booking.mealOption ? "Oui" : "Non"}</li>
//           <li><strong>Commentaire client :</strong> ${booking.description ? escapeHtml(booking.description) : "—"}</li>
//           ${
//             booking.bookingOptions.length > 0
//               ? `<li><strong>Options réservées :</strong>
//                   <ul>
//                     ${booking.bookingOptions
//                       .map(
//                         (bo) =>
//                           `<li>${bo.quantity} × ${bo.option.label} (${formatter.format(bo.option.unitPrice)}/unité) = ${formatter.format(bo.quantity * bo.option.unitPrice)}</li>`
//                       )
//                       .join("")}
//                   </ul>
//                 </li>`
//               : "<li>Aucune option réservée.</li>"
//           }
//           <li><strong>Total options à régler à bord :</strong> ${formatter.format(totalOptionsPayableAtBoard)}</li>
//           <li><strong>Total à régler à bord (options + capitaine) :</strong> ${formatter.format(totalPayableOnBoard)}</li>
//           <li style="color: #dc3545;"><strong>Caution à prévoir à bord :</strong> ${formatter.format(booking.service.cautionAmount)}</li>
//         </ul>
//         <p style="font-size: 17px; font-weight: bold; color: #0056b3; margin-top: 25px;">
//           Montant total des options et capitaine à régler à bord : ${formatter.format(totalPayableOnBoard)}
//         </p>
//       </div>
//     `;

//     // ➤ Envoi à l'admin
//     await resend.emails.send({
//       from: fromEmail,
//       to: adminEmail,
//       subject: `📄 Facture de réservation #${booking.id}`,
//       html: emailHtml,
//       attachments: [
//         {
//           filename: fileName,
//           content: pdfBase64,
//           contentType: "application/pdf",
//         },
//       ],
//     });

//     // ➤ Envoi au client si demandé
//     if (sendToClient) {
//       await resend.emails.send({
//         from: fromEmail,
//         to: booking.client.email,
//         subject: `📄 Votre facture - Réservation #${booking.id}`,
//         html: `
//           <p>Bonjour ${booking.client.fullName},</p>
//           <p>Merci pour votre réservation. Veuillez trouver ci-joint votre facture au format PDF.</p>
//           <img src="${domainUrl}/assets/logo/logo-new.png" alt="Logo" style="width: 120px; margin: 20px 0;" />
//           <p>À bientôt,<br>L'équipe Poseidon</p>
//         `,
//         attachments: [
//           {
//             filename: fileName,
//             content: pdfBase64,
//             contentType: "application/pdf",
//           },
//         ],
//       });

//       // ➤ Mise à jour du flag `invoiceSent`
//       await prisma.booking.update({
//         where: { id: booking.id },
//         data: { invoiceSent: true },
//       });
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("❌ Erreur send-invoice:", error);
//     return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoice } from "@/lib/pdf/generateInvoice";
import { Resend } from "resend";
import { Booking, BookingOption, Option, Service, Client, User } from "@/types";
import { escapeHtml } from "@/utils/escapeHtml";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const domainUrl = process.env.DOMAIN_URL || "https://votre-domaine.com";

type BookingForInvoice = Booking & {
  service: Service;
  client?: Client | null;
  user?: User | null;
  bookingOptions: (BookingOption & { option: Option })[];
  totalPayableOnBoardCalculated: number;
};

export async function POST(req: Request) {
  try {
    const { bookingId, sendToClient = true } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId manquant" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      include: {
        service: true,
        client: true,
        user: true,
        bookingOptions: {
          include: {
            option: true,
          },
        },
      },
    });

    if (!booking || !booking.service) {
      return NextResponse.json(
        { error: "Données de réservation incomplètes" },
        { status: 404 }
      );
    }

    if (sendToClient && booking.invoiceSent) {
      return NextResponse.json(
        { error: "La facture a déjà été envoyée au client." },
        { status: 409 }
      );
    }

    const optionsPayableAtBoard = booking.bookingOptions.filter(
      (bo) => bo.option?.payableAtBoard
    );

    const totalOptionsPayableAtBoard = optionsPayableAtBoard.reduce(
      (sum, bo) => sum + (bo.option?.unitPrice || 0) * (bo.quantity || 1),
      0
    );

    const needsCaptain =
      !booking.withCaptain && booking.service?.requiresCaptain;

    const displayWithCaptain = booking.withCaptain || needsCaptain;

    const captainPrice = needsCaptain
      ? (booking.service?.captainPrice ?? 350)
      : 0;

    const totalPayableOnBoard = totalOptionsPayableAtBoard + captainPrice;

    const bookingForInvoice: BookingForInvoice = {
      ...booking,
      status: booking.status,
      service: booking.service,
      client: booking.client ?? null,
      user: booking.user ?? null,
      bookingOptions: booking.bookingOptions as (BookingOption & {
        option: Option;
      })[],
      totalPayableOnBoardCalculated: totalPayableOnBoard,
    };

    const pdfBuffer = await generateInvoice(bookingForInvoice);
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

    const adminEmail = process.env.ADMIN_EMAIL || "gabeshine@live.fr";
    const fileName = `facture-booking-${booking.id}.pdf`;

    const formatter = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: booking.service.currency,
    });

    const clientName =
      booking.client?.fullName || booking.user?.name || "Client";

    const clientEmail = booking.client?.email || booking.user?.email || "";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <img src="${domainUrl}/assets/logo/logo-new.png" alt="Yachting Day" width="150" style="display: block; margin-bottom: 20px;" />
        <h2 style="color: #0056b3;">Nouvelle Facture de Réservation</h2>
        <p>Facture de la réservation <strong style="color: #d9534f;">#${booking.id}</strong> jointe en PDF.</p>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>Client :</strong> ${clientName}</li>
          <li><strong>Email Client :</strong> ${clientEmail}</li>
          <li><strong>Téléphone Client :</strong> ${
            booking.client?.phoneNumber || booking.user?.phoneNumber || "—"
          }</li>
          <li><strong>Service :</strong> ${booking.service.name}</li>
          <li><strong>Date de début :</strong> ${new Date(booking.startTime).toLocaleString("fr-FR")}</li>
          <li><strong>Date de fin :</strong> ${new Date(booking.endTime).toLocaleString("fr-FR")}</li>
          <li><strong>Prix de la location du bateau :</strong> ${formatter.format(booking.boatAmount)}</li>
          <li><strong>Capitaine :</strong> ${displayWithCaptain ? "Oui" : "Non"}</li>
          <li><strong>Repas traiteur :</strong> ${booking.mealOption ? "Oui" : "Non"}</li>
          <li><strong>Commentaire client :</strong> ${booking.description ? escapeHtml(booking.description) : "—"}</li>
          ${
            booking.bookingOptions.length > 0
              ? `<li><strong>Options réservées :</strong>
                  <ul>
                    ${booking.bookingOptions
                      .map(
                        (bo) =>
                          `<li>${bo.quantity} × ${bo.option.label} (${formatter.format(bo.option.unitPrice)}/unité) = ${formatter.format(bo.quantity * bo.option.unitPrice)}</li>`
                      )
                      .join("")}
                  </ul>
                </li>`
              : "<li>Aucune option réservée.</li>"
          }
          <li><strong>Total options à régler à bord :</strong> ${formatter.format(totalOptionsPayableAtBoard)}</li>
          <li><strong>Total à régler à bord (options + capitaine) :</strong> ${formatter.format(totalPayableOnBoard)}</li>
          <li style="color: #dc3545;"><strong>Caution à prévoir à bord :</strong> ${formatter.format(booking.service.cautionAmount)}</li>
        </ul>
        <p style="font-size: 17px; font-weight: bold; color: #0056b3; margin-top: 25px;">
          Montant total des options et capitaine à régler à bord : ${formatter.format(totalPayableOnBoard)}
        </p>
      </div>
    `;

    // ➤ Envoi à l'admin
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `📄 Facture de réservation #${booking.id}`,
      html: emailHtml,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
          contentType: "application/pdf",
        },
      ],
    });

    // ➤ Envoi au client si demandé
    if (sendToClient && clientEmail.includes("@")) {
      await resend.emails.send({
        from: fromEmail,
        to: clientEmail,
        subject: `📄 Votre facture - Réservation #${booking.id}`,
        html: `
          <p>Bonjour ${clientName},</p>
          <p>Merci pour votre réservation. Veuillez trouver ci-joint votre facture au format PDF.</p>
          <img src="${domainUrl}/assets/logo/logo-new.png" alt="Logo" style="width: 120px; margin: 20px 0;" />
          <p>À bientôt,<br>L'équipe Poseidon</p>
        `,
        attachments: [
          {
            filename: fileName,
            content: pdfBase64,
            contentType: "application/pdf",
          },
        ],
      });

      // ➤ Mise à jour du flag `invoiceSent`
      await prisma.booking.update({
        where: { id: booking.id },
        data: { invoiceSent: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur send-invoice:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
