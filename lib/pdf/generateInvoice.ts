import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { BookingWithDetails } from "@/types";

export async function generateInvoice(
  booking: BookingWithDetails
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y: number;

  // Chargement et dessin du logo
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const logoUrl = `${baseUrl}/assets/logo/logo-new.png`;

  try {
    const logoResponse = await fetch(logoUrl);
    if (!logoResponse.ok) {
      console.warn(`⚠️ Échec du chargement du logo : ${logoResponse.status}`);
      y = height - 50;
    } else {
      const logoBytes = await logoResponse.arrayBuffer();
      const logoImage = await pdfDoc.embedPng(logoBytes);
      const scale = 0.2; // Ajuste la taille du logo ici
      const logoDims = logoImage.scale(scale);

      const logoX = 50;
      const logoY = height - 30 - logoDims.height; // Descend le logo un peu plus bas

      page.drawImage(logoImage, {
        x: logoX,
        y: logoY,
        width: logoDims.width,
        height: logoDims.height,
      });

      y = logoY - 20; // Position de départ pour le texte, juste en dessous du logo
    }
  } catch (error) {
    console.error("Erreur lors du chargement du logo :", error);
    y = height - 50;
  }

  const drawText = (text: string, x: number, y: number, size = 12) => {
    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  drawText("FACTURE - Yachting Day", 50, y, 20);
  y -= 30;
  drawText(`Date : ${new Date().toLocaleDateString("fr-FR")}`, 50, y);
  y -= 20;
  drawText(`Réservation #${booking.id}`, 50, y);
  y -= 30;

  drawText(`Client : ${booking.client.fullName}`, 50, y);
  y -= 20;
  drawText(`Email : ${booking.client.email}`, 50, y);
  y -= 30;

  drawText(`Service réservé : ${booking.service.name}`, 50, y);
  y -= 20;

  drawText(
    `Montant payé en ligne (bateau) : ${booking.boatAmount.toFixed(2)} €`,
    50,
    y
  );
  y -= 30;

  drawText("Options à régler à bord :", 50, y);
  y -= 20;

  const optionsPayableAtBoard = booking.bookingOptions.filter(
    (bo) => bo.option?.payableAtBoard
  );

  let totalOptionsPayableAtBoard = 0;

  if (optionsPayableAtBoard.length === 0) {
    drawText("Aucune option sélectionnée.", 60, y);
    y -= 20;
  } else {
    for (const bo of optionsPayableAtBoard) {
      const label = bo.option?.label || "Option";
      const qty = bo.quantity || 1;
      const unit = bo.option?.unitPrice || 0;
      const total = unit * qty;
      totalOptionsPayableAtBoard += total;
      drawText(`- ${label} x${qty} : ${total.toFixed(2)} €`, 60, y);
      y -= 20;
    }
  }

  // const needsCaptain = !booking.withCaptain;
  // const captainPrice = 350;
  const needsCaptain = !booking.withCaptain && booking.service?.requiresCaptain;
  const captainPrice = needsCaptain
    ? (booking.service?.captainPrice ?? 350)
    : 0;
  if (needsCaptain) {
    drawText(`- Capitaine à bord : ${captainPrice.toFixed(2)} €`, 60, y);
    y -= 20;
  }

  const finalPayableOnBoard =
    totalOptionsPayableAtBoard + (needsCaptain ? captainPrice : 0);
  y -= 10;

  drawText(
    `Total à régler à bord : ${finalPayableOnBoard.toFixed(2)} €`,
    50,
    y
  );
  y -= 40;

  drawText("Merci pour votre réservation avec Yachting Day !", 50, y);

  return await pdfDoc.save();
}
