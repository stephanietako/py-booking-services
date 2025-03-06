// import { headers } from "next/headers";
// import Stripe from "stripe";
// import { prisma } from "@/lib/prisma";
// //WEBHOOK app/api/webhook/stripe/route.ts
// // Initialisation de Stripe
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
// // const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// export async function POST(req: Request) {
//   const body = await req.text();
//   // Récupération de la signature Stripe depuis les en-têtes de la requête
//   const headerList = await headers();
//   const signature = headerList.get("stripe-signature") as string;

//   if (!signature) {
//     console.error("La signature du webhook est manquante.");
//     return new Response(
//       JSON.stringify({ error: "Webhook signature missing" }),
//       {
//         status: 400,
//       }
//     );
//   }

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET as string
//     );
//   } catch {
//     return new Response("Erreur Webhook", {
//       status: 400,
//     });
//   }

//   const { data, type: eventType } = event;

//   try {
//     switch (eventType) {
//       case "checkout.session.completed": {
//         console.log("Traitement de checkout.session.completed...");
//         const session = data.object as Stripe.Checkout.Session;

//         if (!session.customer) {
//           throw new Error("Customer ID manquant dans la session.");
//         }

//         const customerId = session.customer as string;
//         console.log("Customer ID:", customerId);

//         // Récupérer l'utilisateur via son stripeCustomerId
//         let user = await prisma.user.findUnique({
//           where: { stripeCustomerId: customerId },
//         });

//         if (!user) {
//           // Créer un nouvel utilisateur si inexistant
//           user = await prisma.user.create({
//             data: {
//               email: session.customer_email ?? "",
//               stripeCustomerId: customerId,
//               name: "Default Name", // Provide a default or dynamic value
//               clerkUserId: "defaultClerkUserId", // Provide a default or dynamic value
//               role: {
//                 connect: {
//                   name: "user", // Provide the correct role name or ID
//                 },
//               }, // Provide a default or dynamic value
//             },
//           });
//           console.log(`Nouvel utilisateur créé: ${JSON.stringify(user)}`);
//         } else {
//           // Mettre à jour l'utilisateur existant (ex: activation)
//           await prisma.user.update({
//             where: { id: user.id },
//             data: {
//               email: session.customer_email ?? "",
//             },
//           });
//           console.log(`Utilisateur mis à jour: ${JSON.stringify(user)}`);
//         }

//         // Associer le paiement à une réservation (si une réservation est trouvée)
//         if (session.metadata?.bookingId) {
//           const bookingId = session.metadata.bookingId;
//           await prisma.booking.update({
//             where: { id: bookingId },
//             data: {
//               stripePaymentIntentId: session.payment_intent as string,
//             },
//           });
//           console.log(
//             `Intention de paiement associée à la réservation ${bookingId}`
//           );
//         }

//         break;
//       }

//       case "payment_intent.succeeded": {
//         console.log("Traitement de payment_intent.succeeded...");
//         const paymentIntent = data.object as Stripe.PaymentIntent;

//         const booking = await prisma.booking.findFirst({
//           where: { stripePaymentIntentId: paymentIntent.id },
//         });

//         if (!booking) {
//           throw new Error(
//             `Aucune réservation trouvée pour le paiement ${paymentIntent.id}`
//           );
//         }

//         await prisma.booking.update({
//           where: { id: booking.id },
//           data: {
//             status: "APPROVED",
//             totalAmount: paymentIntent.amount_received / 100,
//           },
//         });

//         console.log(`Réservation ${booking.id} mise à jour en APPROVED.`);
//         break;
//       }

//       case "payment_intent.payment_failed": {
//         console.log("Traitement de payment_intent.payment_failed...");
//         const paymentIntent = data.object as Stripe.PaymentIntent;

//         const booking = await prisma.booking.findFirst({
//           where: { stripePaymentIntentId: paymentIntent.id },
//         });

//         if (!booking) {
//           throw new Error(
//             `Aucune réservation trouvée pour le paiement ${paymentIntent.id}`
//           );
//         }

//         await prisma.booking.update({
//           where: { id: booking.id },
//           data: {
//             status: "REJECTED",
//           },
//         });

//         console.log(`Réservation ${booking.id} mise à jour en REJECTED.`);
//         break;
//       }

//       default:
//         console.warn(`Événement non géré: ${eventType}`);
//     }
//   } catch (e) {
//     const errorMessage = e instanceof Error ? e.message : "Erreur inconnue";
//     console.error(
//       `Erreur Stripe: ${errorMessage} | Type d'événement: ${eventType}`
//     );
//     return new Response(JSON.stringify({ error: errorMessage }), {
//       status: 400,
//     });
//   }

//   return new Response(JSON.stringify({ message: "Webhook reçu" }), {
//     status: 200,
//   });
// }
////////////
// import { headers } from "next/headers";
// import Stripe from "stripe";
// import { prisma } from "@/lib/prisma";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// export async function POST(req: Request) {
//   console.log("✅ Webhook Stripe reçu !");

//   const body = await req.text();
//   console.log("📩 Contenu de la requête Stripe :", body);

