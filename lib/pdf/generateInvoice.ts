// lib/pdf/generateInvoice.ts

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Booking } from "@/types";

export async function generateInvoice(booking: Booking): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 750]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { width, height } = page.getSize();

  const drawText = (text: string, x: number, y: number, size = 12) => {
    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  let y = height - 50;

  drawText("🧾 Facture de Réservation", 50, y, 20);
  y -= 40;

  drawText(`ID Réservation : ${booking.id}`, 50, y);
  y -= 20;
  drawText(
    `Date : ${new Date(booking.createdAt).toLocaleDateString("fr-FR")}`,
    50,
    y
  );
  y -= 20;

  drawText(`Service : ${booking.service?.name}`, 50, y);
  y -= 20;
  drawText(`Montant Bateau : ${booking.boatAmount}€`, 50, y);
  y -= 20;

  drawText("Options :", 50, y);
  y -= 20;

  booking.bookingOptions?.forEach((opt) => {
    drawText(`- ${opt.label} x${opt.quantity} @ ${opt.unitPrice}€`, 60, y);
    y -= 15;
  });

  y -= 10;
  drawText(`💳 Total payé en ligne : ${booking.boatAmount}€`, 50, y);
  y -= 20;

  drawText(`💵 À régler à bord : ${booking.payableOnBoard}€`, 50, y);
  y -= 40;

  drawText("Merci pour votre réservation avec Yachting Day !", 50, y);

  return await pdfDoc.save(); // retourne un Uint8Array
}
