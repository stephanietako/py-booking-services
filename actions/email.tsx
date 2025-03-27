// "use server";

// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// // Fonction pour envoyer un email à l'admin
// export async function sendEmailToAdmin({
//   bookingId,
//   userEmail,
// }: {
//   bookingId: string;
//   userEmail: string;
// }) {
//   const adminEmail = process.env.ADMIN_EMAIL; // Récupère l'email de l'admin depuis les variables d'environnement

//   if (!adminEmail) {
//     console.error("❌ ADMIN_EMAIL n'est pas défini.");
//     throw new Error("Configuration invalide : ADMIN_EMAIL manquant.");
//   }

//   try {
//     await resend.emails.send({
//       from: "noreply@yourapp.com",
//       to: adminEmail,
//       subject: "🔔 Nouvelle réservation en attente",
//       html: `
//         <p>Bonjour,</p>
//         <p>Un utilisateur a demandé la confirmation d'une réservation :</p>
//         <ul>
//           <li><strong>ID Réservation :</strong> ${bookingId}</li>
//           <li><strong>Email Utilisateur :</strong> ${userEmail}</li>
//         </ul>
//         <p>Connectez-vous pour l'approuver ou la rejeter.</p>
//       `,
//     });

//     console.log("📩 Email envoyé à l'admin !");
//   } catch (error) {
//     console.error("❌ Erreur lors de l'envoi de l'email :", error);
//     throw new Error("Échec de l'envoi de l'email.");
//   }
// }
"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailToAdminParams {
  bookingId: string;
  userEmail: string;
}

// Fonction pour envoyer un email à l'admin
export async function sendEmailToAdmin({
  bookingId,
  userEmail,
}: SendEmailToAdminParams) {
  const adminEmail = process.env.ADMIN_EMAIL; // Récupère l'email de l'admin depuis les variables d'environnement

  if (!adminEmail) {
    console.error("❌ ADMIN_EMAIL n'est pas défini.");
    throw new Error("Configuration invalide : ADMIN_EMAIL manquant.");
  }

  try {
    await resend.emails.send({
      from: "noreply@yourapp.com",
      to: adminEmail,
      subject: "🔔 Nouvelle réservation en attente",
      html: `
        <p>Bonjour,</p>
        <p>Un utilisateur a demandé la confirmation d'une réservation :</p>
        <ul>
          <li><strong>ID Réservation :</strong> ${bookingId}</li>
          <li><strong>Email Utilisateur :</strong> ${userEmail}</li>
        </ul>
        <p>Connectez-vous pour l'approuver ou la rejeter.</p>
      `,
    });

    console.log("📩 Email envoyé à l'admin !");
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email :", error);
    throw new Error("Échec de l'envoi de l'email.");
  }
}
