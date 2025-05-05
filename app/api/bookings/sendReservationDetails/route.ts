import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailToAdminParams {
  bookingId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  reservationTime: string; // Ajout de la date et heure de la réservation
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
      <p>Merci de confirmer la réservation.</p>
    `;

    // Envoi de l'email en HTML
    await resend.emails.send({
      from: "https://py-booking-services.vercel.app/",
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

/////////////
// Exemple d'appel API depuis le frontend avec fetch

// async function sendReservationDetails(bookingDetails: {
//   bookingId: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   reservationTime: string;
// }) {
//   const response = await fetch('/api/bookings/sendReservationDetails', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(bookingDetails),
//   });

//   if (response.ok) {
//     const result = await response.json();
//     console.log('Réservation envoyée:', result);
//   } else {
//     console.error('Erreur d\'envoi de la réservation:', response.statusText);
//   }
// }
