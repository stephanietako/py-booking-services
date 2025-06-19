// // api/admin/bookings/sendReservationDetails/route.ts
// import { NextResponse } from "next/server";
// import { buildAdminReservationEmail } from "@/lib/emails/adminReservationDetails";
// import { requestConfirmationEmail } from "@/lib/emails/requestConfirmation";
// import { sendEmail } from "@/lib/email/send";
// import { PrismaClient } from "@prisma/client";
// import { Service, PricingRule } from "@/types";

// const prisma = new PrismaClient();
// const adminEmail = process.env.ADMIN_EMAIL;

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { bookingId, stripeUrl } = body;

//     if (!bookingId) {
//       return NextResponse.json(
//         { error: `Champ manquant : bookingId` },
//         { status: 400 }
//       );
//     }

//     if (!adminEmail) {
//       console.error("❌ ADMIN_EMAIL non défini");
//       return NextResponse.json(
//         { error: "ADMIN_EMAIL manquant dans l'environnement" },
//         { status: 500 }
//       );
//     }

//     // --- Récupération des détails de la réservation ---
//     const booking = await prisma.booking.findUnique({
//       where: { id: parseInt(bookingId, 10) },
//       include: {
//         client: true,
//         user: true,
//         service: {
//           include: {
//             pricingRules: true,
//           },
//         },
//         bookingOptions: {
//           include: {
//             option: true,
//           },
//         },
//       },
//     });

//     if (booking && booking.service) {
//       console.log(
//         "booking.service.pricingRules:",
//         booking.service.pricingRules
//       );
//     }
//     if (!booking?.service?.pricingRules) {
//       throw new Error("Aucune règle de prix trouvée pour ce service !");
//     }

//     if (!booking) {
//       return NextResponse.json(
//         { error: `Réservation avec l'ID ${bookingId} introuvable.` },
//         { status: 404 }
//       );
//     }

//     // Vérification des données de réservation
//     const needsCaptain =
//       !booking.withCaptain && booking.service?.requiresCaptain;
//     const captainPrice = needsCaptain
//       ? (booking.service?.captainPrice ?? 350)
//       : 0;

//     const totalPayableOnBoardCalculated =
//       booking.bookingOptions
//         .filter((bo) => bo.option?.payableAtBoard)
//         .reduce(
//           (sum, bo) => sum + (bo.option?.unitPrice || 0) * (bo.quantity || 1),
//           0
//         ) + captainPrice;

//     // Préparer les paramètres pour l'email client
//     const clientEmailParams = {
//       bookingId: booking.id.toString(),
//       clientName: booking.client?.fullName || "",
//       clientEmail: booking.client?.email || "",
//       serviceName: booking.service?.name || "",
//       startTime: booking.startTime,
//       endTime: booking.endTime,
//       boatAmount: booking.boatAmount,
//       mealOption: booking.mealOption,
//       withCaptain: booking.withCaptain,
//       captainPrice: captainPrice,
//       totalPayableOnBoardCalculated,
//       cautionAmount: booking.service?.cautionAmount || 0,
//       bookingOptions: booking.bookingOptions.map((bo) => ({
//         quantity: bo.quantity,
//         option: {
//           unitPrice: bo.option?.unitPrice || 0,
//           label: bo.option?.label || "Option inconnue",
//           payableAtBoard: bo.option?.payableAtBoard || false,
//         },
//       })),
//       comment: booking.description || "",
//     };

//     function getBoatPriceForDate(date: Date, service: Service): number {
//       const rules = service.pricingRules ?? [];
//       const rule = rules.find(
//         (r: PricingRule) =>
//           date >= new Date(r.startDate) && date <= new Date(r.endDate)
//       );
//       return rule?.price ?? service.defaultPrice ?? 1500;
//     }

//     const dynamicBoatAmount = booking.service
//       ? getBoatPriceForDate(booking.startTime, {
//           ...booking.service,
//           pricingRules: (booking.service.pricingRules ?? []).map((rule) => ({
//             ...rule,
//             startDate: new Date(rule.startDate),
//             endDate: new Date(rule.endDate),
//           })),
//         })
//       : 1500;

