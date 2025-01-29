import { addMinutes, getMinutes, isBefore, isEqual, parse } from "date-fns";
import { Day } from "@prisma/client";
import {
  categories,
  Service_closing_time,
  Service_opening_time,
  Interval,
} from "@/app/constants/config";

// Fonction pour capitaliser la première lettre d'une chaîne
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
// Les categories de services
export const selectOptions = categories.map((category) => ({
  value: category,
  label: capitalize(category),
}));
// Fonction pour convertir un index de jour en nom de jour
export const weekdayIndexToName = (index: number): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[index] || "Invalid day";
};

// Fonction pour arrondir une date au prochain intervalle (par défaut 30 minutes)
export const roundToNearestMinutes = (
  date: Date,
  interval: number = Interval
): Date => {
  const minutesLeftUntilNextInterval = interval - (getMinutes(date) % interval);
  return addMinutes(date, minutesLeftUntilNextInterval);
};

export const getOpeningTimes = (startDate: Date, dbDays: Day[]): Date[] => {
  const dayOfWeek = startDate.getDay();
  const isToday = isEqual(startDate, new Date().setHours(0, 0, 0, 0));

  // Trouver les horaires correspondants au jour sélectionné dans la base de données
  const today = dbDays.find((d) => d.dayOfWeek === dayOfWeek);

  // Si aucun horaire n'est trouvé pour ce jour, utiliser les horaires par défaut
  const openingTime = today ? today.openTime : Service_opening_time;
  const closingTime = today ? today.closeTime : Service_closing_time;

  // Convertir les horaires d'ouverture et de fermeture en objets Date
  const opening = parse(`${openingTime}:00`, "HH:mm:ss", startDate);
  const closing = parse(`${closingTime}:00`, "HH:mm:ss", startDate);

  // Vérification des horaires pour le jour actuel
  let startTime: Date;
  if (isToday) {
    const roundedNow = roundToNearestMinutes(new Date(), Interval);

    // Vérifier si l'heure actuelle est trop tardive pour réserver
    if (!isBefore(roundedNow, closing)) {
      throw new Error("No more bookings available for today.");
    }

    // Définir l'heure de départ comme maintenant ou l'ouverture
    startTime = isBefore(roundedNow, opening) ? opening : roundedNow;
  } else {
    startTime = opening;
  }

  const endTime = closing;

  // Générer les créneaux horaires entre startTime et endTime
  const times: Date[] = [];
  for (
    let time = startTime;
    isBefore(time, endTime) || isEqual(time, endTime);
    time = addMinutes(time, Interval)
  ) {
    times.push(time);
  }

  return times;
};
