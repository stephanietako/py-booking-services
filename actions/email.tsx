"use server";

import { Resend } from "resend";
import AdminNotificationEmail from "@/emails/AdminNotificationEmail";
import UserCancellationEmail from "@/emails/UserCancellationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

// Fonction pour envoyer une notification à l'admin
export async function sendAdminNotification(
  userName: string,
  serviceName: string,
  userEmail: string // Ajouter l'email de l'utilisateur
) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    throw new Error(
      "L'email de l'admin n'est pas défini dans les variables d'environnement."
    );
  }

  try {
    const { error } = await resend.emails.send({
      from: userEmail, // L'email d'envoi est défini ici
      to: adminEmail, // Maintenant on s'assure que `adminEmail` est une chaîne valide
      subject: "📢 Nouvelle réservation en attente",
      react: AdminNotificationEmail({ userName, serviceName, userEmail }), // Utilisation du template React
    });

    if (error) throw new Error(error.message);
    console.log("📩 Email envoyé à l'admin !");
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email :", error);
  }
}

// Fonction pour envoyer un email d'annulation à l'utilisateur
// export async function sendUserCancellationEmail(
//   userName: string,
//   serviceName: string,
//   userEmail: string // Ajouter l'email de l'utilisateur
// ) {
//   try {
//     const { error } = await resend.emails.send({
//       from: "no-reply@yourdomain.com", // L'email d'envoi
//       to: userEmail, // L'email de l'utilisateur
//       subject: "Annulation de réservation",
//       react: UserCancellationEmail({ serviceName, userName, userEmail}), // Utilisation du template React
//     });

//     if (error) throw new Error(error.message);
//     console.log("📩 Email d'annulation envoyé à l'utilisateur !");
//   } catch (error) {
//     console.error(
//       "❌ Erreur lors de l'envoi de l'email de cancellation :",
//       error
//     );
//   }
// }
export async function sendUserCancellationEmail(
  userName: string,
  serviceName: string,
  userEmail: string,
  adminEmail: string // Ajouter l'email de l'admin
) {
  try {
    const { error } = await resend.emails.send({
      from: adminEmail, // L'email de l'admin comme expéditeur
      to: userEmail, // L'email de l'utilisateur
      subject: "Annulation de réservation",
      react: UserCancellationEmail({ serviceName, userName, userEmail }),
    });

    if (error) throw new Error(error.message);
    console.log("📩 Email d'annulation envoyé à l'utilisateur !");
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email de cancellation :",
      error
    );
  }
}
