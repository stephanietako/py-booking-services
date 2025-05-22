//En résumé, cette route API sert d'intermédiaire entre le frontend et le backend
// //pour déclencher l'envoi d'un email à l'administrateur avec les détails de la réservation.
// Elle valide les données, construit le contenu de l'email et utilise Resend pour l'envoyer.
// app/api/admin/bookings/sendReservationDetails/route.ts

// import { NextResponse } from "next/server";
// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);
// const adminEmail = process.env.ADMIN_EMAIL;
// const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// interface SendEmailToAdminParams {
//   bookingId: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   reservationTime: string;
//   stripeUrl?: string;
// }

// // Fonction pour envoyer un email à l'admin
// async function sendEmailToAdmin({
//   bookingId,
//   firstName,
//   lastName,
//   email,
//   phoneNumber,
//   reservationTime,
//   stripeUrl,
// }: SendEmailToAdminParams) {
//   if (!adminEmail) {
//     console.error("❌ ADMIN_EMAIL n'est pas défini.");
//     throw new Error("Configuration invalide : ADMIN_EMAIL manquant.");
//   }

//   try {
//     const subject = `Nouvelle demande de confirmation #${bookingId}`;

//     // Structure de l'email en HTML
//     const html = `
//       <h3>Nouvelle demande de confirmation</h3>
//       <p>Un utilisateur a demandé une confirmation de réservation.</p>
//       <table>
//         <tr><td><strong>ID Réservation:</strong></td><td>${bookingId}</td></tr>
//         <tr><td><strong>Nom:</strong></td><td>${firstName} ${lastName}</td></tr>
//         <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
//         <tr><td><strong>Téléphone:</strong></td><td>${phoneNumber}</td></tr>
//         <tr><td><strong>Date et heure:</strong></td><td>${reservationTime}</td></tr>
//       </table>
//        ${
//          stripeUrl
//            ? `<p><strong>Lien de paiement :</strong> <a href="${stripeUrl}" target="_blank">${stripeUrl}</a></p>`
//            : ""
//        }
//       <p>Merci de confirmer la réservation.</p>
//     `;

//     // Envoi de l'email en HTML
//     await resend.emails.send({
//       from: fromEmail,
//       to: adminEmail,
//       subject,
//       html,
//     });

//     console.log("📩 Email envoyé à l'admin !");
//   } catch (error) {
//     console.error("❌ Erreur lors de l'envoi de l'email :", error);
//     throw new Error("Échec de l'envoi de l'email.");
//   }
// }

// // Route POST pour déclencher l'envoi de l'email
// export async function POST(request: Request) {
//   try {
//     const body: SendEmailToAdminParams = await request.json();
//     await sendEmailToAdmin(body);

//     // 👇 Appel à /send-invoice après l'envoi de l'email
//     await fetch(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/bookings/send-invoice`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           bookingId: body.bookingId,
//           sendToClient: false, // 👈 seulement à l'admin
//         }),
//       }
//     );

//     // ✅ Puis on retourne la réponse au client
//     return NextResponse.json(
//       { message: "Email et facture envoyés à l'admin avec succès !" },
//       { status: 200 }
//     );
//   } catch (error: unknown) {
//     console.error(
//       "Erreur lors de la réception et du traitement de la requête :",
//       error
//     );
//     let errorMessage = "Une erreur inconnue est survenue.";
//     if (error instanceof Error) {
//       errorMessage = error.message;
//     } else if (
//       typeof error === "object" &&
//       error !== null &&
//       "message" in error &&
//       typeof error.message === "string"
//     ) {
//       errorMessage = error.message;
//     }
//     return NextResponse.json({ error: errorMessage }, { status: 500 });
//   }
// }
// app/api/admin/bookings/sendReservationDetails/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL;
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

interface SendEmailToAdminParams {
  bookingId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  reservationTime: string;
  stripeUrl?: string;
}

// ✅ Helper pour fallback texte
const safe = (val?: string | null, fallback = "—") => val ?? fallback;

// ✅ Fonction pour envoyer un email à l'admin
async function sendEmailToAdmin({
  bookingId,
  firstName,
  lastName,
  email,
  phoneNumber,
  reservationTime,
  stripeUrl,
}: SendEmailToAdminParams) {
  if (!adminEmail) {
    console.error("❌ ADMIN_EMAIL n'est pas défini.");
    throw new Error("ADMIN_EMAIL manquant dans l'environnement.");
  }

  const fullName = `${safe(firstName)} ${safe(lastName)}`;
  const subject = `🛥️ Réservation à confirmer par Yachting Day #${bookingId}`;
  // centrer le style
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <h2 style="color: #1a73e8;">Nouvelle demande de réservation</h2>
        <p> ci-joint le lien de paiement :</p>
        <table cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse;">
          <tr><td><strong>ID Réservation :</strong></td><td>${bookingId}</td></tr>
          <tr><td><strong>Nom :</strong></td><td>${fullName}</td></tr>
          <tr><td><strong>Email :</strong></td><td>${safe(email)}</td></tr>
          <tr><td><strong>Téléphone :</strong></td><td>${safe(phoneNumber)}</td></tr>
          <tr><td><strong>Date & heure :</strong></td><td>${safe(reservationTime)}</td></tr>
          ${
            stripeUrl
              ? `<tr><td><strong>Lien de paiement :</strong></td><td><a href="${stripeUrl}">${stripeUrl}</a></td></tr>`
              : ""
          }
        </table>
        <p style="margin-top: 20px;">Merci de confirmer rapidement cette demande.</p>
      </body>
    </html>
  `;

  const text = `
Nouvelle demande de réservation :

- ID Réservation : ${bookingId}
- Nom : ${fullName}
- Email : ${safe(email)}
- Téléphone : ${safe(phoneNumber)}
- Date & heure : ${safe(reservationTime)}
${stripeUrl ? `- Lien de paiement : ${stripeUrl}` : ""}
  `;

  const response = await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject,
    html,
    text,
  });

  console.log("📩 Email envoyé à l'admin :", response.data?.id || "sans ID");
}

// ✅ Route API POST
export async function POST(request: Request) {
  try {
    const body: SendEmailToAdminParams = await request.json();

    // Vérification des champs nécessaires
    const requiredFields = [
      "bookingId",
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "reservationTime",
    ];
    for (const field of requiredFields) {
      if (!body[field as keyof SendEmailToAdminParams]) {
        return NextResponse.json(
          { error: `Champ manquant : ${field}` },
          { status: 400 }
        );
      }
    }

    // Envoi de l'email
    await sendEmailToAdmin(body);

    // Appel de l'envoi de facture
    const invoiceResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/bookings/send-invoice`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: body.bookingId,
          sendToClient: false,
        }),
      }
    );

    if (!invoiceResponse.ok) {
      console.warn(
        "⚠️ Facture non envoyée correctement :",
        await invoiceResponse.text()
      );
    }

    return NextResponse.json(
      { message: "Email et facture envoyés à l'admin avec succès !" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("❌ Erreur dans sendReservationDetails:", error);

    let message = "Erreur interne";
    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
