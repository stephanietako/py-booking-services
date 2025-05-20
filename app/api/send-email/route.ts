//Ce fichier fournit une route API réutilisable pour envoyer des emails.  Au lieu d'intégrer la logique d'envoi d'email directement dans chaque partie de l'application qui en a besoin, ces parties peuvent simplement faire une requête POST à /api/send-email avec les détails de l'email.
// Cela centralise la logique d'envoi d'email et facilite la maintenance du code.

// app/api/send-email/route.ts
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
export async function POST(req: Request) {
  try {
    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      text: body,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Erreur d'envoi email:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
