import { addMinutes, getMinutes, isBefore, isEqual, format } from "date-fns";
import { fr } from "date-fns/locale";
import { DayInput } from "@/types";
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

export const weekdayIndexToName = (index: number): string => {
  const testDate = new Date(2024, 0, index + 1); // Janvier 2024, pour tester chaque jour
  return format(testDate, "EEEE", { locale: fr }); // ✅ Retourne le jour en français
};

// Fonction pour arrondir une date au prochain intervalle (par défaut 30 minutes)
export const roundToNearestMinutes = (
  date: Date,
  interval: number = Interval
): Date => {
  const minutesLeftUntilNextInterval = interval - (getMinutes(date) % interval);
  return addMinutes(date, minutesLeftUntilNextInterval);
};

// export const getOpeningTimes = (startDate: Date, dbDays: Day[]): Date[] => {
//   const dayOfWeek = startDate.getDay();
//   const isToday = isEqual(startDate, new Date(new Date().setHours(0, 0, 0, 0)));

//   // Trouver les horaires correspondants au jour sélectionné dans la base de données
//   const today = dbDays.find((d) => d.dayOfWeek === dayOfWeek);

//   // Si aucun horaire n'est trouvé pour ce jour, utiliser les horaires par défaut
//   const openingTime = today ? today.openTime : Service_opening_time;
//   const closingTime = today ? today.closeTime : Service_closing_time;

//   // Convertir les horaires d'ouverture et de fermeture en objets Date
//   // const opening = parse(`${openingTime}:00`, "HH:mm:ss", startDate);
//   // const closing = parse(`${closingTime}:00`, "HH:mm:ss", startDate);
//   const parseHour = (time: string | number) => {
//     if (typeof time === "number") return [time, 0]; // Ex: 8 devient [8, 0]
//     const parts = time.split(":");
//     return [parseInt(parts[0]), parseInt(parts[1]) || 0]; // Ex: "08:30" devient [8, 30]
//   };

//   const [openHour, openMinute] = parseHour(openingTime);
//   const [closeHour, closeMinute] = parseHour(closingTime);

//   const opening = new Date(startDate);
//   opening.setHours(openHour, openMinute, 0);

//   const closing = new Date(startDate);
//   closing.setHours(closeHour, closeMinute, 0);

//   // Vérification des horaires pour le jour actuel
//   let startTime: Date;
//   if (isToday) {
//     const roundedNow = roundToNearestMinutes(new Date(), Interval);

//     // Vérifier si l'heure actuelle est trop tardive pour réserver
//     if (!isBefore(roundedNow, closing)) {
//       console.warn("⏳ Plus aucun créneau disponible aujourd'hui.");
//       return []; // Renvoie une liste vide au lieu de lever une erreur
//     }

//     // Définir l'heure de départ comme maintenant ou l'ouverture
//     startTime = isBefore(roundedNow, opening) ? opening : roundedNow;
//   } else {
//     startTime = opening;
//   }

//   const endTime = closing;

//   // Générer les créneaux horaires entre startTime et endTime
//   const times: Date[] = [];
//   for (
//     let time = startTime;
//     isBefore(time, endTime) || isEqual(time, endTime);
//     time = addMinutes(time, Interval)
//   ) {
//     times.push(time);
//   }

//   return times;
// };
export const getOpeningTimes = (
  startDate: Date,
  dbDays: DayInput[]
): Date[] => {
  const dayOfWeek = startDate.getDay();
  const isToday = isEqual(startDate, new Date(new Date().setHours(0, 0, 0, 0)));

  // Trouver les horaires correspondants au jour sélectionné dans la base de données
  const today = dbDays.find((d) => d.dayOfWeek === dayOfWeek);

  // Si aucun horaire n'est trouvé pour ce jour, utiliser les horaires par défaut
  const openingTime = today ? today.openTime : Service_opening_time;
  const closingTime = today ? today.closeTime : Service_closing_time;

  // Convertir les horaires d'ouverture et de fermeture en objets Date
  const parseHour = (time: string | number) => {
    if (typeof time === "number") return [time, 0]; // Ex: 8 devient [8, 0]
    const parts = time.split(":");
    return [parseInt(parts[0]), parseInt(parts[1]) || 0]; // Ex: "08:30" devient [8, 30]
  };

  const [openHour, openMinute] = parseHour(openingTime);
  const [closeHour, closeMinute] = parseHour(closingTime);

  const opening = new Date(startDate);
  opening.setHours(openHour, openMinute, 0);

  const closing = new Date(startDate);
  closing.setHours(closeHour, closeMinute, 0);

  let startTime: Date;
  if (isToday) {
    const roundedNow = roundToNearestMinutes(new Date(), Interval);

    // Vérifier si l'heure actuelle est trop tardive pour réserver
    if (!isBefore(roundedNow, closing)) {
      console.warn("⏳ Plus aucun créneau disponible aujourd'hui.");
      return []; // Renvoie une liste vide au lieu de lever une erreur
    }

    startTime = isBefore(roundedNow, opening) ? opening : roundedNow;
  } else {
    startTime = opening;
  }

  const endTime = closing;

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
export const filterAvailableTimes = (
  availableTimes: Date[],
  bookedTimes: Date[]
): Date[] => {
  return availableTimes.filter(
    (time) => !bookedTimes.some((booked) => time.getTime() === booked.getTime())
  );
};
