// lib/sendConfirmationEmails.ts
// import { Resend } from "resend";
// import { prisma } from "@/lib/prisma";
// import { Booking, BookingOption, Client, Service } from "@/types";

// const resend = new Resend(process.env.RESEND_API_KEY);
// const adminEmail = process.env.ADMIN_EMAIL || "yachtingday@gmail.com";
// const fromEmail = process.env.RESEND_FROM_EMAIL || "yachtingday@gmail.com";
// type BookingWithDetails = Booking & {
//   service: Service;
//   bookingOptions: BookingOption[];
//   client: Client | null;
// };

// export async function sendConfirmationEmails(bookingId: number) {
//   try {
//     const rawBooking = await prisma.booking.findUnique({
//       where: { id: bookingId },
//       include: {
//         Service: true,
//         bookingOptions: true,
//         client: true,
//       },
//     });

//     if (!rawBooking || !rawBooking.Service) {
//       throw new Error("❌ Réservation ou service manquant.");
//     }

//     const booking: BookingWithDetails = {
//       ...rawBooking,
//       service: {
//         ...rawBooking.Service,
//         description: rawBooking.Service.description ?? undefined,
//       },
//       bookingOptions: rawBooking.bookingOptions.map((opt) => ({
//         ...opt,
//         description: opt.description ?? undefined,
//       })),
//       client: rawBooking.client,
//     };

//     const {
//       client,
//       service,
//       bookingOptions,
//       totalAmount,
//       startTime,
//       endTime,
//       boatAmount,
//     } = booking;

//     const fullName = client?.fullName ?? "Client";
//     const email = client?.email;
//     const phoneNumber = client?.phoneNumber ?? "Non renseigné";
//     const currency = service.currency || "EUR";

//     const onboardTotal = bookingOptions.reduce(
//       (sum, opt) => sum + opt.unitPrice * opt.quantity,
//       0
//     );

//     const formatter = new Intl.NumberFormat("fr-FR", {
//       style: "currency",
//       currency,
//     });

//     const formattedStart = new Date(startTime).toLocaleString("fr-FR", {
//       dateStyle: "full",
//       timeStyle: "short",
//     });

//     const formattedEnd = new Date(endTime).toLocaleTimeString("fr-FR", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });

//     // Email Client
//     if (email) {
//       await resend.emails.send({
//         from: fromEmail,
//         to: email,
//         subject: `🎉 Confirmation de votre réservation #${bookingId}`,
//         html: `
//           <h2>Bonjour ${fullName},</h2>
//           <p>Merci pour votre réservation avec <strong>${service.name}</strong>.</p>
//           <p><strong>Date :</strong> ${formattedStart} - ${formattedEnd}</p>
//           <p><strong>Montant payé en ligne :</strong> ${formatter.format(boatAmount)}</p>
//           <p><strong>Total à régler à bord :</strong> ${formatter.format(onboardTotal)}</p>
//           <p>Nous avons hâte de vous accueillir à bord !</p>
//         `,
//       });
//     }

//     // Email Admin
//     await resend.emails.send({
//       from: fromEmail,
//       to: adminEmail,
//       subject: `Nouvelle réservation confirmée #${bookingId}`,
//       html: `
//         <h3>Nouvelle réservation confirmée</h3>
//         <ul>
//           <li><strong>Nom :</strong> ${fullName}</li>
//           <li><strong>Email :</strong> ${email ?? "Non fourni"}</li>
//           <li><strong>Téléphone :</strong> ${phoneNumber}</li>
//           <li><strong>Service :</strong> ${service.name}</li>
//           <li><strong>Date :</strong> ${formattedStart} - ${formattedEnd}</li>
//           <li><strong>Total payé :</strong> ${formatter.format(totalAmount)}</li>
//         </ul>
//       `,
//     });

//     console.log("✅ Emails client + admin envoyés pour booking #" + bookingId);
//   } catch (error) {
//     console.error("❌ Erreur sendConfirmationEmails:", error);
//     throw new Error("Échec de l'envoi des emails de confirmation.");
//   }
// }
// lib/sendConfirmationEmails.ts
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { Booking, BookingOption, Client, Service } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL || "yachtingday@gmail.com";
const fromEmail = process.env.RESEND_FROM_EMAIL || "yachtingday@gmail.com";
type BookingWithDetails = Booking & {
  service: Service;
  bookingOptions: BookingOption[];
  client: Client | null;
};

export async function sendConfirmationEmails(
  bookingId: number,
  verificationToken?: string
) {
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

    let clientEmailContent = `
      <h2>Bonjour ${fullName},</h2>
      <p>Merci pour votre réservation avec <strong>${service.name}</strong>.</p>
      <p><strong>Date :</strong> ${formattedStart} - ${formattedEnd}</p>
      <p><strong>Montant payé en ligne :</strong> ${formatter.format(boatAmount)}</p>
      <p><strong>Total à régler à bord :</strong> ${formatter.format(onboardTotal)}</p>
      <p>Nous avons hâte de vous accueillir à bord !</p>
    `;

    // Ajouter le lien de vérification si le token est présent (client non connecté)
    if (email && verificationToken) {
      const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/booking/verify?token=${verificationToken}`;
      clientEmailContent += `<p>Veuillez cliquer sur le lien ci-dessous pour confirmer votre réservation :</p>`;
      clientEmailContent += `<p><a href="${verificationLink}" target="_blank">Confirmer ma réservation</a></p>`;
    }

    // Email Client
    if (email) {
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `🎉 Confirmation de votre réservation #${bookingId}`,
        html: clientEmailContent,
      });
    }

    // Email Admin (inchangé pour l'instant)
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `Nouvelle réservation confirmée #${bookingId}`,
      html: `
        <h3>Nouvelle réservation confirmée</h3>
        <ul>
          <li><strong>Nom :</strong> ${fullName}</li>
          <li><strong>Email :</strong> ${email ?? "Non fourni"}</li>
          <li><strong>Téléphone :</strong> ${phoneNumber}</li>
          <li><strong>Service :</strong> ${service.name}</li>
          <li><strong>Date :</strong> ${formattedStart} - ${formattedEnd}</li>
          <li><strong>Total payé :</strong> ${formatter.format(totalAmount)}</li>
        </ul>
      `,
    });

    console.log("✅ Emails client + admin envoyés pour booking #" + bookingId);
  } catch (error) {
    console.error("❌ Erreur sendConfirmationEmails:", error);
    throw new Error("Échec de l'envoi des emails de confirmation.");
  }
}
