"use server";

import { prisma } from "@/lib/prisma";
import { validateCloseDayInput } from "@/utils/validation";
import { DayInput, CloseDayInput } from "@/types";
import { formatISO } from "date-fns";

// Type pour un jour
type DayType = {
  id: string;
  name: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
};

// Fonction pour récupérer les jours
export async function getDays(): Promise<DayType[]> {
  return await prisma.day.findMany();
}

// Gestion des jours fermés
export async function closeDay(input: CloseDayInput) {
  try {
    const { date } = validateCloseDayInput(input); // Destructure validated date

    const existingClosedDay = await prisma.closedDay.findUnique({
      where: { date: new Date(date) }, // Use validated date
    });

    if (existingClosedDay) {
      return existingClosedDay; // Return existing record instead of throwing error
    }

    return await prisma.closedDay.create({
      data: { date: new Date(date) }, // Use validated date
    });
  } catch (error) {
    console.error("Erreur lors de la fermeture du jour :", error);
    throw error; // Re-throw the error for proper handling
  }
}

// Fonction pour ouvrir un jour
export async function openDay(input: CloseDayInput) {
  try {
    const { date } = validateCloseDayInput(input);

    const existingClosedDay = await prisma.closedDay.findUnique({
      where: { date: new Date(date) },
    });

    if (!existingClosedDay) {
      throw new Error("Le jour n'est pas fermé."); // More accurate message
    }

    return await prisma.closedDay.delete({
      where: { id: existingClosedDay.id },
    });
  } catch (error) {
    console.error("Erreur lors de l'ouverture du jour :", error);
    throw error;
  }
}

// Fonction pour récupérer les jours fermés
export async function getClosedDays(): Promise<string[]> {
  try {
    const closedDays = await prisma.closedDay.findMany();
    return closedDays.map((d: { date: Date }) => formatISO(d.date));
  } catch (error) {
    console.error("Erreur lors de la récupération des jours fermés :", error);
    throw new Error("Impossible de récupérer les jours fermés.");
  }
}

// Fonction pour récupérer les horaires d'ouverture
export async function getOpeningHours(): Promise<DayType[]> {
  try {
    const days = await prisma.day.findMany();
    if (days.length !== 7) {
      throw new Error("Insert all days into database");
    }
    return days;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des horaires d'ouverture :",
      error
    );
    throw new Error("Impossible de récupérer les horaires d'ouverture.");
  }
}

// Fonction pour mettre à jour les horaires d'ouverture
export async function updateOpeningHours(dayInputs: DayInput[]) {
  try {
    if (!dayInputs || dayInputs.length === 0) {
      throw new Error("No opening hours provided");
    }

    // Validation des champs requis
    dayInputs.forEach((dayInput) => {
      if (
        !dayInput.id ||
        dayInput.dayOfWeek == null ||
        !dayInput.openTime ||
        !dayInput.closeTime
      ) {
        throw new Error(
          `Invalid DayInput detected: ${JSON.stringify(dayInput)}`
        );
      }
    });

    const promises = dayInputs.map(async (dayInput) => {
      const { id, dayOfWeek, openTime, closeTime } = dayInput;

      return await prisma.day.upsert({
        where: { id },
        update: { openTime, closeTime },
        create: {
          id,
          dayOfWeek,
          openTime,
          closeTime,
          name: weekdayIndexToName(dayOfWeek),
        },
      });
    });

    return await Promise.all(promises);
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour des horaires d'ouverture : ",
      error
    );
    throw error;
  }
}

// Fonction pour récupérer les jours ouverts et fermés
export async function getOpeningAndClosedDays() {
  try {
    const days = await prisma.day.findMany({
      orderBy: { dayOfWeek: "asc" }, // Assurez-vous que les jours sont bien ordonnés
    });
    const closedDays = await prisma.closedDay.findMany();

    return {
      days: days.map((day: DayType) => ({
        id: day.id,
        name: day.name,
        dayOfWeek: day.dayOfWeek,
        openTime: day.openTime,
        closeTime: day.closeTime,
      })),
      closedDays: closedDays.map((d: { date: Date }) => formatISO(d.date)),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
    throw new Error("Erreur lors de la récupération des données.");
  }
}

// Fonction pour convertir l'index du jour de la semaine en nom
function weekdayIndexToName(dayOfWeek: number): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  if (dayOfWeek < 0 || dayOfWeek > 6) {
    throw new Error("Invalid day of the week index.");
  }
  return days[dayOfWeek];
}

// Fonction pour récupérer les horaires d'ouverture
export async function getOpeningTimes(): Promise<DayType[]> {
  try {
    const days = await prisma.day.findMany();
    return days;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des horaires d'ouverture :",
      error
    );
    throw new Error("Impossible de récupérer les horaires d'ouverture.");
  }
}
