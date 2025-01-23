// actions/openingActions.server.js
"use server";

import { prisma } from "@/lib/prisma";
import { ServiceHours } from "@/type";
import { formatISO } from "date-fns";

type DateInput = {
  date: Date;
};

// Valide le format des données d'horaires d'ouverture envoyées en entrée.
export async function validateServiceHoursInput(input: unknown): Promise<void> {
  if (
    !Array.isArray(input) ||
    !input.every(
      (day) =>
        typeof day.id === "number" &&
        typeof day.dayOfWeek === "string" &&
        typeof day.opening === "number" &&
        typeof day.closing === "number" &&
        typeof day.isClosed === "boolean"
    )
  ) {
    throw new Error(
      "Invalid input for service hours. Ensure it matches the expected structure."
    );
  }
}

// Valide le format de la date d'entrée.
export async function validateDateInput(input: DateInput) {
  if (!input || !(input.date instanceof Date)) {
    throw new Error(
      "Invalid input for date. Ensure it contains a valid Date object."
    );
  }
}

// Crée ou met à jour les horaires d'ouverture en fonction de l'existence d'horaires précédents pour le jour de la semaine donné.
export async function createServiceHours(
  input: ServiceHours[]
): Promise<ServiceHours[]> {
  await validateServiceHoursInput(input);

  const createdServiceHours = await Promise.all(
    input.map(async (day) => {
      const existingServiceHours = await prisma.serviceHours.findUnique({
        where: {
          dayOfWeek: day.dayOfWeek,
        },
      });

      if (existingServiceHours) {
        return prisma.serviceHours.update({
          where: {
            dayOfWeek: day.dayOfWeek,
          },
          data: {
            opening: day.opening,
            closing: day.closing,
            isClosed: day.isClosed,
          },
        });
      } else {
        return prisma.serviceHours.create({
          data: {
            dayOfWeek: day.dayOfWeek,
            opening: day.opening,
            closing: day.closing,
            isClosed: day.isClosed,
          },
        });
      }
    })
  );

  return createdServiceHours;
}

// Met à jour les horaires d'ouverture existants
export async function changeOpeningHours(
  input: ServiceHours[]
): Promise<ServiceHours[]> {
  validateServiceHoursInput(input);

  const updatedDays = await Promise.all(
    input.map((day) =>
      prisma.serviceHours.update({
        where: { id: day.id },
        data: {
          opening: day.opening,
          closing: day.closing,
          isClosed: day.isClosed,
        },
      })
    )
  );

  return updatedDays;
}

// Marque un jour spécifique comme fermé.
export async function closeDay(input: DateInput): Promise<void> {
  validateDateInput(input);

  const existing = await prisma.closedDay.findUnique({
    where: { date: input.date },
  });

  if (existing) {
    throw new Error("Le jour est déjà marqué comme fermé.");
  }

  await prisma.closedDay.create({ data: { date: input.date } });
}

// Supprime le marquage d'un jour fermé, l'ouvrant à nouveau
export async function openDay(input: DateInput): Promise<void> {
  validateDateInput(input);

  const existing = await prisma.closedDay.findUnique({
    where: { date: input.date },
  });

  if (!existing) {
    throw new Error("Le jour n'est pas fermé ou n'existe pas.");
  }

  await prisma.closedDay.delete({ where: { id: existing.id } });
}

// Récupère la liste des jours fermés sous forme de chaînes ISO.
export async function getClosedDays(): Promise<string[]> {
  try {
    const closedDays = await prisma.closedDay.findMany();
    return closedDays.map((day) => formatISO(day.date));
  } catch {
    throw new Error("Erreur lors de la récupération des jours fermés.");
  }
}

// Récupère les horaires d'ouverture de la base de données et effectue une validation supplémentaire pour garantir leur format correct.
export async function getOpeningHours(): Promise<ServiceHours[]> {
  try {
    const serviceHours = await prisma.serviceHours.findMany();

    // Valider les données récupérées
    if (!validateDays(serviceHours)) {
      throw new Error("Invalid service hours format from database.");
    }

    return serviceHours;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des horaires d'ouverture :",
      error
    );
    throw new Error("Erreur lors de la récupération des horaires d'ouverture.");
  }
}

function validateDays(days: ServiceHours[]): boolean {
  return (
    Array.isArray(days) &&
    days.every(
      (day) =>
        day &&
        typeof day.dayOfWeek === "string" &&
        typeof day.opening === "number" &&
        typeof day.closing === "number" &&
        typeof day.isClosed === "boolean"
    )
  );
}
