import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    const { options } = await req.json();

    // 🔹 Vérifier si la réservation existe
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true },
    });

    if (!booking || !booking.service) {
      return NextResponse.json(
        { error: "Réservation introuvable" },
        { status: 404 }
      );
    }

    // 🔹 Trouver le prix dynamique basé sur la période
    const pricingRule = await prisma.pricingRule.findFirst({
      where: {
        serviceId: booking.service.id,
        startDate: { lte: booking.startTime },
        endDate: { gte: booking.startTime },
      },
      orderBy: { startDate: "desc" },
    });

    const servicePrice = pricingRule
      ? pricingRule.price
      : booking.service.defaultPrice;

    // 🔹 Calculer le total des options
    const optionsTotal = options.reduce(
      (sum: number, option: { amount: number }) => sum + option.amount,
      0
    );

    // 🔹 Calculer le total final
    const totalAmount = servicePrice + optionsTotal;

    // 🔹 Mettre à jour le montant total dans la base
    await prisma.booking.update({
      where: { id: bookingId },
      data: { totalAmount },
    });

    return NextResponse.json({ totalAmount });
  } catch (error) {
    console.error("Erreur lors du calcul du total :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
