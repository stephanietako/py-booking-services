// En résumé, cette route API est utilisée pour envoyer un email de confirmation au client
// après qu'il a soumis une demande de réservation.
// 2.  POST /api/bookings/send-request-confirmation

//Status Code : 405 Method Not Allowed

//Problème : Cette requête a échoué car la méthode HTTP utilisée (POST) n'est pas autorisée pour cette route. D'après le code de l'API que tu as fourni, cette route devrait être accessible via GET, et non POST.

//Action à prendre : Modifier la requête pour utiliser la méthode GET au lieu de POST.
// app/api/send-request-confirmation/route.ts
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
      <h2>Bonjour ${clientName},</h2>
      <p>Nous avons bien reçu votre demande de réservation #${bookingId}.</p>
      <p>Elle est en cours de traitement par notre équipe. Nous vous informerons par email de la confirmation de votre réservation et vous enverrons un lien de paiement si tout est validé.</p>
      <p>Merci pour votre patience.</p>
      <p>Cordialement,<br/>L'équipe Yachting Day</p>
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
