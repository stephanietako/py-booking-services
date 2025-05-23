// lib/sendConfirmationEmails.ts
// lib/sendConfirmationEmails.ts
// import { Resend } from "resend";
// import { prisma } from "@/lib/prisma";
// import { Booking, BookingOption, Client, Service } from "@/types";

// const resend = new Resend(process.env.RESEND_API_KEY);
// const adminEmail = process.env.ADMIN_EMAIL || "gabeshine@live.fr";
// const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

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
//       (sum, opt) => sum + (opt.unitPrice ?? 0) * (opt.quantity ?? 0),
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

//     const serviceName = service.name;
//     const bookingDate = new Date(startTime).toLocaleDateString("fr-FR");

//     // Contenu HTML pour le client (avec styles inline)
//     const clientEmailContent = `
//       <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
//         <h2 style="color: #005ea2;">Bonjour ${fullName},</h2>
//         <p>Merci pour votre réservation de <strong>${serviceName}</strong> avec <strong>Yachting Day</strong>.</p>
//         <p><strong>Date :</strong> ${formattedStart} - ${formattedEnd}</p>
//         <p><strong>Montant payé en ligne :</strong> ${formatter.format(boatAmount)}</p>
//         <p><strong>Total à régler à bord :</strong> ${formatter.format(onboardTotal)}</p>
//         <p>Nous avons hâte de vous accueillir à bord !</p>
//         <p style="font-style: italic;">L’équipe Yachting Day</p>
//       </div>
//     `;

//     const clientTextContent =
//       `Bonjour ${fullName},\n` +
//       `Merci pour votre réservation de ${serviceName} avec Yachting Day.\n` +
//       `Date : ${formattedStart} - ${formattedEnd}\n` +
//       `Montant payé en ligne : ${formatter.format(boatAmount)}\n` +
//       `Total à régler à bord : ${formatter.format(onboardTotal)}\n` +
//       `Nous avons hâte de vous accueillir à bord !`;

//     // Envoi email client
//     if (email) {
//       await resend.emails.send({
//         from: fromEmail,
//         to: email,
//         subject: `✅ Confirmation - ${serviceName} le ${bookingDate}`,
//         html: clientEmailContent,
//         text: clientTextContent,
//       });
//     }

//     // Contenu HTML pour l’admin (avec styles)
//     const adminEmailHtml = `
//       <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
//         <h3 style="color: #c0392b;">📢 Nouvelle réservation reçue</h3>
//         <ul>
//           <li><strong>Nom :</strong> ${fullName}</li>
//           <li><strong>Email :</strong> ${email ?? "Non fourni"}</li>
//           <li><strong>Téléphone :</strong> ${phoneNumber}</li>
//           <li><strong>Service :</strong> ${serviceName}</li>
//           <li><strong>Date :</strong> ${formattedStart} - ${formattedEnd}</li>
//           <li><strong>Total payé :</strong> ${formatter.format(totalAmount)}</li>
//           <li><strong>Total options à bord :</strong> ${formatter.format(onboardTotal)}</li>
//           <li><strong>Repas avec traiteur :</strong> ${booking.mealOption ? "Oui" : "Non"}</li>
//         </ul>
//       </div>
//     `;

//     const adminText =
//       `Nouvelle réservation confirmée\n` +
//       `Nom: ${fullName}\n` +
//       `Email: ${email ?? "Non fourni"}\n` +
//       `Téléphone: ${phoneNumber}\n` +
//       `Service: ${serviceName}\n` +
//       `Date: ${formattedStart} - ${formattedEnd}\n` +
//       `Total payé: ${formatter.format(totalAmount)}\n` +
//       `Total options à bord: ${formatter.format(onboardTotal)}\n` +
//       `Repas avec traiteur: ${booking.mealOption ? "Oui" : "Non"}`;

//     // Envoi email admin
//     await resend.emails.send({
//       from: fromEmail,
//       to: adminEmail,
//       subject: `📌 Réservation confirmée – ${serviceName} le ${bookingDate} (#${bookingId})`,
//       html: adminEmailHtml,
//       text: adminText,
//     });

