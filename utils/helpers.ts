// import { ServiceHours } from "@/type";
// import { isBefore, parse, isValid } from "date-fns";

// // Fonction pour récupérer les horaires d'ouverture pour un jour spécifique
// export const getOpeningTimes = (
//   selectedDate: Date,
//   days: ServiceHours[]
// ): ServiceHours[] => {
//   const dayOfWeek = selectedDate.getDay(); // 0 = dimanche, 1 = lundi, etc.
//   const day = days.find((d) => d.dayOfWeek === weekdayIndexToName(dayOfWeek)); // Mapper l'index au nom du jour

//   if (!day || !day.opening || !day.closing) {
//     return []; // Retourner un tableau vide si les horaires ne sont pas définis
//   }

//   const openTime = parse(day.opening.toString(), "HH:mm", selectedDate);
//   const closeTime = parse(day.closing.toString(), "HH:mm", selectedDate);

//   if (!isValid(openTime) || !isValid(closeTime)) {
//     return []; // Si les horaires sont invalides
//   }

//   const times: ServiceHours[] = [];
//   let currentTime = openTime;
//   let id = 1; // Id initial, à ajuster selon la logique spécifique

//   // Ajouter les créneaux horaires (par exemple chaque 30 minutes)
//   while (isBefore(currentTime, closeTime)) {
//     times.push({
//       id, // Exemple d'id, vous pouvez le générer selon vos besoins
//       dayOfWeek: weekdayIndexToName(dayOfWeek),
//       opening: currentTime.getHours(), // Heure d'ouverture pour ce créneau
//       closing: currentTime.getHours() + 1, // Ajustez en fonction de la durée du créneau
//       isClosed: day.isClosed, // Prendre l'état "isClosed" du jour
//       createdAt: new Date(), // Ajout de createdAt et updatedAt comme placeholders
//       updatedAt: new Date(),
//     });

//     currentTime = new Date(currentTime.getTime() + 30 * 60000); // Ajouter 30 minutes
//     id++; // Incrémenter l'id
//   }

//   return times;
// };

// // Fonction pour capitaliser la première lettre d'une chaîne
// export const capitalize = (str: string): string => {
//   if (!str) return str;
//   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
// };

// // Fonction pour convertir un index de jour (0 = dimanche, 1 = lundi, ...) en nom de jour
// export const weekdayIndexToName = (index: number): string => {
//   const days = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//   ];
//   return days[index] || "Invalid day";
// };
/////////////////////:
// import { ServiceHours } from "@/type";
// import {
//   addMinutes,
//   getHours,
//   getMinutes,
//   isBefore,
//   isEqual,
//   parse,
//   isValid,
// } from "date-fns";

// // Fonction pour capitaliser la première lettre d'une chaîne
// export const capitalize = (str: string): string => {
//   if (!str) return str;
//   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
// };

// // Fonction pour convertir un index de jour (0 = dimanche, 1 = lundi, ...) en nom de jour
// export const weekdayIndexToName = (index: number): string => {
//   const days = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//   ];
//   return days[index] || "Invalid day";
// };

// // Fonction pour arrondir une date au prochain intervalle (exemple : 30 minutes)
// export const roundToNearestMinutes = (date: Date, interval: number): Date => {
//   const minutesLeftUntilNextInterval = interval - (getMinutes(date) % interval);
//   return addMinutes(date, minutesLeftUntilNextInterval);
// };

// // Fonction principale pour récupérer les créneaux horaires
// export const getOpeningTimes = (
//   selectedDate: Date,
//   days: ServiceHours[],
//   interval: number = 30 // Par défaut, un créneau de 30 minutes
// ): ServiceHours[] => {
//   const dayOfWeek = selectedDate.getDay(); // 0 = dimanche, 1 = lundi, etc.
//   const day = days.find((d) => d.dayOfWeek === weekdayIndexToName(dayOfWeek)); // Trouver le jour correspondant

//   if (!day || !day.opening || !day.closing || day.isClosed) {
//     return []; // Si le jour est fermé ou non défini
//   }

//   const openTime = parse(day.opening.toString(), "HH:mm", selectedDate);
//   const closeTime = parse(day.closing.toString(), "HH:mm", selectedDate);

