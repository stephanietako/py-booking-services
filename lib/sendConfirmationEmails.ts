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
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
// Importez tous vos types depuis votre fichier types/index.ts (ou le chemin approprié)
import { Booking, BookingOption, Client, Service, Option } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL || "gabeshine@live.fr";
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// Définissez un type d'aide pour la réservation avec toutes les inclusions nécessaires
// C'est la structure que Prisma va retourner avec les includes que nous allons faire.
type BookingWithAllNeededDetails = Booking & {
  Service: Service;
  bookingOptions: (BookingOption & { option: Option })[]; // <-- ici nous nous assurons que 'option' est bien là
  client: Client | null;
};

export async function sendConfirmationEmails(bookingId: number) {
  try {
    const rawBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Service: true,
        bookingOptions: {
          include: {
            option: true, // <-- LE CHANGEMENT CLÉ EST ICI : Inclure le modèle Option
          },
        },
        client: true,
        // Si aussi besoin de l'utilisateur pour l'e-mail admin, ajoutez :
        // user: true,
      },
    });

    if (!rawBooking || !rawBooking.Service) {
      throw new Error("❌ Réservation ou service manquant.");
    }

    // Caster la réservation récupérée vers le type étendu.
    //  ici car Prisma a inclus 'option' dans bookingOptions.
    const booking: BookingWithAllNeededDetails =
      rawBooking as BookingWithAllNeededDetails;

    const {
      client,
      Service: service,
      bookingOptions, // Ce bookingOptions contient maintenant les détails de 'option'
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

    // --- CALCUL CORRIGÉ DU ONBOARDTOTAL ---
    // Maintenant, chaque 'opt' dans 'bookingOptions' aura 'opt.option.payableAtBoard'
    const onboardTotal = bookingOptions.reduce((sum, opt) => {
      // Condition pour inclure le montant de l'option SEULEMENT si elle est payableAtBoard
      if (opt.option?.payableAtBoard) {
        // Utilisez 'opt.option?' au cas où 'option' serait indéfini pour une raison quelconque
        return sum + (opt.unitPrice ?? 0) * (opt.quantity ?? 0);
      }
      return sum;
    }, 0);

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

    const serviceName = service.name;
    const bookingDate = new Date(startTime).toLocaleDateString("fr-FR");
    // !!! Devrait arriver tout à la fin après le paiement par le lien envoyé par l'administrateur !!!
    // 📧 Contenu email client (HTML)
    const clientEmailContent = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day Logo" width="180" style="max-width: 100%; height: auto; display: inline-block;">
        </div>
        <h2 style="color: #005ea2; text-align: center; margin-bottom: 25px;">Bonjour ${fullName},</h2>
        <p style="margin-bottom: 15px; font-size: 16px;">
          Merci pour votre réservation de <strong style="color: #007bff;">${serviceName}</strong> avec <strong style="color: #005ea2;">Yachting Day</strong>.
        </p>
        <p style="margin-bottom: 15px; font-size: 16px;">
          Votre réservation a été confirmée ! Voici les détails :
        </p>
        <ul style="list-style-type: none; padding: 0; margin-bottom: 25px;">
          <li style="margin-bottom: 8px;"><strong>Date et heure :</strong> ${formattedStart} - ${formattedEnd}</li>
          <li style="margin-bottom: 8px;"><strong>Service réservé :</strong> ${serviceName}</li>
          <li style="margin-bottom: 8px;"><strong>Montant réglé en ligne :</strong> <span style="color: #28a745; font-weight: bold;">${formatter.format(boatAmount)}</span></li>
          ${
            onboardTotal > 0
              ? `<li style="margin-bottom: 8px;"><strong>Total à régler à bord :</strong> <span style="color: #ffc107; font-weight: bold;">${formatter.format(onboardTotal)}</span></li>`
              : ""
          }
        </ul>
        <p style="margin-bottom: 15px; font-size: 16px;">
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
      `${
        onboardTotal > 0
          ? `Total à régler à bord : ${formatter.format(onboardTotal)}\n`
          : ""
      }` +
      `Nous avons hâte de vous accueillir à bord et vous souhaitons une excellente expérience !\n\n` +
      `Cordialement,\n` +
      `L’équipe Yachting Day`;

    if (email) {
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `✅ Confirmation - ${serviceName} le ${bookingDate}`,
        html: clientEmailContent,
        text: clientTextContent,
      });
    }

    // 📧 Contenu email admin (HTML)
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f0f8ff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day Logo" width="180" style="max-width: 100%; height: auto; display: inline-block;">
        </div>
        <h3 style="color: #c0392b; text-align: center; margin-bottom: 25px;">📢 Nouvelle réservation confirmée !</h3>
        <ul style="list-style-type: none; padding: 0; margin-bottom: 25px;">
          <li style="margin-bottom: 10px; padding: 8px; background-color: #e9ecef; border-radius: 4px;"><strong>Client :</strong> ${fullName}</li>
          <li style="margin-bottom: 10px; padding: 8px; background-color: #e9ecef; border-radius: 4px;"><strong>Email :</strong> ${email ?? "Non fourni"}</li>
          <li style="margin-bottom: 10px; padding: 8px; background-color: #e9ecef; border-radius: 4px;"><strong>Téléphone :</strong> ${phoneNumber}</li>
          <li style="margin-bottom: 10px; padding: 8px; background-color: #e9ecef; border-radius: 4px;"><strong>Service :</strong> <span style="color: #005ea2; font-weight: bold;">${serviceName}</span></li>
          <li style="margin-bottom: 10px; padding: 8px; background-color: #e9ecef; border-radius: 4px;"><strong>Date :</strong> ${formattedStart} - ${formattedEnd}</li>
          <li style="margin-bottom: 10px; padding: 8px; background-color: #e9ecef; border-radius: 4px;"><strong>Total payé par le client :</strong> <span style="color: #28a745; font-weight: bold;">${formatter.format(totalAmount)}</span></li>
          <li style="margin-bottom: 10px; padding: 8px; background-color: #e9ecef; border-radius: 4px;"><strong>Options à régler à bord :</strong> <span style="color: #ffc107; font-weight: bold;">${formatter.format(onboardTotal)}</span></li>
          <li style="margin-bottom: 10px; padding: 8px; background-color: #e9ecef; border-radius: 4px;"><strong>Repas avec traiteur :</strong> <span style="color: ${mealOption ? "#28a745" : "#dc3545"}; font-weight: bold;">${mealOption ? "Oui" : "Non"}</span></li>
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
      subject: `📌 Réservation confirmée – ${serviceName} le ${bookingDate} (#${bookingId})`,
      html: adminEmailHtml,
      text: adminText,
    });

    console.log("✅ Emails client + admin envoyés pour booking #" + bookingId);
  } catch (error) {
    console.error("❌ Erreur sendConfirmationEmails:", error);
    throw new Error("Échec de l'envoi des emails de confirmation.");
  }
}