//     const emailParams = {
//       bookingId: booking.id.toString(),
//       firstName: booking.client?.fullName.split(" ")[0] || "",
//       lastName: booking.client?.fullName.split(" ").slice(1).join(" ") || "",
//       email: booking.client?.email || "",
//       phoneNumber: booking.client?.phoneNumber || "",
//       reservationTime: new Date(booking.startTime).toLocaleString("fr-FR"),
//       stripeUrl,
//       comment: booking.description || "",
//       bookingOptions: booking.bookingOptions.map((bo) => ({
//         quantity: bo.quantity,
//         option: {
//           unitPrice: bo.option?.unitPrice || 0,
//           label: bo.option?.label || "Option inconnue",
//           payableAtBoard: bo.option?.payableAtBoard || false,
//         },
//       })),
//       withCaptain: booking.withCaptain,
//       mealOption: booking.mealOption,
//       boatAmount: dynamicBoatAmount,
//       service: {
//         name: booking.service?.name || "",
//         currency: booking.service?.currency || "EUR",
//         cautionAmount: booking.service?.cautionAmount || 0,
//         requiresCaptain: booking.service?.requiresCaptain || false,
//       },
//       captainPrice,
//       totalPayableOnBoardCalculated,
//     };
//     console.log("EMAIL PARAMS ADMIN:", emailParams);
//     // Envoi de l'email à l'admin
//     const { subject, html, text } = buildAdminReservationEmail(emailParams);
//     await sendEmail({
//       to: adminEmail,
//       subject,
//       html,
//       text,
//     });

//     // Envoi de l'email de confirmation au client
//     const clientMail = requestConfirmationEmail(clientEmailParams);
//     await sendEmail({
//       to: clientMail.to,
//       subject: clientMail.subject,
//       html: clientMail.html,
//       text: clientMail.text,
//     });

//     // Envoi de la facture à l'admin
//     const invoiceResponse = await fetch(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/bookings/send-invoice`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           bookingId: body.bookingId,
//           sendToClient: false,
//         }),
//       }
//     );

//     if (!invoiceResponse.ok) {
//       console.warn(
//         "⚠️ Facture non envoyée correctement :",
//         await invoiceResponse.text()
//       );
//     }

//     return NextResponse.json(
//       { message: "Email et facture envoyés à l'admin avec succès !" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("❌ Erreur dans sendReservationDetails:", error);
//     const message = error instanceof Error ? error.message : "Erreur interne";
//     return NextResponse.json({ error: message }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
// import { NextResponse } from "next/server";
// import { buildAdminReservationEmail } from "@/lib/emails/adminReservationDetails";
// import { requestConfirmationEmail } from "@/lib/emails/requestConfirmation";
// import { sendEmail } from "@/lib/email/send";
// import { PrismaClient } from "@prisma/client";
// import { Service, PricingRule } from "@/types";

// const prisma = new PrismaClient();
// const adminEmail = process.env.ADMIN_EMAIL;

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { bookingId, stripeUrl } = body;

//     if (!bookingId) {
//       return NextResponse.json(
//         { error: `Champ manquant : bookingId` },
//         { status: 400 }
//       );
//     }

//     // Vérification que bookingId est un nombre valide
//     const bookingIdNum = parseInt(bookingId, 10);
//     if (isNaN(bookingIdNum)) {
//       return NextResponse.json(
//         { error: "bookingId invalide" },
//         { status: 400 }
//       );
//     }

//     if (!adminEmail) {
//       console.error("❌ ADMIN_EMAIL non défini");
//       return NextResponse.json(
//         { error: "ADMIN_EMAIL manquant dans l'environnement" },
//         { status: 500 }
//       );
//     }

//     // Récupération des détails de la réservation
//     const booking = await prisma.booking.findUnique({
//       where: { id: bookingIdNum },
//       include: {
//         client: true,
//         user: true,
//         service: {
//           include: {
//             pricingRules: true,
//           },
//         },
//         bookingOptions: {
//           include: {
//             option: true,
//           },
//         },
//       },
//     });

//     if (!booking) {
//       return NextResponse.json(
//         { error: `Réservation avec l'ID ${bookingIdNum} introuvable.` },
//         { status: 404 }
//       );
//     }

//     if (!booking.service) {
//       return NextResponse.json(
//         { error: "Service lié à la réservation introuvable" },
//         { status: 404 }
//       );
//     }

//     if (!booking.service.pricingRules) {
//       throw new Error("Aucune règle de prix trouvée pour ce service !");
//     }

