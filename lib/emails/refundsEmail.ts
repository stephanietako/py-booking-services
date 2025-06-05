export function refundEmailTemplate(
  clientName: string,
  bookingId: number,
  serviceName?: string
) {
  return `
      <div style="font-family: Arial, sans-serif; color: #333;">
         <div style="text-align: center; margin-bottom: 30px;">
      <img src="http://localhost:3000/assets/logo/logo-new.png" alt="Yachting Day Logo" width="180" style="max-width: 100%; height: auto;">
    </div>
      <h2 style="color: #005ea2;">Remboursement effectué</h2>
        <p>Bonjour <strong>${clientName}</strong>,</p>
        <p>Nous vous confirmons le remboursement de votre réservation <strong>#${bookingId}</strong> pour le service <strong>${serviceName ?? ""}</strong>.</p>
        <p>Le montant remboursé sera visible sur votre compte bancaire sous quelques jours.</p>
        <p style="margin-top: 20px; color: #666;">Cordialement,<br/>L'équipe Yachting Day</p>
      </div>
    `;
}
