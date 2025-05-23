//En résumé, cette route API sert d'intermédiaire entre le frontend et le backend
// //pour déclencher l'envoi d'un email à l'administrateur avec les détails de la réservation.
// Elle valide les données, construit le contenu de l'email et utilise Resend pour l'envoyer.

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
  bookingOptions?: {
    quantity: number;
    option: {
      unitPrice: number;
      label: string;
      payableAtBoard: boolean;
    };
  }[];
  withCaptain?: boolean;
  mealOption?: boolean;
  boatAmount?: number;
  service?: { name: string; currency?: string };
}

const safe = (val?: string | null, fallback = "—") => val ?? fallback;

async function sendEmailToAdmin(params: SendEmailToAdminParams) {
  if (!adminEmail) {
    console.error("❌ ADMIN_EMAIL n'est pas défini.");
    throw new Error("ADMIN_EMAIL manquant dans l'environnement.");
  }

  const fullName = `${safe(params.firstName)} ${safe(params.lastName)}`;
  const subject = `🛥️ Réservation à confirmer par Yachting Day #${params.bookingId}`;

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <h2 style="color: #1a73e8;">Nouvelle demande de réservation</h2>
        <p>Ci-joint le lien de paiement :</p>
        <table cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse;">
          <tr><td><strong>ID Réservation :</strong></td><td>${params.bookingId}</td></tr>
          <tr><td><strong>Nom :</strong></td><td>${fullName}</td></tr>
          <tr><td><strong>Email :</strong></td><td>${safe(params.email)}</td></tr>
          <tr><td><strong>Téléphone :</strong></td><td>${safe(params.phoneNumber)}</td></tr>
          <tr><td><strong>Date & heure :</strong></td><td>${safe(params.reservationTime)}</td></tr>
          ${
            params.stripeUrl
              ? `<tr><td><strong>Lien de paiement :</strong></td><td><a href="${params.stripeUrl}">${params.stripeUrl}</a></td></tr>`
              : ""
          }
          ${
            params.service?.name
              ? `<tr><td><strong>Service :</strong></td><td>${params.service.name}</td></tr>`
              : ""
          }
          ${
            typeof params.boatAmount === "number"
              ? `<tr><td><strong>Montant bateau :</strong></td><td>${params.boatAmount} €</td></tr>`
              : ""
          }
          <tr><td><strong>Capitaine :</strong></td><td>${params.withCaptain ? "Oui" : "Non"}</td></tr>
          <tr><td><strong>Option repas :</strong></td><td>${params.mealOption ? "Oui" : "Non"}</td></tr>
          ${
            params.bookingOptions?.length
              ? `<tr><td colspan="2">
                  <strong>Options sélectionnées :</strong>
                  <ul>
                    ${params.bookingOptions
                      .map(
                        (opt) =>
                          `<li>${opt.option.label} x ${opt.quantity} - ${opt.option.unitPrice}€ (à bord: ${
                            opt.option.payableAtBoard ? "oui" : "non"
                          })</li>`
                      )
                      .join("")}
                  </ul>
                </td></tr>`
              : ""
          }
        </table>
        <p style="margin-top: 20px;">Merci de confirmer rapidement cette demande.</p>
      </body>
    </html>
  `;

  const text = `
Nouvelle demande de réservation :

- ID Réservation : ${params.bookingId}
- Nom : ${fullName}
- Email : ${safe(params.email)}
- Téléphone : ${safe(params.phoneNumber)}
- Date & heure : ${safe(params.reservationTime)}
${params.stripeUrl ? `- Lien de paiement : ${params.stripeUrl}` : ""}
${params.service?.name ? `- Service : ${params.service.name}` : ""}
${typeof params.boatAmount === "number" ? `- Montant bateau : ${params.boatAmount} €` : ""}
- Capitaine : ${params.withCaptain ? "Oui" : "Non"}
- Option repas : ${params.mealOption ? "Oui" : "Non"}
${
  params.bookingOptions?.length
    ? `- Options :\n${params.bookingOptions
        .map(
          (opt) =>
            `  • ${opt.option.label} x ${opt.quantity} - ${opt.option.unitPrice}€ (à bord: ${
              opt.option.payableAtBoard ? "oui" : "non"
            })`
        )
        .join("\n")}`
    : ""
}
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

export async function POST(request: Request) {
  try {
    const body: SendEmailToAdminParams = await request.json();

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

    await sendEmailToAdmin(body);

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