//     // Calcul du prix capitaine si nécessaire
//     const needsCaptain =
//       !booking.withCaptain && booking.service.requiresCaptain;
//     const captainPrice = needsCaptain
//       ? (booking.service.captainPrice ?? 350)
//       : 0;

//     // Somme des options payables à bord
//     const totalPayableOnBoardCalculated =
//       booking.bookingOptions
//         .filter((bo) => bo.option?.payableAtBoard)
//         .reduce(
//           (sum, bo) => sum + (bo.option?.amount || 0) * (bo.quantity || 1),
//           0
//         ) + captainPrice;

//     // Préparer les paramètres pour l'email client
//     const clientEmailParams = {
//       bookingId: booking.id.toString(),
//       clientName: booking.client?.fullName || "",
//       clientEmail: booking.client?.email || "",
//       serviceName: booking.service.name || "",
//       startTime: booking.startTime,
//       endTime: booking.endTime,
//       boatAmount: booking.boatAmount,
//       mealOption: booking.mealOption ?? null, // gérer s’il est absent
//       withCaptain: booking.withCaptain,
//       captainPrice,
//       totalPayableOnBoardCalculated,
//       cautionAmount: booking.service.cautionAmount || 0,
//       bookingOptions: booking.bookingOptions.map((bo) => ({
//         quantity: bo.quantity,
//         option: {
//           unitPrice: bo.option?.amount || 0,
//           label: bo.option?.label || "Option inconnue",
//           payableAtBoard: bo.option?.payableAtBoard || false,
//         },
//       })),
//       comment: booking.description || "",
//     };

//     // Fonction pour obtenir le prix du bateau selon la date et règles
//     function getBoatPriceForDate(date: Date, service: Service): number {
//       const rules = service.pricingRules ?? [];
//       const rule = rules.find(
//         (r: PricingRule) =>
//           date >= new Date(r.startDate) && date <= new Date(r.endDate)
//       );
//       return rule?.price ?? service.defaultPrice ?? 1500;
//     }

//     // Calcul dynamique du prix bateau
//     const dynamicBoatAmount = getBoatPriceForDate(booking.startTime, {
//       ...booking.service,
//       pricingRules: (booking.service.pricingRules ?? []).map((rule) => ({
//         ...rule,
//         startDate: new Date(rule.startDate),
//         endDate: new Date(rule.endDate),
//       })),
//     });

//     // Paramètres pour email admin
//     const emailParams = {
//       bookingId: booking.id.toString(),
//       firstName: booking.client?.fullName.split(" ")[0] || "",
//       lastName: booking.client?.fullName.split(" ").slice(1).join(" ") || "",
//       email: booking.client?.email || "",
//       phoneNumber: booking.client?.phoneNumber || "",
//       reservationTime: new Date(booking.startTime).toLocaleString("fr-FR"),
//       stripeUrl,
//       comment: booking.description || "",
//       bookingOptions: booking.bookingOptions.map((bo) => ({
//         quantity: bo.quantity,
//         option: {
//           unitPrice: bo.option?.amount || 0,
//           label: bo.option?.label || "Option inconnue",
//           payableAtBoard: bo.option?.payableAtBoard || false,
//         },
//       })),
//       withCaptain: booking.withCaptain,
//       mealOption: booking.mealOption ?? null,
//       boatAmount: dynamicBoatAmount,
//       service: {
//         name: booking.service.name || "",
//         currency: booking.service.currency || "EUR",
//         cautionAmount: booking.service.cautionAmount || 0,
//         requiresCaptain: booking.service.requiresCaptain || false,
//       },
//       captainPrice,
//       totalPayableOnBoardCalculated,
//     };

//     console.log("EMAIL PARAMS ADMIN:", emailParams);

//     // Envoi de l'email à l'admin
//     const { subject, html, text } = buildAdminReservationEmail(emailParams);
//     await sendEmail({
//       to: adminEmail,
//       subject,
//       html,
//       text,
//     });

//     // Envoi de l'email de confirmation au client
//     const clientMail = requestConfirmationEmail(clientEmailParams);
//     await sendEmail({
//       to: clientMail.to,
//       subject: clientMail.subject,
//       html: clientMail.html,
//       text: clientMail.text,
//     });

