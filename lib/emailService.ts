import { BookingWithDetails } from "@/types";
import { generateInvoice } from "@/lib/pdf/generateInvoice";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message?: string;
}

export async function sendBookingToAdmin(
  booking: BookingWithDetails,
  formData: FormData
) {
  if (
    !booking ||
    !booking.service ||
    !booking.client ||
    !booking.bookingOptions ||
    booking.bookingOptions.some((opt) => !opt.option)
  ) {
    throw new Error(
      "La réservation est incomplète : service, options ou client manquant pour l'envoi."
    );
  }

  // Générer la facture PDF
  const pdfBuffer = await generateInvoice(booking);
  const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");
  const filename = `facture-booking-${booking.id}.pdf`;

  // Obtenir le lien Stripe
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(
    `${baseUrl}/api/admin/bookings/${booking.id}/payment-url`
  );
  const data = await res.json();

  if (!res.ok || typeof data?.url !== "string") {
    throw new Error(data?.error || "Échec de génération du lien de paiement.");
  }

  const stripeUrl = data.url;

  // Construire le contenu de l'email (texte brut)
  const emailContent = `
Nouvelle demande de réservation :

👤 Client : ${formData.firstName} ${formData.lastName}
📧 Email : ${formData.email}
📞 Téléphone : ${formData.phoneNumber}

🛥️ Service : ${booking.service.name}
📅 Date : ${new Date(booking.startTime).toLocaleDateString("fr-FR")}
🕐 Heure : ${new Date(booking.startTime).toLocaleTimeString("fr-FR")} - ${new Date(booking.endTime).toLocaleTimeString("fr-FR")}
💰 Montant : ${new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: booking.service.currency || "EUR",
  }).format(booking.totalAmount)}

🔗 Lien de paiement : ${stripeUrl}
`;

  // Envoi de l'email à l'administrateur avec la facture en pièce jointe
  await sendEmail({
    to: process.env.ADMIN_EMAIL || "gabeshine@live.fr",
    subject: "Nouvelle demande de réservation",
    body: emailContent,
    attachments: [
      {
        filename,
        content: pdfBase64,
      },
    ],
  });
}

// Fonction d'envoi d'email générique
async function sendEmail({
  to,
  subject,
  body,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  body?: string;
  html?: string;
  attachments?: { filename: string; content: string }[];
}) {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject,
        text: body ?? "",
        html,
        attachments,
      }),
    });

    if (!response.ok) {
      throw new Error(`Échec de l'envoi de l'email : ${response.statusText}`);
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("✅ Email envoyé à", to);
    }
  } catch (error) {
    console.error("❌ Erreur d'envoi email:", error);
    throw new Error("Erreur lors de l'envoi de l'email.");
  }
}
