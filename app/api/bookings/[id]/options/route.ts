import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface OptionInput {
  optionId: string;
  quantity: number;
}

export const PUT = async (
  req: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const params = await context.params;
  const bookingId = Number(params.id);

  if (isNaN(bookingId)) {
    return NextResponse.json(
      { success: false, error: "Invalid booking ID" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const options: OptionInput[] = body.options;

    if (
      !Array.isArray(options) ||
      options.some(
        (opt) =>
          typeof opt.optionId !== "string" ||
          typeof opt.quantity !== "number" ||
          opt.quantity < 0
      )
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid options data" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.bookingOption.deleteMany({ where: { bookingId } });

      const optionIds = options.map((opt) => opt.optionId);
      const dbOptions = await tx.option.findMany({
        where: { id: { in: optionIds } },
      });

      const bookingOptionsToCreate = options
        .filter((opt) => opt.quantity > 0)
        .map((opt) => {
          const dbOpt = dbOptions.find((o) => o.id === opt.optionId);
          if (!dbOpt) throw new Error(`Option not found: ${opt.optionId}`);

          return {
            bookingId,
            optionId: opt.optionId,
            quantity: opt.quantity,
            unitPrice: dbOpt.unitPrice,
            amount: dbOpt.unitPrice * opt.quantity,
            label: dbOpt.label,
            description: dbOpt.description ?? null,
          };
        });

      if (bookingOptionsToCreate.length > 0) {
        await tx.bookingOption.createMany({ data: bookingOptionsToCreate });
      }

      const totalOptionsAmount = bookingOptionsToCreate.reduce(
        (acc, o) => acc + o.amount,
        0
      );

      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        select: { serviceId: true },
      });
      if (!booking) throw new Error("Booking not found");

      const service = await tx.service.findUnique({
        where: { id: booking.serviceId ?? "" },
        select: { price: true, defaultPrice: true, isFixed: true },
      });
      if (!service) throw new Error("Service not found");

      const basePrice = service.isFixed ? service.price : service.defaultPrice;
      const newTotalAmount = basePrice + totalOptionsAmount;

      await tx.booking.update({
        where: { id: bookingId },
        data: { totalAmount: newTotalAmount },
      });

      return newTotalAmount;
    });

    return NextResponse.json({ success: true, totalAmount: result });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
};