//     // Envoi de la facture à l'admin via API interne
//     const invoiceResponse = await fetch(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/bookings/send-invoice`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           bookingId: bookingIdNum,
//           sendToClient: false,
//         }),
//       }
//     );

//     if (!invoiceResponse.ok) {
//       console.warn(
//         "⚠️ Facture non envoyée correctement :",
//         await invoiceResponse.text()
//       );
//       // Ici tu peux envisager de retry ou loguer dans un service de monitoring
//     }

//     return NextResponse.json(
//       { message: "Email et facture envoyés à l'admin avec succès !" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("❌ Erreur dans sendReservationDetails:", error);
//     const message = error instanceof Error ? error.message : "Erreur interne";
//     return NextResponse.json({ error: message }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
// import { NextResponse } from "next/server";
// import { buildAdminReservationEmail } from "@/lib/emails/adminReservationDetails";
// import { requestConfirmationEmail } from "@/lib/emails/requestConfirmation";
// import { sendEmail } from "@/lib/email/send";
// import { PrismaClient } from "@prisma/client";
// import type { Service, PricingRule } from "@/types";

// const prisma = new PrismaClient();
// const adminEmail = process.env.ADMIN_EMAIL;

// function getContactInfo(booking: {
//   client: {
//     fullName: string;
//     email: string;
//     phoneNumber: string;
//   } | null;
//   user: {
//     name: string;
//     email: string;
//     phoneNumber: string | null;
//   } | null;
// }) {
//   if (booking.client) {
//     return {
//       fullName: booking.client.fullName,
//       email: booking.client.email,
//       phoneNumber: booking.client.phoneNumber,
//     };
//   } else if (booking.user) {
//     return {
//       fullName: booking.user.name,
//       email: booking.user.email,
//       phoneNumber: booking.user.phoneNumber ?? "",
//     };
//   } else {
//     return {
//       fullName: "",
//       email: "",
//       phoneNumber: "",
//     };
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { bookingId, stripeUrl } = body;

//     if (!bookingId) {
//       return NextResponse.json(
//         { error: `Champ manquant : bookingId` },
//         { status: 400 }
//       );
//     }

//     const bookingIdNum = parseInt(bookingId, 10);
//     if (isNaN(bookingIdNum)) {
//       return NextResponse.json(
//         { error: "bookingId invalide" },
//         { status: 400 }
//       );
//     }

//     if (!adminEmail) {
//       console.error("❌ ADMIN_EMAIL non défini");
//       return NextResponse.json(
//         { error: "ADMIN_EMAIL manquant dans l'environnement" },
//         { status: 500 }
//       );
//     }

//     const booking = await prisma.booking.findUnique({
//       where: { id: bookingIdNum },
//       include: {
//         client: true,
//         user: true,
//         service: {
//           include: { pricingRules: true },
//         },
//         bookingOptions: {
//           include: { option: true },
//         },
//       },
//     });

//     if (!booking) {
//       return NextResponse.json(
//         { error: `Réservation avec l'ID ${bookingIdNum} introuvable.` },
//         { status: 404 }
//       );
//     }

//     if (!booking.service) {
//       return NextResponse.json(
//         { error: "Service lié à la réservation introuvable" },
//         { status: 404 }
//       );
//     }

//     if (!booking.service.pricingRules) {
//       throw new Error("Aucune règle de prix trouvée pour ce service !");
//     }

//     // Utilisation de getContactInfo pour uniformiser les infos contact
//     const contactInfo = getContactInfo(booking);

//     // Calcul du prix capitaine si nécessaire
//     const needsCaptain =
//       !booking.withCaptain && booking.service.requiresCaptain;
//     const captainPrice = needsCaptain
//       ? (booking.service.captainPrice ?? 350)
//       : 0;

//     // Somme des options payables à bord
//     const totalPayableOnBoardCalculated =
//       booking.bookingOptions
//         .filter((bo) => bo.option?.payableAtBoard)
//         .reduce(
//           (sum, bo) => sum + (bo.option?.amount || 0) * (bo.quantity || 1),
//           0
//         ) + captainPrice;

//     // Fonction pour obtenir le prix du bateau selon la date et règles
//     function getBoatPriceForDate(date: Date, service: Service): number {
//       const rules = service.pricingRules ?? [];
//       const rule = rules.find(
//         (r: PricingRule) =>
//           date >= new Date(r.startDate) && date <= new Date(r.endDate)
//       );
//       return rule?.price ?? service.defaultPrice ?? 1500;
//     }