//     console.log("✅ Emails client + admin envoyés pour booking #" + bookingId);
//   } catch (error) {
//     console.error("❌ Erreur sendConfirmationEmails:", error);
//     throw new Error("Échec de l'envoi des emails de confirmation.");
//   }
// }
// import { Resend } from "resend";
// import { prisma } from "@/lib/prisma";
// import { Booking, BookingOption, Client, Service } from "@/types";

// const resend = new Resend(process.env.RESEND_API_KEY);
// const adminEmail = process.env.ADMIN_EMAIL || "gabeshine@live.fr";
// const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// type BookingWithDetails = Booking & {
//   Service: Service;
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
//       Service: {
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
//       Service: service,
//       bookingOptions,
//       totalAmount,
//       startTime,
//       endTime,
//       boatAmount,
//       mealOption,
//     } = booking;

//     const fullName = client?.fullName ?? "Client";
//     const email = client?.email;
//     const phoneNumber = client?.phoneNumber ?? "Non renseigné";
//     const currency = service.currency || "EUR";

//     const onboardTotal = bookingOptions.reduce(
//       (sum, opt) => sum + (opt.unitPrice ?? 0) * (opt.quantity ?? 0),
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

//     const serviceName = service.name;
//     const bookingDate = new Date(startTime).toLocaleDateString("fr-FR");

//     // 📧 Contenu email client (HTML)
//     const clientEmailContent = `
//       <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
//         <h2 style="color: #005ea2;">Bonjour ${fullName},</h2>
//         <p>Merci pour votre réservation de <strong>${serviceName}</strong> avec <strong>Yachting Day</strong>.</p>
//         <p><strong>Date :</strong> ${formattedStart} - ${formattedEnd}</p>
//         <p><strong>Montant payé en ligne :</strong> ${formatter.format(boatAmount)}</p>
//         <p><strong>Total à régler à bord :</strong> ${formatter.format(onboardTotal)}</p>
//         <p>Nous avons hâte de vous accueillir à bord !</p>
//         <p style="font-style: italic;">L’équipe Yachting Day</p>
//       </div>
//     `;

//     const clientTextContent =
//       `Bonjour ${fullName},\n` +
//       `Merci pour votre réservation de ${serviceName} avec Yachting Day.\n` +
//       `Date : ${formattedStart} - ${formattedEnd}\n` +
//       `Montant payé en ligne : ${formatter.format(boatAmount)}\n` +
//       `Total à régler à bord : ${formatter.format(onboardTotal)}\n` +
//       `Nous avons hâte de vous accueillir à bord !`;

//     if (email) {
//       await resend.emails.send({
//         from: fromEmail,
//         to: email,
//         subject: `✅ Confirmation - ${serviceName} le ${bookingDate}`,
//         html: clientEmailContent,
//         text: clientTextContent,
//       });
//     }

//     // 📧 Contenu email admin (HTML)
//     const adminEmailHtml = `
//       <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
//         <h3 style="color: #c0392b;">📢 Nouvelle réservation reçue</h3>
//         <ul>
//           <li><strong>Nom :</strong> ${fullName}</li>
//           <li><strong>Email :</strong> ${email ?? "Non fourni"}</li>
//           <li><strong>Téléphone :</strong> ${phoneNumber}</li>
//           <li><strong>Service :</strong> ${serviceName}</li>
//           <li><strong>Date :</strong> ${formattedStart} - ${formattedEnd}</li>
//           <li><strong>Total payé :</strong> ${formatter.format(totalAmount)}</li>
//           <li><strong>Total options à bord :</strong> ${formatter.format(onboardTotal)}</li>
//           <li><strong>Repas avec traiteur :</strong> ${mealOption ? "Oui" : "Non"}</li>
//         </ul>
//       </div>
//     `;

//     const adminText =
//       `Nouvelle réservation confirmée\n` +
//       `Nom: ${fullName}\n` +
//       `Email: ${email ?? "Non fourni"}\n` +
//       `Téléphone: ${phoneNumber}\n` +
//       `Service: ${serviceName}\n` +
//       `Date: ${formattedStart} - ${formattedEnd}\n` +
//       `Total payé: ${formatter.format(totalAmount)}\n` +
//       `Total options à bord: ${formatter.format(onboardTotal)}\n` +
//       `Repas avec traiteur: ${mealOption ? "Oui" : "Non"}`;

