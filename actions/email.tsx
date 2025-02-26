"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailToAdmin({
  bookingId,
  userEmail,
}: {
  bookingId: string;
  userEmail: string;
}) {
  const adminEmail = "admin@example.com"; // Change avec l'email de l'admin

  try {
    await resend.emails.send({
      from: "noreply@yourapp.com",
      to: adminEmail,
      subject: "Nouvelle réservation en attente",
      html: `
        <p>Bonjour,</p>
        <p>Un utilisateur a confirmé une réservation. Voici les détails :</p>
        <ul>
          <li><strong>ID Réservation :</strong> ${bookingId}</li>
          <li><strong>Email Utilisateur :</strong> ${userEmail}</li>
        </ul>
        <p>Connectez-vous pour l'approuver ou la rejeter.</p>
      `,
    });

    console.log("Email envoyé à l'admin !");
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
  }
}
