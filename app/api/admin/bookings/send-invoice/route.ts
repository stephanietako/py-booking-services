// app/api/admin/bookings/send-invoice/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoice } from "@/lib/pdf/generateInvoice";
// Il faudra probablement étendre le type Booking si ce n'est pas déjà fait
// ou créer un type local pour cette route si Booking from "@/types" ne suffit pas.
import { Resend } from "resend";
import { Booking, BookingOption, Option, Service, Client } from "@/types"; // Assurez-vous que tous les types sont importés
import { escapeHtml } from "@/utils/escapeHtml";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// Nouveau type pour la réservation telle qu'elle sera récupérée ici
type BookingForInvoice = Booking & {
  service: Service; // service is required, not optional
  client: Client;
  bookingOptions: (BookingOption & { option: Option })[];
};

export async function POST(req: Request) {
  try {
    const { bookingId, sendToClient = true } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId manquant" },
        { status: 400 }
      );
    }

    // 1. Récupérer la réservation AVEC les détails des options
    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      include: {
        Service: true,
        client: true,
        bookingOptions: {
          include: {
            option: true,
          },
        },
      },
    });

    // 2. Vérification des données récupérées
    if (!booking || !booking.client || !booking.Service) {
      return NextResponse.json(
        { error: "Données de réservation incomplètes" },
        { status: 404 }
      );
    }

    // 3. Vérifier si la facture a déjà été envoyée
    if (sendToClient && booking.invoiceSent) {
      return NextResponse.json(
        { error: "La facture a déjà été envoyée au client." },
        { status: 409 }
      );
    }

    const optionsPayableAtBoard = booking.bookingOptions.filter(
      (bo) => bo.option?.payableAtBoard
    );

    const totalOptionsPayableAtBoard = optionsPayableAtBoard.reduce(
      (sum, bo) => sum + (bo.option?.unitPrice || 0) * (bo.quantity || 1),
      0
    );

    // const needsCaptain = !booking.withCaptain;
    // const captainPrice = needsCaptain ? 350 : 0;
    const needsCaptain =
      !booking.withCaptain && booking.Service?.requiresCaptain;
    const captainPrice = needsCaptain
      ? (booking.Service?.captainPrice ?? 350)
      : 0;
    const totalPayableOnBoard = totalOptionsPayableAtBoard + captainPrice;

    // ...puis continue avec la génération du PDF et l'envoi des emails...
    // Cast vers notre type étendu pour une meilleure typage
    const bookingForInvoice: BookingForInvoice = {
      ...booking,
      service: booking.Service as Service, // Assure TypeScript that service is present
      client: booking.client as Client,
      bookingOptions: booking.bookingOptions as (BookingOption & {
        option: Option;
      })[],
    };

    // 4. Générer la facture (passer le booking avec les options détaillées)
    // generateInvoice devra être capable de gérer ce nouveau type
    const pdfBuffer = await generateInvoice(bookingForInvoice);
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

    //const clientEmail = booking.client.email;
    const adminEmail = process.env.ADMIN_EMAIL || "gabeshine@live.fr";
    const fileName = `facture-booking-${booking.id}.pdf`;

    // 5. Envoi à l’admin (toujours) (le reste du code reste inchangé)
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `📄 Facture de réservation #${booking.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day" width="150" style="display: block; margin-bottom: 20px;" />
          <h2 style="color: #0056b3;">Nouvelle Facture de Réservation</h2>
          <p>Facture de la réservation <strong style="color: #d9534f;">#${booking.id}</strong> jointe en PDF.</p>
        <ul style="list-style-type: none; padding: 0;">
  <li style="margin-bottom: 5px;"><strong>Client :</strong> ${booking.client.fullName}</li>
  <li style="margin-bottom: 5px;"><strong>Email Client :</strong> ${booking.client.email}</li>
  <li style="margin-bottom: 5px;"><strong>Téléphone Client :</strong> ${booking.client.phoneNumber || "—"}</li>
  <li style="margin-bottom: 5px;"><strong>Service :</strong> ${booking.Service.name}</li>
  <li style="margin-bottom: 5px;"><strong>Date de début :</strong> ${new Date(booking.startTime).toLocaleString("fr-FR")}</li>
  <li style="margin-bottom: 5px;"><strong>Date de fin :</strong> ${new Date(booking.endTime).toLocaleString("fr-FR")}</li>
  <li style="margin-bottom: 5px;"><strong>Montant location bateau :</strong> ${(booking.Service?.defaultPrice ?? 0).toLocaleString("fr-FR", { style: "currency", currency: booking.Service?.currency ?? "EUR" })}</li>
  <li style="margin-bottom: 5px;"><strong>Capitaine :</strong> ${booking.withCaptain ? "Oui" : "Non"}</li>
  <li style="margin-bottom: 5px;"><strong>Repas traiteur :</strong> ${booking.mealOption ? "Oui" : "Non"}</li>
  <li style="margin-bottom: 5px;"><strong>Commentaire client :</strong> ${booking.description ? escapeHtml(booking.description) : "—"}</li>
  ${
    booking.bookingOptions.length > 0
      ? `<li style="margin-bottom: 5px;"><strong>Options réservées :</strong>
          <ul>
            ${booking.bookingOptions
              .map(
                (bo) =>
                  `<li>${bo.quantity} × ${bo.option.label} (${bo.option.unitPrice.toLocaleString("fr-FR", { style: "currency", currency: booking.Service?.currency ?? "EUR" })}/unité) = ${(bo.quantity * bo.option.unitPrice).toLocaleString("fr-FR", { style: "currency", currency: booking.Service?.currency ?? "EUR" })}</li>`
              )
              .join("")}
          </ul>
        </li>`
      : "<li>Aucune option réservée.</li>"
  }
  <li style="margin-bottom: 5px;"><strong>Total options à régler à bord :</strong> ${totalOptionsPayableAtBoard.toFixed(2)} €</li>
  <li style="margin-bottom: 5px;"><strong>Total à régler à bord (options + capitaine) :</strong> ${totalPayableOnBoard.toFixed(2)} €</li>
  <li style="margin-bottom: 5px; color: #dc3545;"><strong>Caution à prévoir à bord :</strong> ${booking.Service.cautionAmount.toLocaleString("fr-FR", { style: "currency", currency: booking.Service.currency })}</li>
</ul>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur send-invoice:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