//     await resend.emails.send({
//       from: fromEmail,
//       to: adminEmail,
//       subject: `📌 Réservation confirmée – ${serviceName} le ${bookingDate} (#${bookingId})`,
//       html: adminEmailHtml,
//       text: adminText,
//     });

//     console.log("✅ Emails client + admin envoyés pour booking #" + bookingId);
//   } catch (error) {
//     console.error("❌ Erreur sendConfirmationEmails:", error);
//     throw new Error("Échec de l'envoi des emails de confirmation.");
//   }
// }
// import { Resend } from "resend";
// import { prisma } from "@/lib/prisma";
// import { Booking, BookingOption, Client, Service } from "@/types";

// const resend = new Resend(process.env.RESEND_API_KEY);
// const adminEmail = process.env.ADMIN_EMAIL || "gabeshine@live.fr";
// const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// type BookingWithDetails = Booking & {
//   Service: Service;
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
//       Service: {
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
//       Service: service,
//       bookingOptions,
//       totalAmount,
//       startTime,
//       endTime,
//       boatAmount,
//       mealOption,
//     } = booking;

//     const fullName = client?.fullName ?? "Client";
//     const email = client?.email;
//     const phoneNumber = client?.phoneNumber ?? "Non renseigné";
//     const currency = service.currency || "EUR";

//     const onboardTotal = bookingOptions.reduce(
//       (sum, opt) => sum + (opt.unitPrice ?? 0) * (opt.quantity ?? 0),
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

//     const serviceName = service.name;
//     const bookingDate = new Date(startTime).toLocaleDateString("fr-FR");

//     // 📧 Contenu email client (HTML)
//     const clientEmailContent = `
//       <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
//         <div style="text-align: center; margin-bottom: 30px;">
//           <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day Logo" width="180" style="max-width: 100%; height: auto; display: inline-block;">
//         </div>
//         <h2 style="color: #005ea2; text-align: center; margin-bottom: 25px;">Bonjour ${fullName},</h2>
//         <p style="margin-bottom: 15px; font-size: 16px;">
//           Merci pour votre réservation de <strong style="color: #007bff;">${serviceName}</strong> avec <strong style="color: #005ea2;">Yachting Day</strong>.
//         </p>
//         <p style="margin-bottom: 15px; font-size: 16px;">
//           Votre réservation a été confirmée ! Voici les détails :
//         </p>
//         <ul style="list-style-type: none; padding: 0; margin-bottom: 25px;">
//           <li style="margin-bottom: 8px;"><strong>Date et heure :</strong> ${formattedStart} - ${formattedEnd}</li>
//           <li style="margin-bottom: 8px;"><strong>Service réservé :</strong> ${serviceName}</li>
//           <li style="margin-bottom: 8px;"><strong>Montant réglé en ligne :</strong> <span style="color: #28a745; font-weight: bold;">${formatter.format(boatAmount)}</span></li>
//           ${onboardTotal > 0 ? `<li style="margin-bottom: 8px;"><strong>Total à régler à bord :</strong> <span style="color: #ffc107; font-weight: bold;">${formatter.format(onboardTotal)}</span></li>` : ""}
//         </ul>
//         <p style="margin-bottom: 15px; font-size: 16px;">
//           Nous avons hâte de vous accueillir à bord et vous souhaitons une excellente expérience !
//         </p>
//         <p style="font-style: italic; text-align: center; color: #666; margin-top: 30px;">
//           Cordialement,<br/>
//           L’équipe Yachting Day
//         </p>
//         <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">
//         <p style="font-size: 12px; color: #999; text-align: center;">
//           Cet e-mail est une confirmation de votre réservation.
//         </p>
//       </div>
//     `;