//     // Calcul dynamique du prix bateau
//     const dynamicBoatAmount = getBoatPriceForDate(booking.startTime, {
//       ...booking.service,
//       pricingRules: (booking.service.pricingRules ?? []).map((rule) => ({
//         ...rule,
//         startDate: new Date(rule.startDate),
//         endDate: new Date(rule.endDate),
//       })),
//     });

//     // Préparer params email client
//     const clientEmailParams = {
//       bookingId: booking.id.toString(),
//       clientName: contactInfo.fullName,
//       clientEmail: contactInfo.email,
//       serviceName: booking.service.name || "",
//       startTime: booking.startTime,
//       endTime: booking.endTime,
//       boatAmount: booking.boatAmount,
//       mealOption: booking.mealOption ?? null,
//       withCaptain: booking.withCaptain,
//       captainPrice,
//       totalPayableOnBoardCalculated,
//       cautionAmount: booking.service.cautionAmount || 0,
//       bookingOptions: booking.bookingOptions.map((bo) => ({
//         quantity: bo.quantity,
//         option: {
//           unitPrice: bo.option?.amount || 0,
//           label: bo.option?.label || "Option inconnue",
//           payableAtBoard: bo.option?.payableAtBoard || false,
//         },
//       })),
//       comment: booking.description || "",
//     };

//     // Préparer params email admin
//     const emailParams = {
//       bookingId: booking.id.toString(),
//       firstName: contactInfo.fullName.split(" ")[0] || "",
//       lastName: contactInfo.fullName.split(" ").slice(1).join(" ") || "",
//       email: contactInfo.email,
//       phoneNumber: contactInfo.phoneNumber,
//       reservationTime: new Date(booking.startTime).toLocaleString("fr-FR"),
//       stripeUrl,
//       comment: booking.description || "",
//       bookingOptions: booking.bookingOptions.map((bo) => ({
//         quantity: bo.quantity,
//         option: {
//           unitPrice: bo.option?.amount || 0,
//           label: bo.option?.label || "Option inconnue",
//           payableAtBoard: bo.option?.payableAtBoard || false,
//         },
//       })),
//       withCaptain: booking.withCaptain,
//       mealOption: booking.mealOption ?? null,
//       boatAmount: dynamicBoatAmount,
//       service: {
//         name: booking.service.name || "",
//         currency: booking.service.currency || "EUR",
//         cautionAmount: booking.service.cautionAmount || 0,
//         requiresCaptain: booking.service.requiresCaptain || false,
//       },
//       captainPrice,
//       totalPayableOnBoardCalculated,
//     };

//     // Envoi email admin
//     const { subject, html, text } = buildAdminReservationEmail(emailParams);
//     await sendEmail({ to: adminEmail, subject, html, text });

//     // Envoi email client
//     const clientMail = requestConfirmationEmail(clientEmailParams);
//     await sendEmail({
//       to: clientMail.to,
//       subject: clientMail.subject,
//       html: clientMail.html,
//       text: clientMail.text,
//     });

//     // Envoi facture à admin via API interne
//     const invoiceResponse = await fetch(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/bookings/send-invoice`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           bookingId: bookingIdNum,
//           sendToClient: false,
//         }),
//       }
//     );

//     if (!invoiceResponse.ok) {
//       console.warn(
//         "⚠️ Facture non envoyée correctement :",
//         await invoiceResponse.text()
//       );
//     }

//     return NextResponse.json(
//       { message: "Email et facture envoyés à l'admin avec succès !" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("❌ Erreur dans sendReservationDetails:", error);
//     const message = error instanceof Error ? error.message : "Erreur interne";
//     return NextResponse.json({ error: message }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
// import { NextResponse, type NextRequest } from "next/server";
// import { buildAdminReservationEmail } from "@/lib/emails/adminReservationDetails";
// import { requestConfirmationEmail } from "@/lib/emails/requestConfirmation";
// import { sendEmail } from "@/lib/email/send";
// import { PrismaClient } from "@prisma/client";
// import type { Service, PricingRule } from "@/types";

// const prisma = new PrismaClient();
// const adminEmail = process.env.ADMIN_EMAIL;

