// // uils/stripe.ts

// import { prisma } from "@/lib/prisma";
// import { stripe } from "@/lib/stripe";
// import { Booking, Client, User } from "@/types";

// import { prisma } from "@/lib/prisma";
// import { stripe } from "@/lib/stripe";
// import { Booking, Client, User } from "@prisma/client";

// /**
//  * Récupère ou crée un Stripe Customer à partir d'une réservation (booking).
//  * Gère les cas de User connecté ou Client anonyme.
//  */
// export async function getStripeCustomerIdForBooking(
//   booking: Booking & {
//     user?: User | null;
//     client?: Client | null;
//   }
// ): Promise<string> {
//   // ✅ Cas 1 : utilisateur authentifié avec Stripe Customer
//   if (booking.user?.stripeCustomerId) {
//     return booking.user.stripeCustomerId;
//   }

//   // ✅ Cas 2 : client anonyme => créer un Stripe Customer à la volée
//   if (booking.client) {
//     if (booking.client.stripeCustomerId) {
//       return booking.client.stripeCustomerId;
//     }

//     const newCustomer = await stripe.customers.create({
//       name: booking.client.fullName,
//       email: booking.client.email,
//       phone: booking.client.phoneNumber || undefined,
//       metadata: {
//         clientId: String(booking.client.id),
//         bookingId: String(booking.id),
//       },
//     });

//     // ✅ Met à jour la base avec le stripeCustomerId du client
//     await prisma.client.update({
//       where: { id: booking.client.id },
//       data: { stripeCustomerId: newCustomer.id },
//     });

//     return newCustomer.id;
//   }

//   // ❌ Aucun utilisateur ni client = erreur critique
//   throw new Error("Aucun utilisateur ni client associé à cette réservation.");
// }
import { Booking, Client, User } from "@prisma/client";

export async function getStripeCustomerIdForBooking(
  booking: Booking & {
    user?: User | null;
    client?: Client | null;
  }
): Promise<string> {
  if (booking.user) {
    if (booking.user.stripeCustomerId) {
      return booking.user.stripeCustomerId;
    }
    // Créer Stripe Customer et mettre à jour user
  }
  if (booking.client) {
    if (booking.client.stripeCustomerId) {
      return booking.client.stripeCustomerId;
    }
    // Créer Stripe Customer et mettre à jour client
  }
  throw new Error("Aucun utilisateur ni client associé à cette réservation.");
}
