// app/api/test-send-email/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { toEmail } = await req.json();

    if (!toEmail) {
      return NextResponse.json(
        { error: "Email destinataire manquant" },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: toEmail,
      subject: "Test d'envoi email Resend",
      html: "<h1>Ceci est un test d'email depuis Resend 🎉</h1><p>Si vous recevez ce message, tout fonctionne !</p>",
    });

    return NextResponse.json({ message: "Email envoyé avec succès !" });
  } catch (error) {
    console.error("Erreur test-send-email:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi" },
      { status: 500 }
    );
  }
}