// function getContactInfo(booking: {
//   client: { fullName?: string; email?: string; phoneNumber?: string } | null;
//   user: { name?: string; email?: string; phoneNumber?: string | null } | null;
// }) {
//   if (booking.client && booking.client.fullName && booking.client.email) {
//     return {
//       fullName: booking.client.fullName,
//       email: booking.client.email,
//       phoneNumber: booking.client.phoneNumber ?? "",
//     };
//   } else if (booking.user && booking.user.name && booking.user.email) {
//     return {
//       fullName: booking.user.name,
//       email: booking.user.email,
//       phoneNumber: booking.user.phoneNumber ?? "",
//     };
//   } else {
//     return {
//       fullName: "",
//       email: "",
//       phoneNumber: "",
//     };
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { bookingId, stripeUrl } = body;

//     if (!bookingId) {
//       return NextResponse.json(
//         { error: `Champ manquant : bookingId` },
//         { status: 400 }
//       );
//     }

//     const bookingIdNum = parseInt(bookingId, 10);
//     if (isNaN(bookingIdNum)) {
//       return NextResponse.json(
//         { error: "bookingId invalide" },
//         { status: 400 }
//       );
//     }

//     if (!adminEmail) {
//       console.error("❌ ADMIN_EMAIL non défini");
//       return NextResponse.json(
//         { error: "ADMIN_EMAIL manquant dans l'environnement" },
//         { status: 500 }
//       );
//     }

//     const booking = await prisma.booking.findUnique({
//       where: { id: bookingIdNum },
//       include: {
//         client: true,
//         user: true,
//         service: {
//           include: { pricingRules: true },
//         },
//         bookingOptions: {
//           include: { option: true },
//         },
//       },
//     });

//     if (!booking) {
//       return NextResponse.json(
//         { error: `Réservation avec l'ID ${bookingIdNum} introuvable.` },
//         { status: 404 }
//       );
//     }

//     if (!booking.service) {
//       return NextResponse.json(
//         { error: "Service lié à la réservation introuvable" },
//         { status: 404 }
//       );
//     }

//     if (!booking.service.pricingRules) {
//       throw new Error("Aucune règle de prix trouvée pour ce service !");
//     }

//     // Uniformiser les infos contact
//     const contactInfo = getContactInfo(booking);

//     // Calcul du prix capitaine si nécessaire
//     const needsCaptain =
//       !booking.withCaptain && booking.service.requiresCaptain;
//     const captainPrice = needsCaptain
//       ? (booking.service.captainPrice ?? 350)
//       : 0;

//     // Somme des options payables à bord
//     const totalPayableOnBoardCalculated =
//       (booking.bookingOptions ?? [])
//         .filter((bo) => bo.option?.payableAtBoard)
//         .reduce(
//           (sum, bo) => sum + (bo.option?.amount || 0) * (bo.quantity || 1),
//           0
//         ) + captainPrice;

//     // Fonction pour obtenir le prix bateau selon date et règles
//     function getBoatPriceForDate(date: Date, service: Service): number {
//       const rules = service.pricingRules ?? [];
//       const rule = rules.find(
//         (r: PricingRule) =>
//           date >= new Date(r.startDate) && date <= new Date(r.endDate)
//       );
//       return (
//         rule?.price ??
//         (service.defaultPrice !== undefined ? service.defaultPrice : 1500)
//       );
//     }

//     // Calcul dynamique du prix bateau
//     const dynamicBoatAmount = getBoatPriceForDate(booking.startTime, {
//       ...booking.service,
//       pricingRules: (booking.service.pricingRules ?? []).map((rule) => ({
//         ...rule,
//         startDate: new Date(rule.startDate),
//         endDate: new Date(rule.endDate),
//       })),
//     });

//     // Préparer params email client
//     const clientEmailParams = {
//       bookingId: booking.id.toString(),
//       clientName: contactInfo.fullName,
//       clientEmail: contactInfo.email,
//       serviceName: booking.service.name || "",
//       startTime: booking.startTime,
//       endTime: booking.endTime,
//       boatAmount: booking.boatAmount,
//       mealOption: booking.mealOption ?? null,
//       withCaptain: booking.withCaptain,
//       captainPrice,
//       totalPayableOnBoardCalculated,
//       cautionAmount: booking.service.cautionAmount || 0,
//       bookingOptions: (booking.bookingOptions ?? []).map((bo) => ({
//         quantity: bo.quantity,
//         option: {
//           unitPrice: bo.option?.amount || 0,
//           label: bo.option?.label || "Option inconnue",
//           payableAtBoard: bo.option?.payableAtBoard || false,
//         },
//       })),
//       comment: booking.description || "",
//     };

