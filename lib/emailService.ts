// lib/emailService.ts

import { Booking } from "@/types";

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
    <p>Merci pour votre réservation avec <strong>${booking.service.name}</strong>.</p>
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

async function sendEmail({
  to,
  subject,
  body,
  html,
}: {
  to: string;
  subject: string;
  body?: string;
  html?: string;
}) {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, subject, body, html }),
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
