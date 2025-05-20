//En résumé, cette route API sert d'intermédiaire entre le frontend et le backend
// //pour déclencher l'envoi d'un email à l'administrateur avec les détails de la réservation.
// Elle valide les données, construit le contenu de l'email et utilise Resend pour l'envoyer.
// app/api/admin/bookings/sendReservationDetails/route.ts

import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL;
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
interface SendEmailToAdminParams {
  bookingId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  reservationTime: string;
  stripeUrl?: string;
}

// Fonction pour envoyer un email à l'admin
async function sendEmailToAdmin({
  bookingId,
  firstName,
  lastName,
  email,
  phoneNumber,
  reservationTime,
  stripeUrl,
}: SendEmailToAdminParams) {
  if (!adminEmail) {
    console.error("❌ ADMIN_EMAIL n'est pas défini.");
    throw new Error("Configuration invalide : ADMIN_EMAIL manquant.");
  }

  try {
    const subject = `Nouvelle demande de confirmation #${bookingId}`;

    // Structure de l'email en HTML
    const html = `
      <h3>Nouvelle demande de confirmation</h3>
      <p>Un utilisateur a demandé une confirmation de réservation.</p>
      <table>
        <tr><td><strong>ID Réservation:</strong></td><td>${bookingId}</td></tr>
        <tr><td><strong>Nom:</strong></td><td>${firstName} ${lastName}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
        <tr><td><strong>Téléphone:</strong></td><td>${phoneNumber}</td></tr>
        <tr><td><strong>Date et heure:</strong></td><td>${reservationTime}</td></tr>
      </table>
       ${
         stripeUrl
           ? `<p><strong>Lien de paiement :</strong> <a href="${stripeUrl}" target="_blank">${stripeUrl}</a></p>`
           : ""
       }
      <p>Merci de confirmer la réservation.</p>
    `;

    // Envoi de l'email en HTML
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject,
      html,
    });

    console.log("📩 Email envoyé à l'admin !");
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email :", error);
    throw new Error("Échec de l'envoi de l'email.");
  }
}

// Exemple de route POST pour déclencher l'envoi de l'email
export async function POST(request: Request) {
  try {
    const body: SendEmailToAdminParams = await request.json();
    await sendEmailToAdmin(body);
    return NextResponse.json(
      { message: "Email envoyé avec succès !" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(
      "Erreur lors de la réception et du traitement de la requête :",
      error
    );
    let errorMessage = "Une erreur inconnue est survenue.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