//     // Préparer params email admin
//     const emailParams = {
//       bookingId: booking.id.toString(),
//       firstName: contactInfo.fullName.split(" ")[0] || "",
//       lastName: contactInfo.fullName.split(" ").slice(1).join(" ") || "",
//       email: contactInfo.email,
//       phoneNumber: contactInfo.phoneNumber,
//       reservationTime: new Date(booking.startTime).toLocaleString("fr-FR"),
//       stripeUrl,
//       comment: booking.description || "",
//       bookingOptions: (booking.bookingOptions ?? []).map((bo) => ({
//         quantity: bo.quantity,
//         option: {
//           unitPrice: bo.option?.amount || 0,
//           label: bo.option?.label || "Option inconnue",
//           payableAtBoard: bo.option?.payableAtBoard || false,
//         },
//       })),
//       withCaptain: booking.withCaptain,
//       mealOption: booking.mealOption ?? null,
//       boatAmount: dynamicBoatAmount,
//       service: {
//         name: booking.service.name || "",
//         currency: booking.service.currency || "EUR",
//         cautionAmount: booking.service.cautionAmount || 0,
//         requiresCaptain: booking.service.requiresCaptain || false,
//       },
//       captainPrice,
//       totalPayableOnBoardCalculated,
//     };

//     // Envoi email admin
//     const { subject, html, text } = buildAdminReservationEmail(emailParams);
//     await sendEmail({ to: adminEmail, subject, html, text });

//     // Envoi email client
//     const clientMail = requestConfirmationEmail(clientEmailParams);
//     await sendEmail({
//       to: clientMail.to,
//       subject: clientMail.subject,
//       html: clientMail.html,
//       text: clientMail.text,
//     });

//     // Envoi facture à admin via API interne
//     const invoiceResponse = await fetch(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/bookings/send-invoice`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           bookingId: bookingIdNum,
//           sendToClient: false,
//         }),
//       }
//     );

//     if (!invoiceResponse.ok) {
//       console.warn(
//         "⚠️ Facture non envoyée correctement :",
//         await invoiceResponse.text()
//       );
//     }

//     return NextResponse.json(
//       { message: "Email et facture envoyés à l'admin avec succès !" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("❌ Erreur dans sendReservationDetails:", error);
//     const message = error instanceof Error ? error.message : "Erreur interne";
//     return NextResponse.json({ error: message }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
import { NextResponse, type NextRequest } from "next/server";
import { buildAdminReservationEmail } from "@/lib/emails/adminReservationDetails";
import { requestConfirmationEmail } from "@/lib/emails/requestConfirmation";
import { sendEmail } from "@/lib/email/send";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const adminEmail = process.env.ADMIN_EMAIL;