//     const clientTextContent =
//       `Bonjour ${fullName},\n` +
//       `Merci pour votre réservation de ${serviceName} avec Yachting Day.\n\n` +
//       `Votre réservation a été confirmée ! Voici les détails :\n` +
//       `Date et heure : ${formattedStart} - ${formattedEnd}\n` +
//       `Service réservé : ${serviceName}\n` +
//       `Montant réglé en ligne : ${formatter.format(boatAmount)}\n` +
//       `${onboardTotal > 0 ? `Total à régler à bord : ${formatter.format(onboardTotal)}\n` : ""}` +
//       `Nous avons hâte de vous accueillir à bord et vous souhaitons une excellente expérience !\n\n` +
//       `Cordialement,\n` +
//       `L’équipe Yachting Day`;

//     if (email) {
//       await resend.emails.send({
//         from: fromEmail,
//         to: email,
//         subject: `✅ Confirmation - ${serviceName} le ${bookingDate}`,
//         html: clientEmailContent,
//         text: clientTextContent,
//       });
//     }

//     // 📧 Contenu email admin (HTML)
//     const adminEmailHtml = `
//       <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f0f8ff;">
//         <div style="text-align: center; margin-bottom: 30px;">
//           <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day Logo" width="180" style="max-width: 100%; height: auto; display: inline-block;">
//         </div>
//         <h3 style="color: #c0392b; text-align: center; margin-bottom: 25px;">📢 Nouvelle réservation confirmée !</h3>
//         <ul style="list-style-type: none; padding: 0; margin-bottom: 25px;">
//           <li style="margin-bottom: 10px; padding: 8px; background-color: #e9ecef; border-radius: 4px;"><strong>Client :</strong> ${fullName}</li>
//           <li style="margin-bottom: 10px; padding: 8px; background-color: #e9ecef; border-radius: 4px;"><strong>Email :</strong> ${email ?? "Non fourni"}</li>
//           <li style="margin-bottom: 10px; padding: 8px; background-color: #e9ecef; border-radius: 4px;"><strong>Téléphone :</strong> ${phoneNumber}</li>
//           <li style="margin-bottom: 10px; padding: 8px; background-color: #e9ecef; border-radius: 4px;"><strong>Service :</strong> <span style="color: #005ea2; font-weight: bold;">${serviceName}</span></li>
//           <li style="margin-bottom: 10px; padding: 8px; background-color: #e9ecef; border-radius: 4px;"><strong>Date :</strong> ${formattedStart} - ${formattedEnd}</li>
//           <li style="margin-bottom: 10px; padding: 8px; background-color: #e9ecef; border-radius: 4px;"><strong>Total payé par le client :</strong> <span style="color: #28a745; font-weight: bold;">${formatter.format(totalAmount)}</span></li>
//           <li style="margin-bottom: 10px; padding: 8px; background-color: #e9ecef; border-radius: 4px;"><strong>Options à régler à bord :</strong> <span style="color: #ffc107; font-weight: bold;">${formatter.format(onboardTotal)}</span></li>
//           <li style="margin-bottom: 10px; padding: 8px; background-color: #e9ecef; border-radius: 4px;"><strong>Repas avec traiteur :</strong> <span style="color: ${mealOption ? "#28a745" : "#dc3545"}; font-weight: bold;">${mealOption ? "Oui" : "Non"}</span></li>
//         </ul>
//         <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
//           Veuillez consulter le panneau d'administration pour plus de détails.
//         </p>
//       </div>
//     `;

//     const adminText =
//       `Nouvelle réservation confirmée\n` +
//       `Nom: ${fullName}\n` +
//       `Email: ${email ?? "Non fourni"}\n` +
//       `Téléphone: ${phoneNumber}\n` +
//       `Service: ${serviceName}\n` +
//       `Date: ${formattedStart} - ${formattedEnd}\n` +
//       `Total payé: ${formatter.format(totalAmount)}\n` +
//       `Total options à bord: ${formatter.format(onboardTotal)}\n` +
//       `Repas avec traiteur: ${mealOption ? "Oui" : "Non"}\n\n` +
//       `Veuillez consulter le panneau d'administration pour plus de détails.`;

