// lib/email/send.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
// Utiliser une adresse de votre domaine comme fallback pour 'from'
const fromEmail = process.env.RESEND_FROM_EMAIL || "support@yachting-day.com";
// Ajouter l'adresse Gmail pour les réponses comme fallback pour 'replyTo'
const replyToEmail =
  process.env.GMAIL_REPLY_TO_EMAIL || "yachtingday@gmail.com";

export interface EmailAttachment {
  filename: string;
  content: string;
  contentType?: string; // Ajouter contentType si les attachements peuvent varier
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  // Permettre de spécifier un replyTo spécifique si besoin, sinon utiliser le défaut
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachments,
  replyTo,
}: SendEmailParams) {
  try {
    return await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text: text ?? "",
      attachments,
      replyTo: replyTo || replyToEmail, // Utiliser le replyTo passé en paramètre ou le défaut
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi d'email:", error);
    throw new Error("Erreur lors de l'envoi de l'email.");
  }
}
