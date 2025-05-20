// app/api/admin/bookings/send-invoice/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoice } from "@/lib/pdf/generateInvoice";
import { Booking } from "@/types";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId manquant" },
        { status: 400 }
      );
    }

    // 1. Récupérer la réservation avec toutes les données nécessaires
    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      include: {
        Service: true,
        client: true,
        bookingOptions: true,
      },
    });

    if (!booking || !booking.client || !booking.Service) {
      return NextResponse.json(
        { error: "Données de réservation incomplètes" },
        { status: 404 }
      );
    }

    // 2. Générer le PDF (Uint8Array)
    const pdfBuffer = await generateInvoice(booking as Booking);
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

    // 3. Détails communs
    const clientEmail = booking.client.email;
    const adminEmail = process.env.ADMIN_EMAIL || "gabeshine@live.fr";
    const fileName = `facture-booking-${booking.id}.pdf`;

    // 4. Envoi au client
    if (clientEmail) {
      await resend.emails.send({
        from: fromEmail,
        to: clientEmail,
        subject: `Votre facture de réservation #${booking.id}`,
        html: `
      <div style="font-family: sans-serif;">
   <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day" width="150" />
        <p>Bonjour ${booking.client.fullName},</p>
        <p>Voici votre facture en pièce jointe. Merci pour votre confiance !</p>
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
    }

    // 5. Envoi à l’admin
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `📄 Facture de réservation #${booking.id}`,
      html: `
    <div style="font-family: sans-serif;">
   <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day" width="150" />
      <p>Facture de la réservation #${booking.id} jointe en PDF.</p>
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
