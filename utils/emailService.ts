import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailToAdminParams {
  bookingId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  reservationTime: string;
}

// Fonction pour envoyer un email à l'admin
export async function sendEmailToAdmin({
  bookingId,
  firstName,
  lastName,
  email,
  phoneNumber,
  reservationTime,
}: SendEmailToAdminParams) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error("❌ ADMIN_EMAIL n'est pas défini.");
    throw new Error("Configuration invalide : ADMIN_EMAIL manquant.");
  }

  try {
    const subject = `Nouvelle demande de confirmation #${bookingId}`;
    const text = `
      Bonjour Pierre-Yves,

      Un utilisateur a demandé une confirmation de réservation. Voici les détails :

      - ID Réservation: ${bookingId}
      - Nom: ${firstName} ${lastName}
      - Email: ${email}
      - Téléphone: ${phoneNumber}
      - Heure de la réservation: ${reservationTime}
    `;

    await resend.emails.send({
      from: "https://py-booking-services.vercel.app/",
      to: adminEmail,
      subject,
      text,
    });

    console.log("📩 Email envoyé à l'admin !");
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email :", error);
    throw new Error("Échec de l'envoi de l'email.");
  }
}