//   const headerList = await headers();
//   const signature = headerList.get("stripe-signature") as string;

//   if (!signature) {
//     console.error("❌ Signature Stripe manquante.");
//     return new Response("Signature Stripe manquante", { status: 400 });
//   }

//   let event: Stripe.Event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET as string
//     );
//   } catch (err) {
//     console.error("❌ Erreur de validation du webhook:", err);
//     return new Response("Webhook error", { status: 400 });
//   }

//   try {
//     switch (event.type) {
//       case "checkout.session.completed": {
//         const session = event.data.object as Stripe.Checkout.Session;
//         const bookingId = session.metadata?.bookingId;

//         if (!bookingId) {
//           console.error("❌ Booking ID manquant dans metadata.");
//           return new Response("Booking ID missing", { status: 400 });
//         }
//         // Ajouter un console.log pour vérifier l'ID du PaymentIntent
//         console.log("✅ Paiement réussi pour la réservation :", bookingId);
//         console.log("ID du PaymentIntent :", session.payment_intent);
//         // Vérifier si la réservation existe et est toujours approuvée
//         const booking = await prisma.booking.findUnique({
//           where: { id: bookingId },
//         });

//         if (!booking || booking.status !== "APPROVED") {
//           console.error("❌ Réservation invalide ou non approuvée.");
//           return new Response("Invalid booking", { status: 400 });
//         }

//         // Assure-toi que payment_intent est bien un string
//         const paymentIntentId = session.payment_intent as string;

//         // Mettre à jour la réservation en PAID
//         await prisma.booking.update({
//           where: { id: bookingId },
//           data: {
//             status: "PAID", // Ajoute "PAID" dans l'enum Prisma pour éviter ce cast
//             stripePaymentIntentId: paymentIntentId,
//             // stripePaymentIntentId: session.payment_intent as string,
//           },
//         });

//         // Enregistrer la transaction dans la base de données
//         await prisma.transaction.create({
//           data: {
//             bookingId,
//             amount: session.amount_total! / 100, // Convertir en devise
//             description: `Paiement Stripe réussi (${session.id})`,
//           },
//         });

//         console.log(`✅ Paiement validé pour la réservation ${bookingId}`);
//         break;
//       }

//       case "payment_intent.payment_failed": {
//         console.warn("❌ Paiement échoué.");
//         break;
//       }

//       default:
//         console.log(`ℹ️ Événement Stripe non géré: ${event.type}`);
//     }
//   } catch (error) {
//     console.error("❌ Erreur lors du traitement du webhook:", error);
//     return new Response("Erreur Webhook", { status: 500 });
//   }

//   return new Response("Webhook reçu", { status: 200 });
// }
//////////////////////////
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  console.log("✅ Webhook Stripe reçu !");

  const body = await req.text();
  console.log("📩 Contenu de la requête Stripe :", body);

  const headerList = await headers();
  const signature = headerList.get("stripe-signature") as string;

  if (!signature) {
    console.error("❌ Signature Stripe manquante.");
    return new Response("Signature Stripe manquante", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error("❌ Erreur de validation du webhook:", err);
    return new Response("Webhook error", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.metadata?.bookingId) {
          console.error("❌ Booking ID manquant dans metadata.");
          return new Response("Booking ID missing", { status: 400 });
        }

        const bookingId = session.metadata.bookingId;
        console.log("✅ Paiement réussi pour la réservation :", bookingId);
        console.log("ID du PaymentIntent :", session.payment_intent);

        // Vérifier si la réservation existe et est approuvée
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
        });

        if (!booking || booking.status !== "APPROVED") {
          console.error("❌ Réservation invalide ou non approuvée.");
          return new Response("Invalid booking", { status: 400 });
        }

        if (!session.payment_intent) {
          console.error("❌ Payment Intent manquant.");
          return new Response("Payment Intent missing", { status: 400 });
        }

        const paymentIntentId = session.payment_intent as string;

        // Vérifier que le montant est défini avant de l'utiliser
        if (!session.amount_total) {
          console.error("❌ Montant total manquant dans la session.");
          return new Response("Amount total missing", { status: 400 });
        }

        // ✅ Mettre à jour la réservation en "PAID"
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "PAID",
            stripePaymentIntentId: paymentIntentId,
          },
        });

        // ✅ Enregistrer la transaction dans la base de données
        await prisma.transaction.create({
          data: {
            bookingId,
            amount: session.amount_total / 100, // Convertir centimes en devise
            description: `Paiement Stripe réussi (${session.id})`,
            createdAt: new Date(), // Ajout de la date de transaction
          },
        });

        console.log(
          `✅ Paiement validé et transaction enregistrée pour la réservation ${bookingId}`
        );
        break;
      }

      case "payment_intent.payment_failed": {
        console.warn("❌ Paiement échoué.");
        break;
      }

      default:
        console.log(`ℹ️ Événement Stripe non géré: ${event.type}`);
    }
  } catch (error) {
    console.error("❌ Erreur lors du traitement du webhook:", error);
    return new Response("Erreur Webhook", { status: 500 });
  }

  return new Response("Webhook reçu", { status: 200 });
}
