import { Booking } from "@/types";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export const sendBookingToAdmin = async (
  booking: Booking,
  formData: FormData
) => {
  try {
    // Vérification des données de réservation
    if (!booking || !booking.service) {
      throw new Error(
        "Les informations de réservation ou de service sont manquantes."
      );
    }

    // Construction du contenu de l'email
    const emailContent = `
      Nouvelle demande de réservation:
      
      Nom : ${formData.firstName} ${formData.lastName}
      Email : ${formData.email}
      Téléphone : ${formData.phoneNumber}
      
      Réservation :
      Service : ${booking.service.name}
      Date : ${new Date(booking.startTime).toLocaleDateString("fr-FR")}
      Heure : ${new Date(booking.startTime).toLocaleTimeString("fr-FR")} - ${new Date(booking.endTime).toLocaleTimeString("fr-FR")}
      Montant : ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(booking.totalAmount)}
    `;

    // Envoi de l'email à l'administrateur
    await sendEmail({
      to: "gabeshine@live.fr", //email de l'administrateur
      subject: "Nouvelle demande de réservation",
      body: emailContent,
    });

    console.log("✅ Email envoyé à l'administrateur.");
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    throw new Error("Erreur lors de l'envoi de l'email.");
  }
};

// Fonction pour envoyer un email
async function sendEmail({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, subject, body }),
    });

    if (!response.ok) {
      throw new Error(`Échec de l'envoi de l'email : ${response.statusText}`);
    }

    console.log("✅ Email envoyé avec succès.");
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    throw new Error("Échec de l'envoi de l'email.");
  }
}
