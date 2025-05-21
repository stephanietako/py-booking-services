// lib/emailService.ts
import { Booking } from "@/types";
import { generateInvoice } from "@/lib/pdf/generateInvoice";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message?: string;
}

export async function sendBookingToAdmin(booking: Booking, formData: FormData) {
  if (!booking || !booking.service) {
    throw new Error(
      "Les informations de réservation ou de service sont manquantes."
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(
    `${baseUrl}/api/admin/bookings/${booking.id}/payment-url`
  );

  const data = await res.json();
  const stripeUrl = data?.url;

  if (!res.ok || !stripeUrl) {
    throw new Error(data.error || "Échec de génération du lien de paiement.");
  }

  const emailContent = `
    Nouvelle demande de réservation:
    
    Nom : ${formData.firstName} ${formData.lastName}
    Email : ${formData.email}
    Téléphone : ${formData.phoneNumber}

    Réservation :
    Service : ${booking.service.name}
    Date : ${new Date(booking.startTime).toLocaleDateString("fr-FR")}
    Heure : ${new Date(booking.startTime).toLocaleTimeString("fr-FR")} - ${new Date(booking.endTime).toLocaleTimeString("fr-FR")}
    Montant : ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: booking.service.currency || "EUR" }).format(booking.totalAmount)}

    👉 Lien de paiement Stripe : ${stripeUrl}
  `;

  return sendEmail({
    to: process.env.ADMIN_EMAIL || "gabeshine@live.fr",
    subject: `Nouvelle demande de réservation`,
    body: emailContent,
  });
}

export async function sendConfirmationToClient(booking: Booking) {
  if (!booking.client || !booking.service) {
    throw new Error(
      "Client ou service manquant pour l'envoi de la confirmation."
    );
  }

  const onboardTotal =
    booking.bookingOptions?.reduce(
      (sum, opt) => sum + opt.unitPrice * opt.quantity,
      0
    ) ?? 0;

  const formatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: booking.service.currency || "EUR",
  });

  const html = `
    <h2>Bonjour ${booking.client.fullName},</h2>
    <p>Merci pour la réservation de votre <strong>${booking.service.name}</strong> avec Yaching Day .</p>
    <p><strong>Date :</strong> ${new Date(booking.startTime).toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" })} - ${new Date(booking.endTime).toLocaleTimeString("fr-FR")}</p>
    <p><strong>Montant payé en ligne :</strong> ${formatter.format(booking.boatAmount)}</p>
    <p><strong>Total à régler à bord :</strong> ${formatter.format(onboardTotal)}</p>
    <p>Nous avons hâte de vous accueillir à bord !</p>
  `;

  return sendEmail({
    to: booking.client.email,
    subject: `🎉 Confirmation de votre réservation #${booking.id}`,
    html,
  });
}

export async function sendStripeLinkToClient(
  clientEmail: string,
  clientName: string,
  bookingId: number,
  stripeLink: string
) {
  const subject = `💳 Paiement pour votre réservation #${bookingId}`;
  const html = `
    <h2>Bonjour ${clientName},</h2>
    <p>Merci pour votre demande de réservation.</p>
    <p>Vous pouvez régler votre réservation en cliquant sur le lien ci-dessous :</p>
    <p><a href="${stripeLink}" target="_blank">👉 Payer maintenant</a></p>
    <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
  `;

  return sendEmail({
    to: clientEmail,
    subject,
    html,
  });
}

export async function sendInvoiceEmails(booking: Booking) {
  const pdfBuffer = await generateInvoice(booking);
  const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");
  const filename = `facture-booking-${booking.id}.pdf`;

  if (booking.client?.email) {
    await sendEmail({
      to: booking.client.email,
      subject: `📄 Votre facture - Réservation #${booking.id}`,
      html: `<p>Bonjour ${booking.client.fullName},</p><p>Voici votre facture en pièce jointe.</p>`,
      attachments: [{ filename, content: pdfBase64 }],
    });
  }

  await sendEmail({
    to: process.env.ADMIN_EMAIL || "gabeshine@live.fr",
    subject: `📥 Facture client - Réservation #${booking.id}`,
    html: `<p>Facture client en pièce jointe pour la réservation ${booking.id}.</p>`,
    attachments: [{ filename, content: pdfBase64 }],
  });
}

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
    // Pour respecter le type CreateEmailOptions de Resend, 'text' est obligatoire.
    // On utilise 'body' ou une chaîne vide si non fournie.
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
