// app/api/admin/bookings/send-invoice/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { generateInvoice } from "@/lib/pdf/generateInvoice";
// import { Booking } from "@/types";
// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);
// const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// export async function POST(req: Request) {
//   try {
//     const { bookingId, sendToClient = true } = await req.json();

//     if (!bookingId) {
//       return NextResponse.json(
//         { error: "bookingId manquant" },
//         { status: 400 }
//       );
//     }

//     // 1. Récupérer la réservation
//     const booking = await prisma.booking.findUnique({
//       where: { id: Number(bookingId) },
//       include: {
//         Service: true,
//         client: true,
//         bookingOptions: true,
//       },
//     });
//     // 2. Vérification des données récupérées
//     if (!booking || !booking.client || !booking.Service) {
//       return NextResponse.json(
//         { error: "Données de réservation incomplètes" },
//         { status: 404 }
//       );
//     }
//     // 3. Vérifier si la facture a déjà été envoyée
//     if (sendToClient && booking.invoiceSent) {
//       return NextResponse.json(
//         { error: "La facture a déjà été envoyée au client." },
//         { status: 409 }
//       );
//     }

//     // 4. Générer la facture
//     const pdfBuffer = await generateInvoice(booking as Booking);
//     const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

//     const clientEmail = booking.client.email;
//     const adminEmail = process.env.ADMIN_EMAIL || "gabeshine@live.fr";
//     const fileName = `facture-booking-${booking.id}.pdf`;

//     // 5. Envoi au client
//     if (sendToClient && clientEmail) {
//       await resend.emails.send({
//         from: fromEmail,
//         to: clientEmail,
//         subject: `Votre facture de réservation #${booking.id}`,
//         html: `
//           <div style="font-family: sans-serif;">
//             <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day" width="150" />
//             <p>Bonjour ${booking.client.fullName},</p>
//             <p>Voici votre facture en pièce jointe. Merci pour votre confiance !</p>
//           </div>
//         `,
//         attachments: [
//           {
//             filename: fileName,
//             content: pdfBase64,
//             contentType: "application/pdf",
//           },
//         ],
//       });

//       // ✅ Marquer comme envoyée
//       await prisma.booking.update({
//         where: { id: booking.id },
//         data: { invoiceSent: true },
//       });
//     }

//     // 6. Envoi à l’admin (toujours)
//     await resend.emails.send({
//       from: fromEmail,
//       to: adminEmail,
//       subject: `📄 Facture de réservation #${booking.id}`,
//       html: `
//         <div style="font-family: sans-serif;">
//           <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day" width="150" />
//           <p>Facture de la réservation #${booking.id} jointe en PDF.</p>
//         </div>
//       `,
//       attachments: [
//         {
//           filename: fileName,
//           content: pdfBase64,
//           contentType: "application/pdf",
//         },
//       ],
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("❌ Erreur send-invoice:", error);
//     return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
//   }
// }
// app/api/admin/bookings/send-invoice/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { generateInvoice } from "@/lib/pdf/generateInvoice";
// import { Booking } from "@/types";
// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);
// const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// export async function POST(req: Request) {
//   try {
//     const { bookingId, sendToClient = true } = await req.json();

//     if (!bookingId) {
//       return NextResponse.json(
//         { error: "bookingId manquant" },
//         { status: 400 }
//       );
//     }

//     // 1. Récupérer la réservation
//     const booking = await prisma.booking.findUnique({
//       where: { id: Number(bookingId) },
//       include: {
//         Service: true,
//         client: true,
//         bookingOptions: true,
//       },
//     });
//     // 2. Vérification des données récupérées
//     if (!booking || !booking.client || !booking.Service) {
//       return NextResponse.json(
//         { error: "Données de réservation incomplètes" },
//         { status: 404 }
//       );
//     }
//     // 3. Vérifier si la facture a déjà été envoyée
//     if (sendToClient && booking.invoiceSent) {
//       return NextResponse.json(
//         { error: "La facture a déjà été envoyée au client." },
//         { status: 409 }
//       );
//     }

//     // 4. Générer la facture
//     const pdfBuffer = await generateInvoice(booking as Booking);
//     const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

//     const clientEmail = booking.client.email;
//     const adminEmail = process.env.ADMIN_EMAIL || "gabeshine@live.fr";
//     const fileName = `facture-booking-${booking.id}.pdf`;

