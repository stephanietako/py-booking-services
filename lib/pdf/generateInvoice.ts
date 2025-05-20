import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Booking } from "@/types";
import fs from "fs";
import path from "path";

export async function generateInvoice(booking: Booking): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 750]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { width, height } = page.getSize();

  // 🔽 Charger le logo depuis le disque (public/logo.png)
  const logoPath = path.resolve(
    process.cwd(),
    "public/assets/logo/logo-new.png"
  );
  const logoImageBytes = fs.readFileSync(logoPath);
  const logoImage = await pdfDoc.embedPng(logoImageBytes);
  const logoDims = logoImage.scale(0.3); // Ajuste le ratio

  // 🖼️ Afficher le logo en haut à gauche
  page.drawImage(logoImage, {
    x: 50,
    y: height - 70,
    width: logoDims.width,
    height: logoDims.height,
  });

  let y = height - 100; // Ajuster la hauteur après le logo

  const drawText = (text: string, x: number, y: number, size = 12) => {
    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  drawText("Facture de Réservation", 50, y, 20);
  y -= 30;

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
  drawText(` Total payé en ligne : ${booking.boatAmount}€`, 50, y);
  y -= 20;
  drawText(`À régler à bord : ${booking.payableOnBoard}€`, 50, y);
  y -= 40;

  drawText("Merci pour votre réservation avec Yachting Day !", 50, y);

  return await pdfDoc.save();
}
