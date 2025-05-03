import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Typage explicite des options envoyées depuis le client
type OptionInput = {
  optionId: string;
  quantity: number;
};

export async function POST(req: NextRequest) {
  try {
    const {
      clerkUserId,
      serviceId,
      reservedAt,
      startTime,
      endTime,
      withCaptain = false,
      boatAmount = 0,
      options = [],
    }: {
      clerkUserId: string;
      serviceId: string;
      reservedAt: string;
      startTime: string;
      endTime: string;
      withCaptain?: boolean;
      boatAmount?: number;
      options?: OptionInput[];
    } = await req.json();

    // 🧠 Validation de base
    if (!clerkUserId || !serviceId || !reservedAt || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { pricingRules: true }, // Inclure les règles de prix
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service introuvable" },
        { status: 404 }
      );
    }

    // 🗓️ Gestion des dates
    const reserved = new Date(reservedAt);
    const start = new Date(startTime);
    const end = new Date(endTime);

    // 🧮 Calcul du tarif dynamique si applicable
    let basePrice = service.defaultPrice; // Prix par défaut du service

    if (service.pricingRules && service.pricingRules.length > 0) {
      const rule = service.pricingRules.find(
        (rule) => reserved >= rule.startDate && reserved <= rule.endDate
      );
      if (rule) {
        basePrice = rule.price; // Utiliser le prix de la règle si elle existe
      }
    }
    // Si aucune règle de prix n'est trouvée, on utilise service.defaultPrice

    // 💸 Options payables sur place uniquement
    const payableOnBoard = await Promise.all(
      options.map(async ({ optionId, quantity }) => {
        const opt = await prisma.option.findUnique({ where: { id: optionId } });
        return opt?.payableOnline === false ? (opt?.amount ?? 0) * quantity : 0; // Ajout de la vérification opt?.amount
      })
    );

    const optionsTotal = payableOnBoard.reduce((sum, value) => sum + value, 0);
    const totalAmount = basePrice + optionsTotal + boatAmount;

    // 🛥️ Création de la réservation
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId,
        reservedAt: reserved,
        startTime: start,
        endTime: end,
        withCaptain,
        boatAmount,
        payableOnBoard: optionsTotal,
        totalAmount,
        expiresAt: new Date(end.getTime() + 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    });

    // 🔁 Lier les options à la réservation
    for (const { optionId, quantity } of options) {
      const option = await prisma.option.findUnique({
        where: { id: optionId },
      });
      if (!option) continue;

      await prisma.bookingOption.create({
        data: {
          bookingId: booking.id,
          optionId: option.id,
          quantity,
          unitPrice: option.amount,
          label: option.label,
        },
      });
    }

    if (process.env.NODE_ENV === "development") {
      console.log("✅ Réservation créée :", booking);
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