//     await resend.emails.send({
//       from: fromEmail,
//       to: adminEmail,
//       subject: `📌 Réservation confirmée – ${serviceName} le ${bookingDate} (#${bookingId})`,
//       html: adminEmailHtml,
//       text: adminText,
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
import { Booking, BookingOption, Client, Service, Option } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL || "gabeshine@live.fr";
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

type BookingWithAllNeededDetails = Booking & {
  Service: Service;
  bookingOptions: (BookingOption & { option: Option })[];
  client: Client | null;
};

export async function sendConfirmationEmails(bookingId: number) {
  try {
    const rawBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Service: true,
        bookingOptions: {
          include: { option: true },
        },
        client: true,
      },
    });

    if (!rawBooking || !rawBooking.Service) {
      throw new Error("❌ Réservation ou service manquant.");
    }

    const booking = rawBooking as BookingWithAllNeededDetails;

    const {
      client,
      Service: service,
      bookingOptions,
      totalAmount,
      startTime,
      endTime,
      boatAmount,
      mealOption,
    } = booking;

    const fullName = client?.fullName ?? "Client";
    const email = client?.email;
    const phoneNumber = client?.phoneNumber ?? "Non renseigné";
    const currency = service.currency || "EUR";

    const formatter = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
    });

    // Calcul du total des options à régler à bord
    const onboardTotal = bookingOptions.reduce((sum, opt) => {
      if (opt.option?.payableAtBoard) {
        return sum + (opt.option.unitPrice ?? 0) * (opt.quantity ?? 0);
      }
      return sum;
    }, 0);

    const formattedStart = new Date(startTime).toLocaleString("fr-FR", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const formattedEnd = new Date(endTime).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const serviceName = service.name;

    // Détail des options sous forme de liste HTML
    const optionsHtmlList = bookingOptions
      .map((opt) => {
        const qty = opt.quantity ?? 1;
        const pricePerUnit = opt.option?.unitPrice ?? 0;
        const totalPrice = pricePerUnit * qty;
        const name = opt.option?.name ?? "Option inconnue";
        if (totalPrice === 0) return null; // on exclut les options gratuites
        return `<li>${qty} × ${name} — ${formatter.format(totalPrice)}</li>`;
      })
      .filter(Boolean)
      .join("");

    const optionsHtml = optionsHtmlList
      ? `<ul style="padding-left: 20px; margin-bottom: 25px;">${optionsHtmlList}</ul>`
      : "<p>Aucune option sélectionnée.</p>";

    // Contenu HTML email client
    const clientEmailContent = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day Logo" width="180" style="max-width: 100%; height: auto;">
        </div>
        <h2 style="color: #005ea2; text-align: center; margin-bottom: 25px;">Bonjour ${fullName},</h2>
        <p style="font-size: 16px;">
          Merci pour votre réservation de <strong style="color: #007bff;">${serviceName}</strong> avec <strong style="color: #005ea2;">Yachting Day</strong>.
        </p>
        <p style="font-size: 16px;">
          Votre réservation a été confirmée ! Voici les détails :
        </p>
        <ul style="list-style-type: none; padding: 0; margin-bottom: 25px;">
          <li><strong>Date et heure :</strong> ${formattedStart} - ${formattedEnd}</li>
          <li><strong>Service réservé :</strong> ${serviceName}</li>
          <li><strong>Montant réglé en ligne :</strong> <span style="color: #28a745; font-weight: bold;">${formatter.format(boatAmount)}</span></li>
          ${
            onboardTotal > 0
              ? `<li><strong>Total à régler à bord :</strong> <span style="color: #ffc107; font-weight: bold;">${formatter.format(onboardTotal)}</span></li>`
              : ""
          }
        </ul>
        <p style="font-size: 16px; font-weight: bold;">Options sélectionnées :</p>
        ${optionsHtml}
        <p style="font-size: 16px;">
          Nous avons hâte de vous accueillir à bord et vous souhaitons une excellente expérience !
        </p>
        <p style="font-style: italic; text-align: center; color: #666; margin-top: 30px;">
          Cordialement,<br/>
          L’équipe Yachting Day
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          Cet e-mail est une confirmation de votre réservation.
        </p>
      </div>
    `;

    const clientTextContent =
      `Bonjour ${fullName},\n` +
      `Merci pour votre réservation de ${serviceName} avec Yachting Day.\n\n` +
      `Votre réservation a été confirmée ! Voici les détails :\n` +
      `Date et heure : ${formattedStart} - ${formattedEnd}\n` +
      `Service réservé : ${serviceName}\n` +
      `Montant réglé en ligne : ${formatter.format(boatAmount)}\n` +
      (onboardTotal > 0
        ? `Total à régler à bord : ${formatter.format(onboardTotal)}\n`
        : "") +
      `Options sélectionnées:\n` +
      bookingOptions
        .map((opt) => {
          const qty = opt.quantity ?? 1;
          const pricePerUnit = opt.option?.unitPrice ?? 0;
          const totalPrice = pricePerUnit * qty;
          const name = opt.option?.name ?? "Option inconnue";
          if (totalPrice === 0) return null;
          return ` - ${qty} × ${name} — ${formatter.format(totalPrice)}`;
        })
        .filter(Boolean)
        .join("\n") +
      `\n\nNous avons hâte de vous accueillir à bord et vous souhaitons une excellente expérience !\n\n` +
      `Cordialement,\n` +
      `L’équipe Yachting Day`;

    if (email) {
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `✅ Confirmation - ${serviceName} le ${new Date(startTime).toLocaleDateString("fr-FR")}`,
        html: clientEmailContent,
        text: clientTextContent,
      });
    }

    // Email admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f0f8ff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day Logo" width="180" style="max-width: 100%; height: auto;">
        </div>
        <h3 style="color: #c0392b; text-align: center; margin-bottom: 25px;">📢 Nouvelle réservation confirmée !</h3>
        <ul style="list-style-type: none; padding: 0; margin-bottom: 25px;">
          <li><strong>Client :</strong> ${fullName}</li>
          <li><strong>Email :</strong> ${email ?? "Non fourni"}</li>
          <li><strong>Téléphone :</strong> ${phoneNumber}</li>
          <li><strong>Service :</strong> <span style="color: #005ea2; font-weight: bold;">${serviceName}</span></li>
          <li><strong>Date :</strong> ${formattedStart} - ${formattedEnd}</li>
          <li><strong>Total payé par le client :</strong> <span style="color: #28a745; font-weight: bold;">${formatter.format(totalAmount)}</span></li>
          <li><strong>Options à régler à bord :</strong> <span style="color: #ffc107; font-weight: bold;">${formatter.format(onboardTotal)}</span></li>
          <li><strong>Repas avec traiteur :</strong> <span style="color: ${mealOption ? "#28a745" : "#dc3545"}; font-weight: bold;">${mealOption ? "Oui" : "Non"}</span></li>
        </ul>
        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
          Veuillez consulter le panneau d'administration pour plus de détails.
        </p>
      </div>
    `;

    const adminText =
      `Nouvelle réservation confirmée\n` +
      `Nom: ${fullName}\n` +
      `Email: ${email ?? "Non fourni"}\n` +
      `Téléphone: ${phoneNumber}\n` +
      `Service: ${serviceName}\n` +
      `Date: ${formattedStart} - ${formattedEnd}\n` +
      `Total payé: ${formatter.format(totalAmount)}\n` +
      `Total options à bord: ${formatter.format(onboardTotal)}\n` +
      `Repas avec traiteur: ${mealOption ? "Oui" : "Non"}\n\n` +
      `Veuillez consulter le panneau d'administration pour plus de détails.`;

    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `📌 Réservation confirmée – ${serviceName} le ${new Date(startTime).toLocaleDateString("fr-FR")} (#${bookingId})`,
      html: adminEmailHtml,
      text: adminText,
    });

    console.log("✅ Emails client + admin envoyés pour booking #" + bookingId);
  } catch (error) {
    console.error("❌ Erreur sendConfirmationEmails:", error);
    throw new Error("Échec de l'envoi des emails de confirmation.");
  }
}