//   if (!isValid(openTime) || !isValid(closeTime)) {
//     return []; // Si les horaires sont invalides
//   }

//   const times: ServiceHours[] = [];
//   const now = new Date();
//   const isToday = isEqual(
//     selectedDate.setHours(0, 0, 0, 0),
//     now.setHours(0, 0, 0, 0)
//   );

//   let currentTime = isToday
//     ? roundToNearestMinutes(now, interval) // Si c'est aujourd'hui, commencer à partir du prochain intervalle
//     : openTime;

//   let id = 1; // Id initial, peut être généré dynamiquement selon vos besoins

//   while (isBefore(currentTime, closeTime)) {
//     const currentHours = getHours(currentTime);
//     const currentMinutes = getMinutes(currentTime);

//     times.push({
//       id,
//       dayOfWeek: weekdayIndexToName(dayOfWeek),
//       opening: currentHours + currentMinutes / 60, // Convertir en heure décimale
//       closing: currentHours + (currentMinutes + interval) / 60, // Ajouter l'intervalle
//       isClosed: day.isClosed,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });

//     currentTime = addMinutes(currentTime, interval); // Passer au créneau suivant
//     id++;
//   }

//   return times;
// };
////////////:
// import { ServiceHours } from "@/type";
// import {
//   Service_opening_time,
//   Service_closing_time,
//   Interval,
// } from "@/app/constants/config";

// import { addMinutes, getHours, getMinutes, isBefore, isEqual } from "date-fns";

// // Fonction pour capitaliser la première lettre d'une chaîne
// export const capitalize = (str: string): string => {
//   if (!str) return str;
//   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
// };

// // Fonction pour convertir un index de jour (0 = dimanche, 1 = lundi, ...) en nom de jour
// export const weekdayIndexToName = (index: number): string => {
//   const days = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//   ];
//   return days[index] || "Invalid day";
// };

// // Fonction pour arrondir une date au prochain intervalle (par défaut 30 minutes)
// export const roundToNearestMinutes = (
//   date: Date,
//   interval: number = Interval
// ): Date => {
//   const minutesLeftUntilNextInterval = interval - (getMinutes(date) % interval);
//   return addMinutes(date, minutesLeftUntilNextInterval);
// };

// // Fonction principale pour récupérer les créneaux horaires
// export const getOpeningTimes = (
//   selectedDate: Date,
//   days: ServiceHours[], // Le tableau de ServiceHours
//   interval: number = Interval // Utilisation de l'intervalle défini dans constants/config.ts
// ): ServiceHours[] => {
//   const dayOfWeek = selectedDate.getDay(); // 0 = dimanche, 1 = lundi, etc.

//   // Trouver le jour correspondant dans le tableau days
//   const dayName = weekdayIndexToName(dayOfWeek); // "Monday", "Tuesday", etc.
//   const day = days.find((d) => d.dayOfWeek === dayName); // Trouver le jour correspondant

//   if (!day || day.isClosed) {
//     return []; // Si le jour est fermé ou non défini
//   }

//   // Utiliser les heures d'ouverture et de fermeture directement
//   const openTime = new Date(selectedDate);
//   openTime.setHours(day.opening, 0, 0, 0); // Heure d'ouverture (en heure entière)

//   const closeTime = new Date(selectedDate);
//   closeTime.setHours(day.closing, 0, 0, 0); // Heure de fermeture (en heure entière)

//   const times: ServiceHours[] = [];
//   const now = new Date();
//   const isToday = isEqual(
//     selectedDate.setHours(0, 0, 0, 0),
//     now.setHours(0, 0, 0, 0)
//   );

//   let currentTime = isToday
//     ? roundToNearestMinutes(now, interval) // Si c'est aujourd'hui, commencer à partir du prochain intervalle
//     : openTime;

//   let id = 1; // Id initial, peut être généré dynamiquement selon vos besoins

//   // On utilise Service_opening_time et Service_closing_time pour limiter les créneaux horaires
//   const openingTime = new Date(selectedDate);
//   openingTime.setHours(Service_opening_time, 0, 0, 0); // Heure d'ouverture à 8h (Service_opening_time)

