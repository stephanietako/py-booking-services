// lib/sendConfirmationEmails.ts
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { Booking, BookingOption, Client, Service } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL || "gabeshine@live.fr";
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

type BookingWithDetails = Booking & {
  service: Service;
  bookingOptions: BookingOption[];
  client: Client | null;
};

export async function sendConfirmationEmails(bookingId: number) {
  try {
    const rawBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Service: true,
        bookingOptions: true,
        client: true,
      },
    });

    if (!rawBooking || !rawBooking.Service) {
      throw new Error("❌ Réservation ou service manquant.");
    }

    const booking: BookingWithDetails = {
      ...rawBooking,
      service: {
        ...rawBooking.Service,
        description: rawBooking.Service.description ?? undefined,
      },
      bookingOptions: rawBooking.bookingOptions.map((opt) => ({
        ...opt,
        description: opt.description ?? undefined,
      })),
      client: rawBooking.client,
    };

    const {
      client,
      service,
      bookingOptions,
      totalAmount,
      startTime,
      endTime,
      boatAmount,
    } = booking;

    const fullName = client?.fullName ?? "Client";
    const email = client?.email;
    const phoneNumber = client?.phoneNumber ?? "Non renseigné";
    const currency = service.currency || "EUR";

    const onboardTotal = bookingOptions.reduce(
      (sum, opt) => sum + opt.unitPrice * opt.quantity,
      0
    );

    const formatter = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
    });

    const formattedStart = new Date(startTime).toLocaleString("fr-FR", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const formattedEnd = new Date(endTime).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Contenu HTML pour le client
    const clientEmailContent = `
      <h2>Bonjour ${fullName},</h2>
         <p>Merci pour votre réservation de location et <strong>${booking.service.name}</strong> avec Yaching Day .</p>
      <p><strong>Date :</strong> ${formattedStart} - ${formattedEnd}</p>
      <p><strong>Montant payé en ligne :</strong> ${formatter.format(boatAmount)}</p>
      <p><strong>Total à régler à bord :</strong> ${formatter.format(onboardTotal)}</p>
      <p>Nous avons hâte de vous accueillir à bord !</p>
    `;

    // Texte brut pour le client (obligatoire pour Resend)
    const clientTextContent =
      `Bonjour ${fullName},\n` +
      `Merci pour votre réservation de location et ${service.name} avec Yaching Day.\n` +
      `Date : ${formattedStart} - ${formattedEnd}\n` +
      `Montant payé en ligne : ${formatter.format(boatAmount)}\n` +
      `Total à régler à bord : ${formatter.format(onboardTotal)}\n` +
      `Nous avons hâte de vous accueillir à bord !`;

    // Envoi email client
    if (email) {
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `🎉 Confirmation de votre réservation #${bookingId}`,
        html: clientEmailContent,
        text: clientTextContent,
      });
    }

    // Contenu email admin (HTML + texte)
    const adminEmailHtml = `
      <h3>Nouvelle réservation confirmée</h3>
      <ul>
        <li><strong>Nom :</strong> ${fullName}</li>
        <li><strong>Email :</strong> ${email ?? "Non fourni"}</li>
        <li><strong>Téléphone :</strong> ${phoneNumber}</li>
        <li><strong>Service :</strong> ${service.name}</li>
        <li><strong>Date :</strong> ${formattedStart} - ${formattedEnd}</li>
        <li><strong>Total a payer :</strong> ${formatter.format(totalAmount)}</li>
      </ul>
    `;

    const adminText =
      `Nouvelle réservation confirmée\n` +
      `Nom: ${fullName}\n` +
      `Email: ${email ?? "Non fourni"}\n` +
      `Téléphone: ${phoneNumber}\n` +
      `Service: ${service.name}\n` +
      `Date: ${formattedStart} - ${formattedEnd}\n` +
      `Total payé: ${formatter.format(totalAmount)}`;

    // Envoi email admin
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `Nouvelle réservation confirmée #${bookingId}`,
      html: adminEmailHtml,
      text: adminText,
    });

    console.log("✅ Emails client + admin envoyés pour booking #" + bookingId);
  } catch (error) {
    console.error("❌ Erreur sendConfirmationEmails:", error);
    throw new Error("Échec de l'envoi des emails de confirmation.");
  }
}