//     // 5. Envoi au client
//     if (sendToClient && clientEmail) {
//       await resend.emails.send({
//         from: fromEmail,
//         to: clientEmail,
//         subject: `Votre facture de réservation #${booking.id}`,
//         html: `
//           <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
//             <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day" width="150" style="display: block; margin-bottom: 20px;" />
//             <p style="margin-bottom: 10px;">Bonjour <strong style="color: #0056b3;">${booking.client.fullName}</strong>,</p>
//             <p style="margin-bottom: 20px;">Voici votre facture en pièce jointe. Merci pour votre confiance !</p>
//             <p style="font-size: 0.9em; color: #666;">Cordialement,<br/>L'équipe Yachting Day</p>
//           </div>
//         `,
//         attachments: [
//           {
//             filename: fileName,
//             content: pdfBase64,
//             contentType: "application/pdf",
//           },
//         ],
//       });

//       // ✅ Marquer comme envoyée
//       await prisma.booking.update({
//         where: { id: booking.id },
//         data: { invoiceSent: true },
//       });
//     }

//     // 6. Envoi à l’admin (toujours)
//     await resend.emails.send({
//       from: fromEmail,
//       to: adminEmail,
//       subject: `📄 Facture de réservation #${booking.id}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
//           <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day" width="150" style="display: block; margin-bottom: 20px;" />
//           <h2 style="color: #0056b3;">Nouvelle Facture de Réservation</h2>
//           <p>Facture de la réservation <strong style="color: #d9534f;">#${booking.id}</strong> jointe en PDF.</p>
//           <ul style="list-style-type: none; padding: 0;">
//             <li style="margin-bottom: 5px;"><strong>Client:</strong> ${booking.client.fullName}</li>
//             <li style="margin-bottom: 5px;"><strong>Email Client:</strong> ${booking.client.email}</li>
//             <li style="margin-bottom: 5px;"><strong>Service:</strong> ${booking.Service.name}</li>
//             <li style="margin-bottom: 5px;"><strong>Date de réservation:</strong> ${new Date(booking.createdAt).toLocaleDateString("fr-FR")}</li>
//           </ul>
//         </div>
//       `,
//       attachments: [
//         {
//           filename: fileName,
//           content: pdfBase64,
//           contentType: "application/pdf",
//         },
//       ],
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("❌ Erreur send-invoice:", error);
//     return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
//   }
// }
// app/api/admin/bookings/send-invoice/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoice } from "@/lib/pdf/generateInvoice";
// Il faudra probablement étendre le type Booking si ce n'est pas déjà fait
// ou créer un type local pour cette route si Booking from "@/types" ne suffit pas.
import { Resend } from "resend";
import { Booking, BookingOption, Option, Service, Client } from "@/types"; // Assurez-vous que tous les types sont importés

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// Nouveau type pour la réservation telle qu'elle sera récupérée ici
type BookingForInvoice = Booking & {
  Service: Service;
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

    // Cast vers notre type étendu pour une meilleure typage
    const bookingForInvoice: BookingForInvoice = booking as BookingForInvoice;

    // 4. Générer la facture (passer le booking avec les options détaillées)
    // generateInvoice devra être capable de gérer ce nouveau type
    const pdfBuffer = await generateInvoice(bookingForInvoice);
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

    const clientEmail = booking.client.email;
    const adminEmail = process.env.ADMIN_EMAIL || "gabeshine@live.fr";
    const fileName = `facture-booking-${booking.id}.pdf`;

    // 5. Envoi au client (le reste du code reste inchangé)
    if (sendToClient && clientEmail) {
      await resend.emails.send({
        from: fromEmail,
        to: clientEmail,
        subject: `Votre facture de réservation #${booking.id}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day" width="150" style="display: block; margin-bottom: 20px;" />
            <p style="margin-bottom: 10px;">Bonjour <strong style="color: #0056b3;">${booking.client.fullName}</strong>,</p>
            <p style="margin-bottom: 20px;">Voici votre facture en pièce jointe. Merci pour votre confiance !</p>
            <p style="font-size: 0.9em; color: #666;">Cordialement,<br/>L'équipe Yachting Day</p>
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

      // ✅ Marquer comme envoyée
      await prisma.booking.update({
        where: { id: booking.id },
        data: { invoiceSent: true },
      });
    }

    // 6. Envoi à l’admin (toujours) (le reste du code reste inchangé)
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
            <li style="margin-bottom: 5px;"><strong>Client:</strong> ${booking.client.fullName}</li>
            <li style="margin-bottom: 5px;"><strong>Email Client:</strong> ${booking.client.email}</li>
            <li style="margin-bottom: 5px;"><strong>Service:</strong> ${booking.Service.name}</li>
            <li style="margin-bottom: 5px;"><strong>Date de réservation:</strong> ${new Date(booking.createdAt).toLocaleDateString("fr-FR")}</li>
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
