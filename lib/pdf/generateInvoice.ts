// lib/pdf/generateInvoice.ts
// import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
// // Importez tous vos types nécessaires, y compris Option et BookingOption.
// import { Booking, Service, Client, BookingOption, Option } from "@/types";

// // Définissez le même type que dans la route API pour assurer la cohérence
// type BookingForInvoice = Booking & {
//   Service: Service;
//   client: Client;
//   bookingOptions: (BookingOption & { option: Option })[]; // <-- Assurez-vous que 'option' est bien là
// };

// // Mettez à jour le type de l'argument 'booking'
// export async function generateInvoice(
//   booking: BookingForInvoice
// ): Promise<Uint8Array> {
//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage([600, 750]);
//   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//   const { height } = page.getSize();

//   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
//   const logoUrl = `${baseUrl}/assets/logo/logo-new.png`;

//   try {
//     const logoResponse = await fetch(logoUrl);
//     if (!logoResponse.ok) {
//       console.warn(
//         `⚠️ Échec du chargement du logo depuis ${logoUrl}. Statut: ${logoResponse.status} ${logoResponse.statusText}`
//       );
//     } else {
//       const logoImageBytes = await logoResponse.arrayBuffer();
//       const logoImage = await pdfDoc.embedPng(logoImageBytes);
//       const logoDims = logoImage.scale(0.3);
//       page.drawImage(logoImage, {
//         x: 50,
//         y: height - 70,
//         width: logoDims.width,
//         height: logoDims.height,
//       });
//     }
//   } catch (error) {
//     console.error(
//       "❌ Erreur lors du chargement ou de l'intégration du logo dans le PDF:",
//       error
//     );
//   }

//   let y = height - 100;

//   const drawText = (text: string, x: number, y: number, size = 12) => {
//     page.drawText(text, {
//       x,
//       y,
//       size,
//       font,
//       color: rgb(0, 0, 0),
//     });
//   };

//   drawText("Facture de Réservation", 50, y, 20);
//   y -= 30;

//   drawText(`ID Réservation : ${booking.id}`, 50, y);
//   y -= 20;

//   drawText(
//     `Date : ${new Date(booking.createdAt).toLocaleDateString("fr-FR")}`,
//     50,
//     y
//   );
//   y -= 20;

//   drawText(`Service : ${booking.Service?.name || "—"}`, 50, y);
//   y -= 20;

//   drawText(`Montant Bateau : ${booking.boatAmount.toFixed(2)}€`, 50, y);
//   y -= 20;

//   drawText("Options :", 50, y);
//   y -= 20;

//   let totalOptionsPayableOnBoard = 0;
//   const captainPrice = 350;

//   if (booking.bookingOptions && booking.bookingOptions.length > 0) {
//     booking.bookingOptions.forEach((opt) => {
//       if (opt.option?.payableAtBoard) {
//         const unitPrice =
//           typeof opt.unitPrice === "number" && opt.unitPrice > 0
//             ? opt.unitPrice
//             : 0;
//         const lineTotal = unitPrice * opt.quantity;
//         totalOptionsPayableOnBoard += lineTotal;

//         const pricePart = unitPrice > 0 ? ` @ ${unitPrice.toFixed(2)}€` : "";

//         drawText(`- ${opt.label} x${opt.quantity}${pricePart}`, 60, y);
//         y -= 15;
//       }
//     });
//   } else {
//     drawText("Aucune option sélectionnée.", 60, y);
//     y -= 15;
//   }

//   y -= 10;

//   // ✅ Afficher le total des options payables à bord
//   drawText(`Total options : ${totalOptionsPayableOnBoard.toFixed(2)}€`, 50, y);
//   y -= 20;

//   // Le total payé en ligne doit seulement inclure le boatAmount
//   // Les options à bord et le capitaine sont séparés
//   drawText(`Total payé en ligne : ${booking.boatAmount.toFixed(2)}€`, 50, y); // Changé ici
//   y -= 20;

//   // ✅ Calcul du total à régler à bord
//   let finalPayableOnBoard = totalOptionsPayableOnBoard;
//   if (!booking.withCaptain) {
//     // Si l'utilisateur n'a PAS son propre capitaine
//     finalPayableOnBoard += captainPrice;
//   }

//   drawText(`À régler à bord : ${finalPayableOnBoard.toFixed(2)}€`, 50, y); // Changé ici
//   y -= 40;

//   drawText("Merci pour votre réservation avec Yachting Day !", 50, y);

//   return await pdfDoc.save();
// }
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

  drawText(`Service réservé : ${booking.Service.name}`, 50, y);
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

  const needsCaptain = !booking.withCaptain;
  const captainPrice = 250;

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
