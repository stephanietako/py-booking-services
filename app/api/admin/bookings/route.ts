// app/api/admin/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type OptionInput = {
  optionId: string;
  quantity: number;
};

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        client: true,
        user: true,
        service: true,
        bookingOptions: { include: { option: true } },
      },
      orderBy: { startTime: "desc" },
    });
    return NextResponse.json(bookings);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
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
      description = "",
      clientInfo, // { fullName, email, phoneNumber? }
    }: {
      clerkUserId: string;
      serviceId: string;
      reservedAt: string;
      startTime: string;
      endTime: string;
      withCaptain?: boolean;
      boatAmount?: number;
      options?: OptionInput[];
      description?: string;
      clientInfo?: {
        fullName: string;
        email: string;
        phoneNumber?: string;
      };
    } = await req.json();

    // Validation de base
    if (!clerkUserId || !serviceId || !reservedAt || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    // Récupérer user
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Récupérer ou créer client (par email)
    let client = null;
    if (clientInfo?.email) {
      client = await prisma.client.findUnique({
        where: { email: clientInfo.email },
      });
      if (!client) {
        client = await prisma.client.create({
          data: {
            fullName: clientInfo.fullName,
            email: clientInfo.email,
            phoneNumber: clientInfo.phoneNumber ?? "",
            userId: user.id,
          },
        });
      }
    }

    // Récupérer service avec règles de prix
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { pricingRules: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service introuvable" },
        { status: 404 }
      );
    }

    // Dates
    const reserved = new Date(reservedAt);
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Calcul tarif dynamique
    let basePrice = service.defaultPrice;
    if (service.pricingRules && service.pricingRules.length > 0) {
      const rule = service.pricingRules.find(
        (rule) => reserved >= rule.startDate && reserved <= rule.endDate
      );
      if (rule) basePrice = rule.price;
    }

    // Options payables sur place
    const payableOnBoard = await Promise.all(
      options.map(async ({ optionId, quantity }) => {
        const opt = await prisma.option.findUnique({ where: { id: optionId } });
        return opt?.payableOnline === false ? (opt?.amount ?? 0) * quantity : 0;
      })
    );
    const optionsTotal = payableOnBoard.reduce((sum, val) => sum + val, 0);

    // Total
    const totalAmount = basePrice + optionsTotal + boatAmount;
    const dynamicBoatAmount = basePrice;

    // Création réservation
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        clientId: client?.id ?? null,
        serviceId,
        reservedAt: reserved,
        startTime: start,
        endTime: end,
        withCaptain,
        payableOnBoard: optionsTotal,
        boatAmount: dynamicBoatAmount,
        totalAmount,
        expiresAt: new Date(end.getTime() + 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        description,
        email: clientInfo?.email ?? "",
      },
    });

    // Lier options à la réservation
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
          amount: option.amount * quantity,
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
