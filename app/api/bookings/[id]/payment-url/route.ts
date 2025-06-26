// app/api/bookings/[id]/payment-url/route.ts
import { createStripeCheckoutSession } from "@/actions/actionsStripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;
  const bookingId = parseInt(id, 10);
  const domainUrl = process.env.DOMAIN_URL;

  if (!domainUrl || isNaN(bookingId)) {
    return NextResponse.json(
      { error: "Paramètres invalides." },
      { status: 400 }
    );
  }

  try {
    // 🔍 Récupérer la réservation avec les infos client/utilisateur
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation introuvable." },
        { status: 404 }
      );
    }

    // 📧 Déterminer l'email du client
    const customerEmail = booking.client?.email || booking.user?.email;

    if (!customerEmail) {
      return NextResponse.json(
        { error: "Aucun email trouvé pour cette réservation." },
        { status: 400 }
      );
    }

    // 💳 Récupérer ou créer le customer Stripe
    let stripeCustomerId: string;

    // Vérifier si un customer Stripe existe déjà
    if (booking.user?.stripeCustomerId) {
      stripeCustomerId = booking.user.stripeCustomerId;
    } else {
      // Chercher un customer existant par email
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id;

        // Mettre à jour la BDD avec le customer ID trouvé
        if (booking.userId) {
          await prisma.user.update({
            where: { id: booking.userId },
            data: { stripeCustomerId },
          });
        }
      } else {
        // Créer un nouveau customer Stripe
        const customer = await stripe.customers.create({
          email: customerEmail,
          name:
            booking.client?.fullName ||
            booking.user?.name ||
            booking.user?.name ||
            undefined,
          phone:
            booking.client?.phoneNumber ||
            booking.user?.phoneNumber ||
            undefined,
          metadata: {
            bookingId: bookingId.toString(),
            clientId: booking.clientId?.toString() || "",
            userId: booking.userId || "",
          },
        });

        stripeCustomerId = customer.id;

        // Sauvegarder le customer ID dans la BDD
        if (booking.userId) {
          await prisma.user.update({
            where: { id: booking.userId },
            data: { stripeCustomerId: customer.id },
          });
        }
      }
    }

    // ✅ Appeler la fonction avec les 3 paramètres requis
    const url = await createStripeCheckoutSession(bookingId, stripeCustomerId);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("❌ Erreur Stripe:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erreur serveur Stripe.",
      },
      { status: 500 }
    );
  }
};
