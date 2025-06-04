// lib/email/send.ts
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export interface EmailAttachment {
  filename: string;
  content: string;
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachments,
}: SendEmailParams) {
  try {
    return await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text: text ?? "",
      attachments,
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi d'email:", error);
    throw new Error("Erreur lors de l'envoi de l'email.");
  }
}