//   const closingTime = new Date(selectedDate);
//   closingTime.setHours(Service_closing_time, 0, 0, 0); // Heure de fermeture à 20h (Service_closing_time)

//   currentTime = isBefore(currentTime, openingTime) ? openingTime : currentTime;

//   while (
//     isBefore(currentTime, closingTime) &&
//     isBefore(currentTime, closeTime)
//   ) {
//     const currentHours = getHours(currentTime);
//     const currentMinutes = getMinutes(currentTime);

//     times.push({
//       id,
//       dayOfWeek: dayName, // Utiliser le nom du jour au lieu de l'index
//       opening: currentHours + currentMinutes / 60, // Convertir en heure décimale
//       closing: currentHours + (currentMinutes + interval) / 60, // Ajouter l'intervalle
//       isClosed: day.isClosed,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });

//     currentTime = addMinutes(currentTime, interval); // Passer au créneau suivant
//     id++;
//   }

//   return times;
// };
import { ServiceHours } from "@/type";
import {
  Service_opening_time,
  Service_closing_time,
  Interval,
} from "@/app/constants/config";
import { addMinutes, getHours, getMinutes, isBefore, isEqual } from "date-fns";

// Fonction pour capitaliser la première lettre d'une chaîne
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Fonction pour convertir un index de jour (0 = dimanche, 1 = lundi, ...) en nom de jour
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

// Fonction principale pour récupérer les créneaux horaires
export const getOpeningTimes = (
  selectedDate: Date,
  days: ServiceHours[], // Le tableau de ServiceHours
  interval: number = Interval // Utilisation de l'intervalle défini dans constants/config.ts
): ServiceHours[] => {
  if (!days || days.length === 0) {
    throw new Error("Le tableau des jours (days) est vide ou non défini.");
  }

  const dayOfWeek = selectedDate.getDay(); // 0 = dimanche, 1 = lundi, etc.

  // Trouver le jour correspondant dans le tableau 'days'
  const dayName = weekdayIndexToName(dayOfWeek); // "Monday", "Tuesday", etc.
  const day = days.find((d) => d.dayOfWeek === dayName); // Trouver le jour correspondant

  if (!day || day.isClosed) {
    return []; // Si le jour est fermé ou non défini
  }

  // Utiliser les heures d'ouverture et de fermeture directement
  const openTime = new Date(selectedDate);
  openTime.setHours(day.opening, 0, 0, 0); // Heure d'ouverture (en heure entière)

  const closeTime = new Date(selectedDate);
  closeTime.setHours(day.closing, 0, 0, 0); // Heure de fermeture (en heure entière)

  const times: ServiceHours[] = [];
  const now = new Date();
  const isToday = isEqual(
    selectedDate.setHours(0, 0, 0, 0),
    now.setHours(0, 0, 0, 0)
  );

  let currentTime = isToday
    ? roundToNearestMinutes(now, interval) // Si c'est aujourd'hui, commencer à partir du prochain intervalle
    : openTime;

  let id = 1; // Id initial, peut être généré dynamiquement selon vos besoins

  // Limiter l'intervalle à l'heure d'ouverture et de fermeture (de 8h à 20h par exemple)
  const openingTime = new Date(selectedDate);
  openingTime.setHours(Service_opening_time, 0, 0, 0); // Heure d'ouverture à 8h (Service_opening_time)

  const closingTime = new Date(selectedDate);
  closingTime.setHours(Service_closing_time, 0, 0, 0); // Heure de fermeture à 20h (Service_closing_time)

  currentTime = isBefore(currentTime, openingTime) ? openingTime : currentTime;

  while (isBefore(currentTime, closingTime)) {
    const currentHours = getHours(currentTime);
    const currentMinutes = getMinutes(currentTime);

    times.push({
      id,
      dayOfWeek: dayName, // Utiliser le nom du jour au lieu de l'index
      opening: currentHours + currentMinutes / 60, // Convertir en heure décimale
      closing: currentHours + (currentMinutes + interval) / 60, // Ajouter l'intervalle
      isClosed: day.isClosed,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    currentTime = addMinutes(currentTime, interval); // Passer au créneau suivant
    id++;
  }

  return times;
};
