// En résumé, cette route API est utilisée pour envoyer un email de confirmation au client
// après qu'il a soumis une demande de réservation.
// 2.  POST /api/bookings/send-request-confirmation

//Status Code : 405 Method Not Allowed

//Problème : Cette requête a échoué car la méthode HTTP utilisée (POST) n'est pas autorisée pour cette route. D'après le code de l'API que tu as fourni, cette route devrait être accessible via GET, et non POST.

//Action à prendre : Modifier la requête pour utiliser la méthode GET au lieu de POST.
// app/api/send-request-confirmation/route.ts
// import { NextResponse } from "next/server";
// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);
// const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// export async function POST(req: Request) {
//   try {
//     const { bookingId, clientEmail, clientName } = await req.json();

//     if (!bookingId || !clientEmail || !clientName) {
//       return NextResponse.json(
//         { error: "bookingId, clientEmail et clientName manquants" },
//         { status: 400 }
//       );
//     }
//     if (!clientEmail.includes("@")) {
//       return NextResponse.json(
//         { error: "Email client invalide." },
//         { status: 400 }
//       );
//     }
//     const subject = `Votre demande de réservation #${bookingId} a bien été reçue !`;
//     const html = `
//       <h2>Bonjour ${clientName},</h2>
//       <p>Nous avons bien reçu votre demande de réservation #${bookingId}.</p>
//       <p>Elle est en cours de traitement par notre équipe. Nous vous informerons par email de la confirmation de votre réservation et vous enverrons un lien de paiement si tout est validé.</p>
//       <p>Merci pour votre patience.</p>
//       <p>Cordialement,<br/>L'équipe Yachting Day</p>
//     `;

//     const data = await resend.emails.send({
//       from: fromEmail,
//       to: clientEmail,
//       subject: subject,
//       html: html,
//     });

//     return NextResponse.json({ success: true, data });
//   } catch (error) {
//     console.error(
//       "Erreur lors de l'envoi de l'email de confirmation de réception :",
//       error
//     );
//     return NextResponse.json(
//       { error: "Erreur interne lors de l'envoi de l'email" },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export async function POST(req: Request) {
  try {
    const { bookingId, clientEmail, clientName } = await req.json();

    if (!bookingId || !clientEmail || !clientName) {
      return NextResponse.json(
        { error: "bookingId, clientEmail et clientName manquants" },
        { status: 400 }
      );
    }
    if (!clientEmail.includes("@")) {
      return NextResponse.json(
        { error: "Email client invalide." },
        { status: 400 }
      );
    }

    const subject = `Votre demande de réservation #${bookingId} a bien été reçue !`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day" width="180" style="display: block; margin: 0 auto 30px; max-width: 100%; height: auto;" />
        <h2 style="color: #0056b3; text-align: center; margin-bottom: 25px;">Bonjour ${clientName},</h2>
        <p style="margin-bottom: 15px; font-size: 16px;">Nous avons bien reçu votre demande de réservation <strong style="color: #007bff;">#${bookingId}</strong>.</p>
        <p style="margin-bottom: 15px; font-size: 16px;">Elle est en cours de traitement par notre équipe. Nous vous informerons par email de la confirmation de votre réservation et vous enverrons un lien de paiement si tout est validé.</p>
        <p style="margin-bottom: 25px; font-size: 16px;">Merci pour votre patience.</p>
        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
          Cordialement,<br/>
          <strong style="color: #0056b3;">L'équipe Yachting Day</strong>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">Cet e-mail est une confirmation de réception. Veuillez ne pas y répondre.</p>
      </div>
    `;

    const data = await resend.emails.send({
      from: fromEmail,
      to: clientEmail,
      subject: subject,
      html: html,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de l'email de confirmation de réception :",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
