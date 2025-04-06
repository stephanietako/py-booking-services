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
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error("❌ ADMIN_EMAIL n'est pas défini.");
    throw new Error("Configuration invalide : ADMIN_EMAIL manquant.");
  }

  try {
    const subject = `Nouvelle demande de confirmation #${bookingId}`;
    const text = `Bonjour Pierre-Yves,l'utilisateur ${userEmail} a demandé une confirmation de réservation.`;

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
