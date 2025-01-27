"use server";

import { prisma } from "@/lib/prisma";
import { validateCloseDayInput } from "@/utils/validation";
import { DayInput, CloseDayInput } from "@/types";
import { formatISO } from "date-fns";
import { Day } from "@prisma/client";

export async function getDays(): Promise<Day[]> {
  return await prisma.day.findMany();
}

// Gestion des jours fermés
export async function closeDay(input: CloseDayInput) {
  try {
    if (!input.date || isNaN(new Date(input.date).getTime())) {
      throw new Error("Invalid date provided");
    }

    const existingClosedDay = await prisma.closedDay.findUnique({
      where: { date: new Date(input.date) },
    });
    if (existingClosedDay) {
      throw new Error("Le jour est déjà fermé.");
    }

    return await prisma.closedDay.create({
      data: { date: new Date(input.date) },
    });
  } catch (error) {
    console.error("Erreur lors de la fermeture du jour :", error);
    throw error;
  }
}

// Ouvrir un jour précédemment fermé
export async function openDay(input: CloseDayInput) {
  const { date } = validateCloseDayInput(input);
  const existingClosedDay = await prisma.closedDay.findUnique({
    where: { date: new Date(date) },
  });

  if (!existingClosedDay) {
    throw new Error("Le jour n'est pas fermé ou n'existe pas.");
  }

  return prisma.closedDay.delete({ where: { id: existingClosedDay.id } });
}

// Fonction pour récupérer les jours fermés
export async function getClosedDays(): Promise<string[]> {
  try {
    const closedDays = await prisma.closedDay.findMany();
    return closedDays.map((d) => formatISO(d.date));
  } catch (error) {
    console.error("Erreur lors de la récupération des jours fermés :", error);
    throw new Error("Impossible de récupérer les jours fermés.");
  }
}

// Fonction pour récupérer les horaires d'ouverture
export async function getOpeningHours(): Promise<Day[]> {
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

export async function getOpeningAndClosedDays() {
  try {
    const days = await prisma.day.findMany({
      orderBy: { dayOfWeek: "asc" }, // Assurez-vous que les jours sont bien ordonnés
    });
    const closedDays = await prisma.closedDay.findMany();

    return {
      days: days.map((day) => ({
        id: day.id,
        name: day.name,
        dayOfWeek: day.dayOfWeek,
        openTime: day.openTime,
        closeTime: day.closeTime,
      })),
      closedDays: closedDays.map((d) => formatISO(d.date)),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
    throw new Error("Erreur lors de la récupération des données.");
  }
}

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
export async function getOpeningTimes(): Promise<Day[]> {
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
