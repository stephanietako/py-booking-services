// lib/emailService.ts
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
    !booking.Service ||
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
  const stripeUrl = data?.url;

  if (!res.ok || !stripeUrl) {
    throw new Error(data.error || "Échec de génération du lien de paiement.");
  }

  // Construire le contenu du mail - Accédez à booking.Service.name
  const emailContent = `
    Nouvelle demande de réservation :
    
    Nom : ${formData.firstName} ${formData.lastName}
    Email : ${formData.email}
    Téléphone : ${formData.phoneNumber}

    Réservation :
    Service : ${booking.Service.name}
    Date : ${new Date(booking.startTime).toLocaleDateString("fr-FR")}
    Heure : ${new Date(booking.startTime).toLocaleTimeString("fr-FR")} - ${new Date(booking.endTime).toLocaleTimeString("fr-FR")}
    Montant : ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: booking.Service.currency || "EUR" }).format(booking.totalAmount)}

    👉 Lien de paiement Stripe : ${stripeUrl}
  `;

  // Envoi mail à l'admin avec la facture PDF attachée
  await sendEmail({
    to: process.env.ADMIN_EMAIL || "gabeshine@live.fr",
    subject: `Nouvelle demande de réservation`,
    body: emailContent,
    attachments: [
      {
        filename,
        content: pdfBase64,
      },
    ],
  });
}

// Fonction sendEmail inchangée
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
    const text = body ?? "";

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, subject, text, html, attachments }),
    });

    if (!response.ok) {
      throw new Error(`Échec de l'envoi de l'email : ${response.statusText}`);
    }

    console.log("✅ Email envoyé à", to);
  } catch (error) {
    console.error("❌ Erreur d'envoi email:", error);
    throw new Error("Erreur lors de l'envoi de l'email.");
  }
}
