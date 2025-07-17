"use server";

import { prisma } from "@/lib/prisma";
import { validateCloseDayInput } from "@/utils/validation";
import { DayInput, CloseDayInput } from "@/types";
import { formatISO, startOfDay } from "date-fns";

// Type pour un jour (correspond au modèle Prisma Day)
type DayType = {
  id: string;
  name: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
};

// Fonction pour récupérer les jours (horaires d'ouverture)
export async function getDays(): Promise<DayType[]> {
  try {
    return await prisma.day.findMany();
  } catch (error) {
    console.error("Erreur lors de la récupération des jours:", error);
    throw new Error("Impossible de récupérer les jours.");
  }
}

// Fonction pour fermer un jour spécifique
export async function closeDay(input: CloseDayInput) {
  try {
    // La validation devrait s'assurer que 'date' est un objet Date ou une chaîne parsable.
    const validatedDate = validateCloseDayInput(input);
    const dateAtMidnightUTC = startOfDay(validatedDate.date); // Normalise à minuit UTC

    // Vérifier si le jour est déjà fermé
    const existingClosedDay = await prisma.closedDay.findUnique({
      where: { date: dateAtMidnightUTC },
    });

    if (existingClosedDay) {
      // Si le jour est déjà fermé, on peut simplement le retourner sans erreur
      console.warn(
        `Le jour ${dateAtMidnightUTC.toISOString()} est déjà marqué comme fermé.`
      );
      return existingClosedDay;
    }

    // Créer une nouvelle entrée pour le jour fermé
    return await prisma.closedDay.create({
      data: { date: dateAtMidnightUTC },
    });
  } catch (error) {
    console.error("Erreur lors de la fermeture du jour :", error);
    // Relancer l'erreur pour que le client puisse la gérer
    throw error;
  }
}

// Fonction pour ouvrir un jour spécifique (le retirer des jours fermés)
export async function openDay(input: CloseDayInput) {
  try {
    const validatedDate = validateCloseDayInput(input);
    const dateAtMidnightUTC = startOfDay(validatedDate.date); // Normalise à minuit UTC

    // Trouver l'entrée du jour fermé à supprimer
    const existingClosedDay = await prisma.closedDay.findUnique({
      where: { date: dateAtMidnightUTC },
    });

    if (!existingClosedDay) {
      // Si le jour n'est pas fermé, lancer une erreur spécifique
      console.warn(
        `Tentative d'ouvrir un jour non fermé: ${dateAtMidnightUTC.toISOString()}`
      );
      throw new Error("Le jour n'est pas fermé.");
    }

    // Supprimer l'entrée du jour fermé
    return await prisma.closedDay.delete({
      where: { id: existingClosedDay.id },
    });
  } catch (error) {
    console.error("Erreur lors de l'ouverture du jour :", error);
    throw error;
  }
}

// Fonction pour récupérer les jours fermés sous forme de chaînes 'YYYY-MM-DD'
export async function getClosedDays(): Promise<string[]> {
  try {
    const closedDays = await prisma.closedDay.findMany();
    // CORRECTION MAJEURE : Formater la date en 'YYYY-MM-DD' pour correspondre au client
    return closedDays.map((d) =>
      formatISO(startOfDay(d.date), { representation: "date" })
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des jours fermés :", error);
    throw new Error("Impossible de récupérer les jours fermés.");
  }
}

// Fonction pour récupérer les horaires d'ouverture (utilisée par ManageOpeningHours)
export async function getOpeningHours(): Promise<DayType[]> {
  try {
    const days = await prisma.day.findMany();
    // Optionnel : vérifier si tous les 7 jours sont présents.

    if (days.length !== 7) {
      console.warn(
        "Seulement " +
          days.length +
          " jours trouvés. Assurez-vous que tous les 7 jours sont insérés dans la base de données."
      );
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
      throw new Error("Aucun horaire d'ouverture fourni pour la mise à jour.");
    }

    // Validation des champs requis pour chaque DayInput
    dayInputs.forEach((dayInput) => {
      if (
        !dayInput.id ||
        dayInput.dayOfWeek == null ||
        !dayInput.openTime ||
        !dayInput.closeTime
      ) {
        throw new Error(
          `DayInput invalide détecté: ${JSON.stringify(dayInput)}. Champs manquants.`
        );
      }
      // Validations supplémentaires si openTime/closeTime doivent être dans un format spécifique HH:mm
      if (
        !/^\d{2}:\d{2}$/.test(dayInput.openTime) ||
        !/^\d{2}:\d{2}$/.test(dayInput.closeTime)
      ) {
        throw new Error(
          `Format d'heure invalide pour ${dayInput.name || dayInput.id}. Attendu HH:mm.`
        );
      }
    });

    // Utilisation de upsert pour créer ou mettre à jour.
    const promises = dayInputs.map(async (dayInput) => {
      const { id, dayOfWeek, openTime, closeTime } = dayInput;

      return await prisma.day.upsert({
        where: { id }, // Utilise l'ID pour trouver/créer
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

// Fonction pour récupérer les jours ouverts et fermés (utilisée par le dashboard principal si besoin)
export async function getOpeningAndClosedDays() {
  try {
    const days = await prisma.day.findMany({
      orderBy: { dayOfWeek: "asc" },
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
      // CORRECTION : Formater la date en 'YYYY-MM-DD'
      closedDays: closedDays.map((d) =>
        formatISO(startOfDay(d.date), { representation: "date" })
      ),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
    throw new Error("Erreur lors de la récupération des données.");
  }
}

// Fonction utilitaire pour convertir l'index du jour de la semaine en nom
function weekdayIndexToName(dayOfWeek: number): string {
  const days = [
    "Dimanche", // 0
    "Lundi", // 1
    "Mardi", // 2
    "Mercredi", // 3
    "Jeudi", // 4
    "Vendredi", // 5
    "Samedi", // 6
  ];
  if (dayOfWeek < 0 || dayOfWeek > 6) {
    console.error(`Index de jour de la semaine invalide: ${dayOfWeek}`);
    return "Jour Inconnu"; // Fallback robuste
  }
  return days[dayOfWeek];
}

// Fonction getOpeningTimes pour récupérer les horaires d'ouverture
export async function getOpeningTimes(): Promise<DayType[]> {
  try {
    const days = await prisma.day.findMany();
    return days;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des horaires d'ouverture (getOpeningTimes) :",
      error
    );
    throw new Error("Impossible de récupérer les horaires d'ouverture.");
  }
}
