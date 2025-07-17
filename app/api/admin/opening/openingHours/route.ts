// app/api/opening/openingHours/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatISO } from "date-fns";

type ClosedDayType = {
  date: Date;
};

export async function GET() {
  try {
    const days = await prisma.day.findMany();
    console.log("Days retrieved:", days);
    if (days.length !== 7) {
      return NextResponse.json(
        { error: "Insert all days into database" },
        { status: 400 }
      );
    }

    const closedDays = await prisma.closedDay.findMany();

    const closedDaysISO = closedDays.map((d: ClosedDayType) =>
      formatISO(d.date)
    );
    console.log("Closed days retrieved:", closedDaysISO);

    return NextResponse.json(
      { days, closedDays: closedDaysISO },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des horaires d'ouverture :",
      error
    );
    return NextResponse.json(
      { error: "Impossible de récupérer les horaires d'ouverture." },
      { status: 500 }
    );
  }
}