function getContactInfo(booking: {
  client?: {
    fullName?: string;
    email?: string;
    phoneNumber?: string | null;
  } | null;
  user?: {
    name?: string;
    email?: string;
    phoneNumber?: string | null;
    client?: { phoneNumber?: string | null } | null;
  } | null;
}) {
  const phoneNumber =
    booking.client?.phoneNumber?.trim() ||
    booking.user?.phoneNumber?.trim() ||
    booking.user?.client?.phoneNumber?.trim() ||
    "";

  if (booking.client && booking.client.fullName && booking.client.email) {
    return {
      fullName: booking.client.fullName,
      email: booking.client.email,
      phoneNumber,
    };
  } else if (booking.user && booking.user.name && booking.user.email) {
    return {
      fullName: booking.user.name,
      email: booking.user.email,
      phoneNumber,
    };
  } else {
    return {
      fullName: "",
      email: "",
      phoneNumber: "",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, stripeUrl } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: `Champ manquant : bookingId` },
        { status: 400 }
      );
    }

    const bookingIdNum = parseInt(bookingId, 10);
    if (isNaN(bookingIdNum)) {
      return NextResponse.json(
        { error: "bookingId invalide" },
        { status: 400 }
      );
    }

    if (!adminEmail) {
      console.error("❌ ADMIN_EMAIL non défini");
      return NextResponse.json(
        { error: "ADMIN_EMAIL manquant dans l'environnement" },
        { status: 500 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingIdNum },
      include: {
        client: true,
        user: true,
        service: {
          include: { pricingRules: true },
        },
        bookingOptions: {
          include: { option: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: `Réservation avec l'ID ${bookingIdNum} introuvable.` },
        { status: 404 }
      );
    }

    if (!booking.service) {
      return NextResponse.json(
        { error: "Service lié à la réservation introuvable" },
        { status: 404 }
      );
    }

    if (!booking.service.pricingRules) {
      throw new Error("Aucune règle de prix trouvée pour ce service !");
    }

    // Uniformiser les infos contact
    const contactInfo = getContactInfo(booking);

    // Calcul du prix capitaine si nécessaire
    const needsCaptain =
      !booking.withCaptain && booking.service.requiresCaptain;
    const captainPrice = needsCaptain
      ? (booking.service.captainPrice ?? 350)
      : 0;

    // Somme des options payables à bord avec unitPrice corrigé
    const totalPayableOnBoardCalculated =
      (booking.bookingOptions ?? [])
        .filter((bo) => bo.option?.payableAtBoard)
        .reduce(
          (sum, bo) => sum + (bo.option?.unitPrice || 0) * (bo.quantity || 1),
          0
        ) + captainPrice;

    // Utiliser directement booking.boatAmount (plus fiable)
    const boatAmount = booking.boatAmount ?? 0;

    // Préparer params email client
    const clientEmailParams = {
      bookingId: booking.id.toString(),
      clientName: contactInfo.fullName,
      clientEmail: contactInfo.email,
      clientPhoneNumber: contactInfo.phoneNumber,
      serviceName: booking.service.name || "",
      startTime: booking.startTime,
      endTime: booking.endTime,
      boatAmount,
      mealOption: booking.mealOption ?? null,
      withCaptain: booking.withCaptain,
      captainPrice,
      totalPayableOnBoardCalculated,
      cautionAmount: booking.service.cautionAmount || 0,
      bookingOptions: (booking.bookingOptions ?? []).map((bo) => ({
        quantity: bo.quantity,
        option: {
          unitPrice: bo.option?.unitPrice || 0,
          label: bo.option?.label || "Option inconnue",
          payableAtBoard: bo.option?.payableAtBoard || false,
        },
      })),
      comment: booking.description || "",
    };

    // Préparer params email admin
    const emailParams = {
      bookingId: booking.id.toString(),
      firstName: contactInfo.fullName.split(" ")[0] || "",
      lastName: contactInfo.fullName.split(" ").slice(1).join(" ") || "",
      email: contactInfo.email,
      phoneNumber: contactInfo.phoneNumber,
      reservationTime: new Date(booking.startTime).toLocaleString("fr-FR"),
      stripeUrl,
      comment: booking.description || "",
      bookingOptions: (booking.bookingOptions ?? []).map((bo) => ({
        quantity: bo.quantity,
        option: {
          unitPrice: bo.option?.unitPrice || 0,
          label: bo.option?.label || "Option inconnue",
          payableAtBoard: bo.option?.payableAtBoard || false,
        },
      })),
      withCaptain: booking.withCaptain,
      mealOption: booking.mealOption ?? null,
      boatAmount,
      service: {
        name: booking.service.name || "",
        currency: booking.service.currency || "EUR",
        cautionAmount: booking.service.cautionAmount || 0,
        requiresCaptain: booking.service.requiresCaptain || false,
      },
      captainPrice,
      totalPayableOnBoardCalculated,
    };

    // Envoi email admin
    const { subject, html, text } = buildAdminReservationEmail(emailParams);
    await sendEmail({ to: adminEmail, subject, html, text });

    // Envoi email client
    const clientMail = requestConfirmationEmail(clientEmailParams);
    await sendEmail({
      to: clientMail.to,
      subject: clientMail.subject,
      html: clientMail.html,
      text: clientMail.text,
    });

    // Envoi facture à admin via API interne
    const invoiceResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/bookings/send-invoice`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingIdNum,
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
  } catch (error) {
    console.error("❌ Erreur dans sendReservationDetails:", error);
    const message = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
