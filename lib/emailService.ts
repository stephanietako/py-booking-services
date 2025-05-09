// // lib/emailService.ts
//////////////////CENTRALISER L'ENVOI D'EMAILS
// import { Resend } from "resend";
// import { BookingOption, Client, Service } from "@/types";

// const resend = new Resend(process.env.RESEND_API_KEY);
// const adminEmail = process.env.ADMIN_EMAIL || "gabeshine@live.fr";

// type EmailPayload = {
//   to: string;
//   subject: string;
//   html?: string;
//   text?: string;
// };

// const sendBasicEmail = async ({
//   to,
//   subject,
//   html,
//   text,
// }: {
//   to: string;
//   subject: string;
//   html?: string;
//   text?: string;
// }) => {
//   if (!to || !subject || (!html && !text)) {
//     throw new Error("Champs requis manquants pour l'envoi d'email.");
//   }

//   return await resend.emails.send({
//     from: "contact@yachting-day.com",
//     to,
//     subject,
//     ...(html ? { html } : {}),
//     ...(text ? { text } : {}),
//   });
// };

// export async function notifyClientAndAdminOnConfirmation(booking: {
//   id: number;
//   client: Client | null;
//   service: Service;
//   bookingOptions: BookingOption[];
//   boatAmount: number;
//   totalAmount: number;
//   startTime: Date;
//   endTime: Date;
// }) {
//   const {
//     id,
//     client,
//     service,
//     bookingOptions,
//     boatAmount,
//     totalAmount,
//     startTime,
//     endTime,
//   } = booking;

//   const fullName = client?.fullName ?? "Client";
//   const email = client?.email;
//   const phoneNumber = client?.phoneNumber ?? "Non renseigné";
//   const currency = service.currency || "EUR";

//   const onboardTotal = bookingOptions.reduce(
//     (sum, opt) => sum + opt.unitPrice * opt.quantity,
//     0
//   );

//   const formatter = new Intl.NumberFormat("fr-FR", {
//     style: "currency",
//     currency,
//   });

//   const formattedStart = new Date(startTime).toLocaleString("fr-FR", {
//     dateStyle: "full",
//     timeStyle: "short",
//   });
//   const formattedEnd = new Date(endTime).toLocaleTimeString("fr-FR", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   // 📧 Client
//   if (email) {
//     await sendEmail({
//       to: email,
//       subject: `🎉 Confirmation de votre réservation #${id}`,
//       html: `
//         <h2>Bonjour ${fullName},</h2>
//         <p>Merci pour votre réservation avec <strong>${service.name}</strong>.</p>
//         <p><strong>Date :</strong> ${formattedStart} - ${formattedEnd}</p>
//         <p><strong>Montant payé en ligne :</strong> ${formatter.format(boatAmount)}</p>
//         <p><strong>Total à régler à bord :</strong> ${formatter.format(onboardTotal)}</p>
//         <p>Nous avons hâte de vous accueillir à bord !</p>
//       `,
//     });
//   }

//   // 📧 Admin
//   await sendEmail({
//     to: adminEmail,
//     subject: `Nouvelle réservation confirmée #${id}`,
//     html: `
//       <h3>Nouvelle réservation confirmée</h3>
//       <ul>
//         <li><strong>Nom :</strong> ${fullName}</li>
//         <li><strong>Email :</strong> ${email ?? "Non fourni"}</li>
//         <li><strong>Téléphone :</strong> ${phoneNumber}</li>
//         <li><strong>Service :</strong> ${service.name}</li>
//         <li><strong>Date :</strong> ${formattedStart} - ${formattedEnd}</li>
//         <li><strong>Total payé :</strong> ${formatter.format(totalAmount)}</li>
//       </ul>
//     `,
//   });
// }

// export async function notifyAdminReservationRequest({
//   bookingId,
//   firstName,
//   lastName,
//   email,
//   phoneNumber,
//   reservationTime,
// }: {
//   bookingId: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   reservationTime: string;
// }) {
//   const subject = `Nouvelle demande de confirmation #${bookingId}`;

//   await sendEmail({
//     to: adminEmail,
//     subject,
//     html: `
//       <h3>Nouvelle demande de confirmation</h3>
//       <table>
//         <tr><td><strong>ID Réservation:</strong></td><td>${bookingId}</td></tr>
//         <tr><td><strong>Nom:</strong></td><td>${firstName} ${lastName}</td></tr>
//         <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
//         <tr><td><strong>Téléphone:</strong></td><td>${phoneNumber}</td></tr>
//         <tr><td><strong>Date et heure:</strong></td><td>${reservationTime}</td></tr>
//       </table>
//     `,
//   });
// }
// export async function notifyAdminReservationCancellation({
//   bookingId,
//   firstName,
//   lastName,
//   email,
// }: {
//   bookingId: string;
//   firstName: string;
//   lastName: string;
//   email: string;
// }) {
//   const subject = `Annulation de réservation #${bookingId}`;

//   await sendEmail({
//     to: adminEmail,
//     subject,
//     html: `
//       <h3>Annulation de réservation</h3>
//       <table>
//         <tr><td><strong>ID Réservation:</strong></td><td>${bookingId}</td></tr>
//         <tr><td><strong>Nom:</strong></td><td>${firstName} ${lastName}</td></tr>
//         <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
//       </table>
//     `,
//   });
// }
