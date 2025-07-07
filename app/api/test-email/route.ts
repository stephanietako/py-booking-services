import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    await resend.emails.send({
      from: "support@yachting-day.com",
      to: "yachtingday@gmail.com", // Remplace par ton adresse email ici
      subject: "Test d'envoi email Resend via API",
      html: "<p>Salut ! Ceci est un email test envoyé via Resend avec ta clé de prod.</p>",
    });
    return NextResponse.json({ message: "Email envoyé avec succès !" });
  } catch (error) {
    console.error("Erreur envoi test email:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
