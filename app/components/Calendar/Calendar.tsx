// ////////////////ici ok
// "use client";

// import React, { FC, useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";
// import { format, formatISO, isBefore, parse } from "date-fns";
// import type { Day } from "@prisma/client";
// import {
//   getOpeningTimes,
//   roundToNearestMinutes,
//   filterAvailableTimes,
// } from "@/utils/helpers";
// import { Interval, now } from "@/app/constants/config";
// import { DateTime } from "@/types";
// import { getBookedTimes } from "@/actions/bookings"; // ✅ Fonction pour récupérer les créneaux réservés
// import "react-calendar/dist/Calendar.css";
// import "./Calendar.scss";

// const DynamicCalendar = React.memo(
//   dynamic(() => import("react-calendar"), { ssr: false })
// );

// interface CalendarProps {
//   days: Day[];
//   closedDays: string[];
// }

// const Calendar: FC<CalendarProps> = ({ days, closedDays }) => {
//   const router = useRouter();
//   const [date, setDate] = useState<DateTime>({
//     justDate: null,
//     dateTime: null,
//   });
//   const [bookedTimes, setBookedTimes] = useState<Date[]>([]); // ✅ Stocke les créneaux réservés

//   // Récupérer les créneaux réservés quand `date.justDate` change
//   // useEffect(() => {
//   //   const fetchBookedTimes = async () => {
//   //     if (date.justDate) {
//   //       try {
//   //         const booked = await getBookedTimes(formatISO(date.justDate)); // ⬅️ Demande les réservations pour cette date
//   //         setBookedTimes(booked.map((time) => new Date(time))); // ✅ Convertir en objets Date
//   //       } catch (error) {
//   //         console.error("Erreur lors de la récupération des créneaux :", error);
//   //       }
//   //     }
//   //   };

//   //   fetchBookedTimes();
//   // }, [date.justDate]);
//   useEffect(() => {
//     const fetchBookedTimes = async () => {
//       if (date.justDate) {
//         const booked = await getBookedTimes(formatISO(date.justDate));
//         setBookedTimes(booked.map((time) => new Date(time)));
//       }
//     };

//     fetchBookedTimes();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [date.dateTime]); // 🔥 Met à jour après sélection d'un créneau

//   // Vérifier si aujourd’hui est fermé
//   const today = days.find((day) => day.dayOfWeek === now.getDay());
//   const rounded = roundToNearestMinutes(now, Interval);
//   const closing = today ? parse(today.closeTime, "kk:mm", now) : null;
//   const tooLate = closing ? !isBefore(rounded, closing) : false;

//   if (tooLate) {
//     const todayISO = formatISO(new Date().setHours(0, 0, 0, 0));
//     if (!closedDays.includes(todayISO)) closedDays.push(todayISO);
//   }

//   // Sauvegarde et redirection une fois l’heure sélectionnée
//   useEffect(() => {
//     if (date.dateTime) {
//       console.log("Selected date and time:", date.dateTime);
//       localStorage.setItem("selectedTime", date.dateTime.toISOString());
//       router.push("/serviceList");
//     }
//   }, [date.dateTime, router]);

//   // Obtenir les créneaux disponibles et filtrer ceux qui sont déjà réservés
//   const availableTimes = date.justDate
//     ? getOpeningTimes(date.justDate, days)
//     : [];
//   const filteredTimes = filterAvailableTimes(availableTimes, bookedTimes); // ✅ Filtrage ici

//   return (
//     <div className="calendar_container">
//       {date.justDate ? (
//         <div className="time">
//           {filteredTimes.length > 0 ? (
//             filteredTimes.map((time, index) => (
//               <div className="time_bloc" key={`time-${index}`}>
//                 <button
//                   className="btn_times"
//                   onClick={() =>
//                     setDate((prev) => ({ ...prev, dateTime: time }))
//                   }
//                   type="button"
//                   aria-label={`Sélectionner l'heure ${format(time, "kk:mm")}`}
//                 >
//                   {format(time, "kk:mm")}
//                 </button>
//               </div>
//             ))
//           ) : (
//             <p>Aucune plage horaire disponible pour cette date.</p>
//           )}
//         </div>
//       ) : (
//         <DynamicCalendar
//           minDate={now}
//           className="REACT-CALENDAR p-2"
//           view="month"
//           tileDisabled={({ date }) => closedDays.includes(formatISO(date))}
//           tileClassName={({ date }) =>
//             closedDays.includes(formatISO(date)) ? "closed-day" : ""
//           }
//           onClickDay={(date, e) => {
//             e.preventDefault();
//             const dayIso = formatISO(date);
//             if (!closedDays.includes(dayIso)) {
//               setDate((prev) => ({ ...prev, justDate: date }));
//             }
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Calendar;

// "use client";

// import React, { FC, useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";
// import { format, formatISO, isBefore, parse } from "date-fns";
// import type { Day } from "@prisma/client";
// import { getOpeningTimes, roundToNearestMinutes } from "@/utils/helpers";
// import { Interval, now } from "@/app/constants/config";
// import { DateTime } from "@/types";
// import "react-calendar/dist/Calendar.css";
// import "./Calendar.scss";

// const DynamicCalendar = React.memo(
//   dynamic(() => import("react-calendar"), { ssr: false })
// );

// interface CalendarProps {
//   days: Day[];
//   closedDays: string[];
// }

// const Calendar: FC<CalendarProps> = ({ days, closedDays }) => {
//   const router = useRouter();

//   // State for selected date and time
//   const [date, setDate] = useState<DateTime>({
//     justDate: null,
//     dateTime: null,
//   });

//   // Determine if today is closed
//   const today = days.find((day) => day.dayOfWeek === now.getDay());
//   const rounded = roundToNearestMinutes(now, Interval);
//   const closing = today ? parse(today.closeTime, "kk:mm", now) : null;
//   const tooLate = closing ? !isBefore(rounded, closing) : false;

//   if (tooLate) {
//     const todayISO = formatISO(new Date().setHours(0, 0, 0, 0));
//     if (!closedDays.includes(todayISO)) closedDays.push(todayISO);
//   }

//   // Update localStorage and navigate to the service page when a time is selected
//   useEffect(() => {
//     if (date.dateTime) {
//       // Affiche l'heure sélectionnée avant de la stocker
//       console.log("Selected date and time:", date.dateTime);

//       localStorage.setItem("selectedTime", date.dateTime.toISOString());
//       router.push("/serviceList");
//     }
//   }, [date.dateTime, router]);

//   // Get available times for the selected day
//   const times = date.justDate && getOpeningTimes(date.justDate, days);

//   return (
//     <div className="calendar_container">
//       {date.justDate ? (
//         // Render available times
//         <div className="time">
//           {times && times.length > 0 ? (
//             times.map((time, index) => (
//               <div className="time_bloc" key={`time-${index}`}>
//                 <button
//                   className="btn_times"
//                   onClick={() =>
//                     setDate((prev) => ({ ...prev, dateTime: time }))
//                   }
//                   type="button"
//                   aria-label={`Select time ${format(time, "kk:mm")}`}
//                 >
//                   {format(time, "kk:mm")}
//                 </button>
//               </div>
//             ))
//           ) : (
//             <p>Aucune plage horaire disponible pour cette date.</p>
//           )}
//         </div>
//       ) : (
//         <DynamicCalendar
//           minDate={now}
//           className="REACT-CALENDAR p-2"
//           view="month"
//           tileDisabled={({ date }) => closedDays.includes(formatISO(date))}
//           tileClassName={({ date }) =>
//             closedDays.includes(formatISO(date)) ? "closed-day" : ""
//           }
//           onClickDay={(date, e) => {
//             e.preventDefault();
//             const dayIso = formatISO(date);
//             if (closedDays.includes(dayIso)) {
//               // Jour fermé, aucun toast
//             } else {
//               setDate((prev) => ({ ...prev, justDate: date }));
//             }
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Calendar;

////////test1
// "use client";

// import React, { FC, useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";
// import { format, formatISO, isBefore, isAfter, parse, isEqual } from "date-fns";
// import type { Day } from "@prisma/client";
// import {
//   getOpeningTimes,
//   roundToNearestMinutes,
//   filterAvailableTimes,
// } from "@/utils/helpers";
// import { Interval, now } from "@/app/constants/config";
// import { DateTime } from "@/types";
// import { getBookedTimes } from "@/actions/bookings"; // ✅ Fonction pour récupérer les créneaux réservés
// import "react-calendar/dist/Calendar.css";
// import "./Calendar.scss";

// const DynamicCalendar = React.memo(
//   dynamic(() => import("react-calendar"), { ssr: false })
// );

// interface CalendarProps {
//   days: Day[];
//   closedDays: string[];
// }

// const Calendar: FC<CalendarProps> = ({ days, closedDays }) => {
//   const router = useRouter();
//   const [date, setDate] = useState<DateTime>({
//     justDate: null,
//     dateTime: null,
//   });
//   const [bookedTimes, setBookedTimes] = useState<Date[]>([]); // ✅ Stocke les créneaux réservés
//   const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null); // Pour stocker l'heure de début sélectionnée
//   const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null); // Pour stocker l'heure de fin sélectionnée

//   // Récupérer les créneaux réservés quand `date.justDate` change
//   useEffect(() => {
//     const fetchBookedTimes = async () => {
//       if (date.justDate) {
//         try {
//           const booked = await getBookedTimes(formatISO(date.justDate)); // ⬅️ Demande les réservations pour cette date
//           setBookedTimes(booked.map((time) => new Date(time))); // ✅ Convertir en objets Date
//         } catch (error) {
//           console.error("Erreur lors de la récupération des créneaux :", error);
//         }
//       }
//     };

//     fetchBookedTimes();
//   }, [date.justDate]);

//   // Vérifier si aujourd’hui est fermé
//   const today = days.find((day) => day.dayOfWeek === now.getDay());
//   const rounded = roundToNearestMinutes(now, Interval);
//   const closing = today ? parse(today.closeTime, "kk:mm", now) : null;
//   const tooLate = closing ? !isBefore(rounded, closing) : false;

//   if (tooLate) {
//     const todayISO = formatISO(new Date().setHours(0, 0, 0, 0));
//     if (!closedDays.includes(todayISO)) closedDays.push(todayISO);
//   }

//   // Sauvegarde et redirection une fois l’heure sélectionnée
//   useEffect(() => {
//     if (selectedStartTime && selectedEndTime) {
//       console.log("Selected start time:", selectedStartTime);
//       console.log("Selected end time:", selectedEndTime);
//       // Sauvegarder dans localStorage, si nécessaire
//       localStorage.setItem(
//         "selectedStartTime",
//         selectedStartTime.toISOString()
//       );
//       localStorage.setItem("selectedEndTime", selectedEndTime.toISOString());
//       router.push("/serviceList");
//     }
//   }, [selectedStartTime, selectedEndTime, router]);

//   // Obtenir les créneaux disponibles et filtrer ceux qui sont déjà réservés
//   const availableTimes = date.justDate
//     ? getOpeningTimes(date.justDate, days)
//     : [];
//   const filteredTimes = filterAvailableTimes(availableTimes, bookedTimes); // ✅ Filtrage des créneaux de début

//   // Filtrer les heures de fin disponibles en fonction de l'heure de début sélectionnée
//   const availableEndTimes = selectedStartTime
//     ? filteredTimes.filter(
//         (time) =>
//           isAfter(time, selectedStartTime) && // S'assurer que l'heure de fin est après l'heure de début
//           !bookedTimes.some((booked) => isEqual(time, booked)) // Exclure les créneaux déjà réservés
//       )
//     : [];

//   return (
//     <div className="calendar_container">
//       {date.justDate ? (
//         <div className="time">
//           {selectedStartTime ? (
//             <>
//               <h3>Choisissez l&apos;heure de fin :</h3>
//               {availableEndTimes.length > 0 ? (
//                 availableEndTimes.map((time, index) => (
//                   <div className="time_bloc" key={`end-time-${index}`}>
//                     <button
//                       className="btn_times"
//                       onClick={() => setSelectedEndTime(time)}
//                       type="button"
//                       aria-label={`Sélectionner l'heure de fin ${format(time, "kk:mm")}`}
//                     >
//                       {format(time, "kk:mm")}
//                     </button>
//                   </div>
//                 ))
//               ) : (
//                 <p>
//                   Aucune plage horaire disponible pour la fin de la réservation.
//                 </p>
//               )}
//             </>
//           ) : (
//             <>
//               <h3>Choisissez l&apos;heure de début :</h3>
//               {filteredTimes.length > 0 ? (
//                 filteredTimes.map((time, index) => (
//                   <div className="time_bloc" key={`start-time-${index}`}>
//                     <button
//                       className="btn_times"
//                       onClick={() => setSelectedStartTime(time)}
//                       type="button"
//                       aria-label={`Sélectionner l'heure de début ${format(time, "kk:mm")}`}
//                     >
//                       {format(time, "kk:mm")}
//                     </button>
//                   </div>
//                 ))
//               ) : (
//                 <p>Aucune plage horaire disponible pour cette date.</p>
//               )}
//             </>
//           )}
//         </div>
//       ) : (
//         <DynamicCalendar
//           minDate={now}
//           className="REACT-CALENDAR p-2"
//           view="month"
//           tileDisabled={({ date }) => closedDays.includes(formatISO(date))}
//           tileClassName={({ date }) =>
//             closedDays.includes(formatISO(date)) ? "closed-day" : ""
//           }
//           onClickDay={(date, e) => {
//             e.preventDefault();
//             const dayIso = formatISO(date);
//             if (!closedDays.includes(dayIso)) {
//               setDate((prev) => ({ ...prev, justDate: date }));
//               setSelectedStartTime(null); // Réinitialiser l'heure de début
//               setSelectedEndTime(null); // Réinitialiser l'heure de fin
//             }
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Calendar;
//////////test 2
// "use client";

// import React, { FC, useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";
// import { format, formatISO, isBefore, isAfter, parse, isEqual } from "date-fns";
// import type { Day } from "@prisma/client";
// import {
//   getOpeningTimes,
//   roundToNearestMinutes,
//   filterAvailableTimes,
// } from "@/utils/helpers";
// import { Interval, now } from "@/app/constants/config";
// import { DateTime } from "@/types";
// import { getBookedTimes } from "@/actions/bookings"; // ✅ Fonction pour récupérer les créneaux réservés
// import "react-calendar/dist/Calendar.css";
// import "./Calendar.scss";

// const DynamicCalendar = React.memo(
//   dynamic(() => import("react-calendar"), { ssr: false })
// );

// interface CalendarProps {
//   days: Day[];
//   closedDays: string[];
// }

// const Calendar: FC<CalendarProps> = ({ days, closedDays }) => {
//   const router = useRouter();
//   const [date, setDate] = useState<DateTime>({
//     justDate: null,
//     dateTime: null,
//   });
//   const [bookedTimes, setBookedTimes] = useState<Date[]>([]); // ✅ Stocke les créneaux réservés
//   const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null); // Pour stocker l'heure de début sélectionnée
//   const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null); // Pour stocker l'heure de fin sélectionnée

//   // Récupérer les créneaux réservés quand `date.justDate` change
//   useEffect(() => {
//     const fetchBookedTimes = async () => {
//       if (date.justDate) {
//         try {
//           const booked = await getBookedTimes(formatISO(date.justDate)); // ⬅️ Demande les réservations pour cette date
//           setBookedTimes(booked.map((time) => new Date(time))); // ✅ Convertir en objets Date
//         } catch (error) {
//           console.error("Erreur lors de la récupération des créneaux :", error);
//         }
//       }
//     };

//     fetchBookedTimes();
//   }, [date.justDate]);

//   // Vérifier si aujourd’hui est fermé
//   const today = days.find((day) => day.dayOfWeek === now.getDay());
//   const rounded = roundToNearestMinutes(now, Interval);
//   const closing = today ? parse(today.closeTime, "kk:mm", now) : null;
//   const tooLate = closing ? !isBefore(rounded, closing) : false;

//   if (tooLate) {
//     const todayISO = formatISO(new Date().setHours(0, 0, 0, 0));
//     if (!closedDays.includes(todayISO)) closedDays.push(todayISO);
//   }

//   // Sauvegarde et redirection une fois l’heure sélectionnée
//   useEffect(() => {
//     if (selectedStartTime && selectedEndTime) {
//       console.log("Selected start time:", selectedStartTime);
//       console.log("Selected end time:", selectedEndTime);
//       // Sauvegarder dans localStorage, si nécessaire
//       localStorage.setItem(
//         "selectedStartTime",
//         selectedStartTime.toISOString()
//       );
//       localStorage.setItem("selectedEndTime", selectedEndTime.toISOString());
//       router.push("/serviceList");
//     }
//   }, [selectedStartTime, selectedEndTime, router]);

//   // Obtenir les créneaux disponibles et filtrer ceux qui sont déjà réservés
//   const availableTimes = date.justDate
//     ? getOpeningTimes(date.justDate, days)
//     : [];
//   const filteredTimes = filterAvailableTimes(availableTimes, bookedTimes); // ✅ Filtrage des créneaux de début

//   // Filtrer les heures de fin disponibles en fonction de l'heure de début sélectionnée
//   const availableEndTimes = selectedStartTime
//     ? filteredTimes.filter(
//         (time) =>
//           isAfter(time, selectedStartTime) && // S'assurer que l'heure de fin est après l'heure de début
//           !bookedTimes.some((booked) => isEqual(time, booked)) // Exclure les créneaux déjà réservés
//       )
//     : [];

//   return (
//     <div className="calendar_container">
//       {date.justDate ? (
//         <div className="time">
//           {selectedStartTime ? (
//             <>
//               <h3>Choisissez l&apos;heure de fin :</h3>
//               {availableEndTimes.length > 0 ? (
//                 availableEndTimes.map((time, index) => (
//                   <div className="time_bloc" key={`end-time-${index}`}>
//                     <button
//                       className="btn_times"
//                       onClick={() => setSelectedEndTime(time)}
//                       type="button"
//                       aria-label={`Sélectionner l'heure de début ${format(time, "kk:mm")}`}
//                     >
//                       {format(time, "kk:mm")}
//                     </button>
//                   </div>
//                 ))
//               ) : (
//                 <p>
//                   Aucune plage horaire disponible pour la fin de la réservation.
//                 </p>
//               )}
//             </>
//           ) : (
//             <>
//               <h3>Choisissez l&apos;heure de début :</h3>
//               {filteredTimes.length > 0 ? (
//                 filteredTimes.map((time, index) => (
//                   <div className="time_bloc" key={`start-time-${index}`}>
//                     <button
//                       className="btn_times"
//                       onClick={() => setSelectedStartTime(time)}
//                       type="button"
//                       aria-label={`Sélectionner l'heure de fin ${format(time, "kk:mm")}`}
//                     >
//                       {format(time, "kk:mm")}
//                     </button>
//                   </div>
//                 ))
//               ) : (
//                 <p>Aucune plage horaire disponible pour cette date.</p>
//               )}
//             </>
//           )}
//         </div>
//       ) : (
//         <DynamicCalendar
//           minDate={now}
//           className="REACT-CALENDAR p-2"
//           view="month"
//           tileDisabled={({ date }) =>
//             closedDays.includes(formatISO(new Date(date).setHours(0, 0, 0, 0)))
//           }
//           tileClassName={({ date }) =>
//             closedDays.includes(formatISO(new Date(date).setHours(0, 0, 0, 0)))
//               ? "closed-day"
//               : ""
//           }
//           onClickDay={(date, e) => {
//             e.preventDefault();
//             const dayIso = formatISO(date);
//             if (!closedDays.includes(dayIso)) {
//               setDate((prev) => ({ ...prev, justDate: date }));
//               setSelectedStartTime(null); // Réinitialiser l'heure de début
//               setSelectedEndTime(null); // Réinitialiser l'heure de fin
//             }
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Calendar;
// ///////test 3
// // "use client";

// // import React, { FC, useEffect, useState } from "react";
// // import dynamic from "next/dynamic";
// // import { useRouter } from "next/navigation";
// // import { format, formatISO, isBefore, isAfter, parse, isEqual } from "date-fns";
// // import type { Day } from "@prisma/client";
// // import {
// //   getOpeningTimes,
// //   roundToNearestMinutes,
// //   filterAvailableTimes,
// // } from "@/utils/helpers";
// // import { Interval, now } from "@/app/constants/config";
// // import { DateTime } from "@/types";
// // import { getBookedTimes } from "@/actions/bookings"; // ✅ Fonction pour récupérer les créneaux réservés
// // import "react-calendar/dist/Calendar.css";
// // import "./Calendar.scss";

// // const DynamicCalendar = React.memo(
// //   dynamic(() => import("react-calendar"), { ssr: false })
// // );

// // interface CalendarProps {
// //   days: Day[];
// //   closedDays: string[];
// // }

// // const Calendar: FC<CalendarProps> = ({ days, closedDays }) => {
// //   const router = useRouter();
// //   const [date, setDate] = useState<DateTime>({
// //     justDate: null,
// //     dateTime: null,
// //   });
// //   const [bookedTimes, setBookedTimes] = useState<Date[]>([]); // ✅ Stocke les créneaux réservés
// //   const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null); // Pour stocker l'heure de début sélectionnée
// //   const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null); // Pour stocker l'heure de fin sélectionnée

// //   // Récupérer les créneaux réservés quand `date.justDate` change
// //   useEffect(() => {
// //     const fetchBookedTimes = async () => {
// //       if (date.justDate) {
// //         try {
// //           const booked = await getBookedTimes(formatISO(date.justDate)); // ⬅️ Demande les réservations pour cette date
// //           setBookedTimes(booked.map((time) => new Date(time))); // ✅ Convertir en objets Date
// //         } catch (error) {
// //           console.error("Erreur lors de la récupération des créneaux :", error);
// //         }
// //       }
// //     };

// //     fetchBookedTimes();
// //   }, [date.justDate]);

// //   // Vérifier si aujourd’hui est fermé
// //   const today = days.find((day) => day.dayOfWeek === now.getDay());
// //   const rounded = roundToNearestMinutes(now, Interval);
// //   const closing = today ? parse(today.closeTime, "kk:mm", now) : null;
// //   const tooLate = closing ? !isBefore(rounded, closing) : false;

// //   if (tooLate) {
// //     const todayISO = formatISO(new Date().setHours(0, 0, 0, 0));
// //     if (!closedDays.includes(todayISO)) closedDays.push(todayISO);
// //   }

// //   // Sauvegarde et redirection une fois l’heure sélectionnée
// //   useEffect(() => {
// //     if (selectedStartTime && selectedEndTime) {
// //       console.log("Selected start time:", selectedStartTime);
// //       console.log("Selected end time:", selectedEndTime);
// //       // Sauvegarder dans localStorage, si nécessaire
// //       localStorage.setItem(
// //         "selectedStartTime",
// //         selectedStartTime.toISOString()
// //       );
// //       localStorage.setItem("selectedEndTime", selectedEndTime.toISOString());
// //       router.push("/serviceList");
// //     }
// //   }, [selectedStartTime, selectedEndTime, router]);

// //   // Obtenir les créneaux disponibles et filtrer ceux qui sont déjà réservés
// //   const availableTimes = date.justDate
// //     ? getOpeningTimes(date.justDate, days)
// //     : [];
// //   const filteredTimes = filterAvailableTimes(availableTimes, bookedTimes); // ✅ Filtrage des créneaux de début

// //   // Logique de filtrage des créneaux de début et de fin (évite les créneaux réservés entiers)
// //   const validFilteredTimes = filteredTimes.filter(
// //     (startTime) =>
// //       !bookedTimes.some((bookedStartTime) => {
// //         const bookedEndTime = new Date(bookedStartTime);
// //         bookedEndTime.setMinutes(bookedEndTime.getMinutes() + Interval); // Ajuste l'heure de fin avec l'intervalle

// //         // Si l'heure de début est à l'intérieur d'une plage réservée, on l'exclut
// //         return (
// //           isBefore(bookedStartTime, startTime) &&
// //           isBefore(startTime, bookedEndTime)
// //         );
// //       })
// //   );

// //   // Filtrer les heures de fin disponibles en fonction de l'heure de début sélectionnée
// //   const availableEndTimes = selectedStartTime
// //     ? filteredTimes.filter(
// //         (time) =>
// //           isAfter(time, selectedStartTime) && // Doit être après l'heure de début sélectionnée
// //           !bookedTimes.some((bookedStartTime) => {
// //             const bookedEndTime = new Date(bookedStartTime);
// //             bookedEndTime.setMinutes(bookedEndTime.getMinutes() + Interval);

// //             // Vérifie si l'heure de fin est dans une plage réservée
// //             return (
// //               isBefore(bookedStartTime, time) && isBefore(time, bookedEndTime)
// //             );
// //           })
// //       )
// //     : [];

// //   return (
// //     <div className="calendar_container">
// //       {date.justDate ? (
// //         <div className="time">
// //           {selectedStartTime ? (
// //             <>
// //               <h3>Choisissez l&apos;heure de fin :</h3>
// //               {availableEndTimes.length > 0 ? (
// //                 availableEndTimes.map((time, index) => (
// //                   <div className="time_bloc" key={`end-time-${index}`}>
// //                     <button
// //                       className="btn_times"
// //                       onClick={() => setSelectedEndTime(time)}
// //                       type="button"
// //                       aria-label={`Sélectionner l'heure de fin ${format(time, "kk:mm")}`}
// //                     >
// //                       {format(time, "kk:mm")}
// //                     </button>
// //                   </div>
// //                 ))
// //               ) : (
// //                 <p>
// //                   Aucune plage horaire disponible pour la fin de la réservation.
// //                 </p>
// //               )}
// //             </>
// //           ) : (
// //             <>
// //               <h3>Choisissez l&apos;heure de début :</h3>
// //               {validFilteredTimes.length > 0 ? (
// //                 validFilteredTimes.map((time, index) => (
// //                   <div className="time_bloc" key={`start-time-${index}`}>
// //                     <button
// //                       className="btn_times"
// //                       onClick={() => setSelectedStartTime(time)}
// //                       type="button"
// //                       aria-label={`Sélectionner l'heure de début ${format(time, "kk:mm")}`}
// //                     >
// //                       {format(time, "kk:mm")}
// //                     </button>
// //                   </div>
// //                 ))
// //               ) : (
// //                 <p>Aucune plage horaire disponible pour la réservation.</p>
// //               )}
// //             </>
// //           )}
// //         </div>
// //       ) : (
// //         <DynamicCalendar
// //           minDate={now}
// //           className="REACT-CALENDAR p-2"
// //           view="month"
// //           tileDisabled={({ date }) => {
// //             const dayIso = formatISO(date);
// //             const isClosedDay = closedDays.includes(dayIso); // Vérifier si le jour est fermé
// //             const isBooked = bookedTimes.some((booked) => {
// //               const bookedStartTime = new Date(booked); // Heure de début de la réservation
// //               const bookedEndTime = new Date(booked); // Heure de fin de la réservation
// //               bookedEndTime.setMinutes(bookedEndTime.getMinutes() + Interval); // Ajuste la durée pour l'heure de fin

// //               // Si le jour est réservé (même heure de début ou chevauchement avec une réservation existante)
// //               return (
// //                 isEqual(bookedStartTime, date) ||
// //                 (isBefore(bookedStartTime, date) &&
// //                   isAfter(bookedEndTime, date))
// //               );
// //             });
// //             return isClosedDay || isBooked; // Désactiver si réservé ou fermé
// //           }}
// //           tileClassName={({ date }) =>
// //             closedDays.includes(formatISO(date)) ? "closed-day" : ""
// //           }
// //           onClickDay={(date, e) => {
// //             e.preventDefault();
// //             const dayIso = formatISO(date);
// //             if (!closedDays.includes(dayIso)) {
// //               setDate((prev) => ({ ...prev, justDate: date }));
// //               setSelectedStartTime(null); // Réinitialiser l'heure de début
// //               setSelectedEndTime(null); // Réinitialiser l'heure de fin
// //             }
// //           }}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // export default Calendar;
// "use client";

// import React, { FC, useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";
// import { format, formatISO, isBefore, isAfter, parse, isEqual } from "date-fns";
// import type { Day } from "@prisma/client";
// import {
//   getOpeningTimes,
//   roundToNearestMinutes,
//   filterAvailableTimes,
// } from "@/utils/helpers";
// import { Interval, now } from "@/app/constants/config";
// import { DateTime } from "@/types";
// import { getBookedTimes } from "@/actions/bookings"; // ✅ Fonction pour récupérer les créneaux réservés
// import "react-calendar/dist/Calendar.css";
// import "./Calendar.scss";

// const DynamicCalendar = React.memo(
//   dynamic(() => import("react-calendar"), { ssr: false })
// );

// interface CalendarProps {
//   days: Day[];
//   closedDays: string[];
// }

// const Calendar: FC<CalendarProps> = ({ days, closedDays }) => {
//   const router = useRouter();
//   const [date, setDate] = useState<DateTime>({
//     justDate: null,
//     dateTime: null,
//   });
//   const [bookedTimes, setBookedTimes] = useState<Date[]>([]); // ✅ Stocke les créneaux réservés
//   const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null); // Pour stocker l'heure de début sélectionnée
//   const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null); // Pour stocker l'heure de fin sélectionnée

//   // Récupérer les créneaux réservés quand `date.justDate` change
//   // Vérifier si la date a changé et récupérer les créneaux réservés
//   useEffect(() => {
//     const fetchBookedTimes = async () => {
//       if (date.justDate) {
//         try {
//           const booked = await getBookedTimes(formatISO(date.justDate)); // Demander les réservations pour la date sélectionnée
//           setBookedTimes(booked.map((time) => new Date(time))); // Convertir en objets Date
//         } catch (error) {
//           console.error("Erreur lors de la récupération des créneaux :", error);
//         }
//       }
//     };

//     fetchBookedTimes();
//   }, [date.justDate]); // Redemander les créneaux réservés chaque fois que la date change
//   useEffect(() => {
//     // Vérifier si une nouvelle date est sélectionnée, si oui, mettre à jour localStorage
//     if (date.justDate) {
//       localStorage.removeItem("selectedStartTime"); // Réinitialiser le localStorage pour la nouvelle date
//       localStorage.removeItem("selectedEndTime");
//     }
//   }, [date.justDate]); // Ce `useEffect` sera appelé chaque fois que la date change

//   // Vérifier si aujourd’hui est fermé
//   const today = days.find((day) => day.dayOfWeek === now.getDay());
//   const rounded = roundToNearestMinutes(now, Interval);
//   const closing = today ? parse(today.closeTime, "kk:mm", now) : null;
//   const tooLate = closing ? !isBefore(rounded, closing) : false;

//   if (tooLate) {
//     const todayISO = formatISO(new Date().setHours(0, 0, 0, 0));
//     if (!closedDays.includes(todayISO)) closedDays.push(todayISO);
//   }

//   // Sauvegarde et redirection une fois l’heure sélectionnée
//   useEffect(() => {
//     if (selectedStartTime && selectedEndTime) {
//       console.log("Selected start time:", selectedStartTime);
//       console.log("Selected end time:", selectedEndTime);
//       // Sauvegarder dans localStorage, si nécessaire
//       localStorage.setItem(
//         "selectedStartTime",
//         selectedStartTime.toISOString()
//       );
//       localStorage.setItem("selectedEndTime", selectedEndTime.toISOString());
//       router.push("/serviceList");
//     }
//   }, [selectedStartTime, selectedEndTime, router]);

//   // Obtenir les créneaux disponibles et filtrer ceux qui sont déjà réservés
//   const availableTimes = date.justDate
//     ? getOpeningTimes(date.justDate, days)
//     : [];
//   const filteredTimes = filterAvailableTimes(availableTimes, bookedTimes); // ✅ Filtrage des créneaux de début

//   // Filtrer les heures de fin disponibles en fonction de l'heure de début sélectionnée
//   const availableEndTimes = selectedStartTime
//     ? filteredTimes.filter(
//         (time) =>
//           isAfter(time, selectedStartTime) && // S'assurer que l'heure de fin est après l'heure de début
//           !bookedTimes.some((booked) => isEqual(time, booked)) // Exclure les créneaux déjà réservés
//       )
//     : [];

//   return (
//     <div className="calendar_container">
//       {date.justDate ? (
//         <div className="time">
//           {selectedStartTime ? (
//             <>
//               <h3>Choisissez l&apos;heure de fin :</h3>
//               {availableEndTimes.length > 0 ? (
//                 availableEndTimes.map((time, index) => (
//                   <div className="time_bloc" key={`end-time-${index}`}>
//                     <button
//                       className="btn_times"
//                       onClick={() => setSelectedEndTime(time)}
//                       type="button"
//                       aria-label={`Sélectionner l'heure de fin ${format(time, "kk:mm")}`}
//                     >
//                       {format(time, "kk:mm")}
//                     </button>
//                   </div>
//                 ))
//               ) : (
//                 <p>
//                   Aucune plage horaire disponible pour la fin de la réservation.
//                 </p>
//               )}
//             </>
//           ) : (
//             <>
//               <h3>Choisissez l&apos;heure de début :</h3>
//               {filteredTimes.length > 0 ? (
//                 filteredTimes.map((time, index) => (
//                   <div className="time_bloc" key={`start-time-${index}`}>
//                     <button
//                       className="btn_times"
//                       onClick={() => setSelectedStartTime(time)}
//                       type="button"
//                       aria-label={`Sélectionner l'heure de début ${format(time, "kk:mm")}`}
//                     >
//                       {format(time, "kk:mm")}
//                     </button>
//                   </div>
//                 ))
//               ) : (
//                 <p>Aucune plage horaire disponible pour cette date.</p>
//               )}
//             </>
//           )}
//         </div>
//       ) : (
//         <DynamicCalendar
//           minDate={now}
//           className="REACT-CALENDAR p-2"
//           view="month"
//           tileDisabled={({ date }) => closedDays.includes(formatISO(date))}
//           tileClassName={({ date }) =>
//             closedDays.includes(formatISO(date)) ? "closed-day" : ""
//           }
//           onClickDay={(date, e) => {
//             e.preventDefault();
//             const dayIso = formatISO(date);
//             if (!closedDays.includes(dayIso)) {
//               setDate((prev) => ({ ...prev, justDate: date }));
//               setSelectedStartTime(null); // Réinitialiser l'heure de début
//               setSelectedEndTime(null); // Réinitialiser l'heure de fin
//             }
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Calendar;
// "use client";

// import React, { FC, useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";
// import { format, formatISO, isBefore, isAfter, parse, isEqual } from "date-fns";
// import type { Day } from "@prisma/client";
// import {
//   getOpeningTimes,
//   roundToNearestMinutes,
//   filterAvailableTimes,
// } from "@/utils/helpers";
// import { Interval, now } from "@/app/constants/config";
// import { DateTime } from "@/types";
// import { getBookedTimes } from "@/actions/bookings"; // ✅ Fonction pour récupérer les créneaux réservés
// import "react-calendar/dist/Calendar.css";
// import "./Calendar.scss";

// const DynamicCalendar = React.memo(
//   dynamic(() => import("react-calendar"), { ssr: false })
// );

// interface CalendarProps {
//   days: Day[];
//   closedDays: string[];
// }

// const Calendar: FC<CalendarProps> = ({ days, closedDays }) => {
//   const router = useRouter();
//   const [date, setDate] = useState<DateTime>({
//     justDate: null,
//     dateTime: null,
//   });
//   const [bookedTimes, setBookedTimes] = useState<Date[]>([]); // ✅ Stocke les créneaux réservés
//   const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null); // Pour stocker l'heure de début
//   const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null); // Pour stocker l'heure de fin

//   // Récupérer les créneaux réservés quand `date.justDate` change
//   useEffect(() => {
//     const fetchBookedTimes = async () => {
//       if (date.justDate) {
//         try {
//           const booked = await getBookedTimes(formatISO(date.justDate)); // ⬅️ Demander les réservations pour cette date
//           setBookedTimes(booked.map((time) => new Date(time))); // ✅ Convertir en objets Date
//         } catch (error) {
//           console.error("Erreur lors de la récupération des créneaux :", error);
//         }
//       }
//     };

//     fetchBookedTimes();
//   }, [date.justDate]);

//   // Vérifier si aujourd’hui est fermé
//   const today = days.find((day) => day.dayOfWeek === now.getDay());
//   const rounded = roundToNearestMinutes(now, Interval);
//   const closing = today ? parse(today.closeTime, "kk:mm", now) : null;
//   const tooLate = closing ? !isBefore(rounded, closing) : false;

//   if (tooLate) {
//     const todayISO = formatISO(new Date().setHours(0, 0, 0, 0));
//     if (!closedDays.includes(todayISO)) closedDays.push(todayISO);
//   }

//   // Sauvegarde et redirection une fois l’heure de début et de fin sélectionnée
//   useEffect(() => {
//     if (selectedStartTime && selectedEndTime) {
//       console.log("Selected start time:", selectedStartTime);
//       console.log("Selected end time:", selectedEndTime);
//       // Sauvegarder dans localStorage, si nécessaire
//       localStorage.setItem(
//         "selectedStartTime",
//         selectedStartTime.toISOString()
//       );
//       localStorage.setItem("selectedEndTime", selectedEndTime.toISOString());
//       router.push("/serviceList");
//     }
//   }, [selectedStartTime, selectedEndTime, router]);

//   // Obtenir les créneaux disponibles et filtrer ceux qui sont déjà réservés
//   const availableTimes = date.justDate
//     ? getOpeningTimes(date.justDate, days)
//     : [];
//   const filteredTimes = filterAvailableTimes(availableTimes, bookedTimes); // ✅ Filtrage des créneaux de début

//   // Filtrer les heures de fin disponibles en fonction de l'heure de début sélectionnée
//   const availableEndTimes = selectedStartTime
//     ? filteredTimes.filter(
//         (time) =>
//           isAfter(time, selectedStartTime) && // S'assurer que l'heure de fin est après l'heure de début
//           !bookedTimes.some((booked) => isEqual(time, booked)) // Exclure les créneaux déjà réservés
//       )
//     : [];

//   return (
//     <div className="calendar_container">
//       {date.justDate ? (
//         <div className="time">
//           {selectedStartTime ? (
//             <>
//               <h3>Choisissez l&apos;heure de fin :</h3>
//               {availableEndTimes.length > 0 ? (
//                 availableEndTimes.map((time, index) => (
//                   <div className="time_bloc" key={`end-time-${index}`}>
//                     <button
//                       className="btn_times"
//                       onClick={() => setSelectedEndTime(time)}
//                       type="button"
//                       aria-label={`Sélectionner l'heure de fin ${format(time, "kk:mm")}`}
//                     >
//                       {format(time, "kk:mm")}
//                     </button>
//                   </div>
//                 ))
//               ) : (
//                 <p>
//                   Aucune plage horaire disponible pour la fin de la réservation.
//                 </p>
//               )}
//             </>
//           ) : (
//             <>
//               <h3>Choisissez l&apos;heure de début :</h3>
//               {filteredTimes.length > 0 ? (
//                 filteredTimes.map((time, index) => (
//                   <div className="time_bloc" key={`start-time-${index}`}>
//                     <button
//                       className="btn_times"
//                       onClick={() => setSelectedStartTime(time)}
//                       type="button"
//                       aria-label={`Sélectionner l'heure de début ${format(time, "kk:mm")}`}
//                     >
//                       {format(time, "kk:mm")}
//                     </button>
//                   </div>
//                 ))
//               ) : (
//                 <p>Aucune plage horaire disponible pour cette date.</p>
//               )}
//             </>
//           )}
//         </div>
//       ) : (
//         <DynamicCalendar
//           minDate={now}
//           className="REACT-CALENDAR p-2"
//           view="month"
//           tileDisabled={({ date }) => closedDays.includes(formatISO(date))}
//           tileClassName={({ date }) =>
//             closedDays.includes(formatISO(date)) ? "closed-day" : ""
//           }
//           onClickDay={(date, e) => {
//             e.preventDefault();
//             const dayIso = formatISO(date);
//             if (!closedDays.includes(dayIso)) {
//               setDate((prev) => ({ ...prev, justDate: date }));
//               setSelectedStartTime(null); // Réinitialiser l'heure de début
//               setSelectedEndTime(null); // Réinitialiser l'heure de fin
//             }
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Calendar;
// "use client";

// import React, { FC, useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";
// import {
//   format,
//   formatISO,
//   isBefore,
//   isAfter,
//   parse,
//   addMinutes,
// } from "date-fns";
// import type { Day } from "@prisma/client";
// import {
//   getOpeningTimes,
//   roundToNearestMinutes,
//   filterAvailableTimes,
// } from "@/utils/helpers";
// import { Interval, now } from "@/app/constants/config";
// import { DateTime } from "@/types";
// import { getBookedTimes } from "@/actions/bookings";
// import "react-calendar/dist/Calendar.css";
// import "./Calendar.scss";

// const DynamicCalendar = React.memo(
//   dynamic(() => import("react-calendar"), { ssr: false })
// );

// interface CalendarProps {
//   days: Day[];
//   closedDays: string[];
// }

// const Calendar: FC<CalendarProps> = ({ days, closedDays }) => {
//   const router = useRouter();
//   const [date, setDate] = useState<DateTime>({
//     justDate: null,
//     dateTime: null,
//   });
//   const [bookedTimes, setBookedTimes] = useState<Date[]>([]);
//   const [selectedRanges, setSelectedRanges] = useState<
//     { startTime: Date; endTime: Date }[]
//   >([]);

//   useEffect(() => {
//     const fetchBookedTimes = async () => {
//       if (date.justDate) {
//         try {
//           const booked = await getBookedTimes(formatISO(date.justDate));
//           setBookedTimes(booked.map((time) => new Date(time)));
//         } catch (error) {
//           console.error("Erreur lors de la récupération des créneaux :", error);
//         }
//       }
//     };

//     fetchBookedTimes();
//   }, [date.justDate]);

//   const today = days.find((day) => day.dayOfWeek === now.getDay());
//   const rounded = roundToNearestMinutes(now, Interval);
//   const closing = today ? parse(today.closeTime, "kk:mm", now) : null;
//   const tooLate = closing ? !isBefore(rounded, closing) : false;

//   if (tooLate) {
//     const todayISO = formatISO(new Date().setHours(0, 0, 0, 0));
//     if (!closedDays.includes(todayISO)) closedDays.push(todayISO);
//   }

//   useEffect(() => {
//     if (selectedRanges.length > 0) {
//       console.log("Selected ranges:", selectedRanges);
//       // Sauvegarder dans localStorage, si nécessaire
//       localStorage.setItem("selectedRanges", JSON.stringify(selectedRanges));
//       router.push("/serviceList");
//     }
//   }, [selectedRanges, router]);

//   const availableTimes = date.justDate
//     ? getOpeningTimes(date.justDate, days)
//     : [];
//   const filteredTimes = filterAvailableTimes(availableTimes, bookedTimes);

//   const handleRangeSelect = (startTime: Date, endTime: Date) => {
//     const newRange = { startTime, endTime };

//     // Vérifier si la nouvelle plage chevauche une plage existante ou une réservation
//     const isOverlapping =
//       selectedRanges.some((range) => overlaps(range, newRange)) ||
//       bookedTimes.some((bookedTime) =>
//         overlaps(
//           { startTime: bookedTime, endTime: addMinutes(bookedTime, Interval) },
//           newRange
//         )
//       );

//     if (!isOverlapping) {
//       setSelectedRanges((prevRanges) => [...prevRanges, newRange]);
//     } else {
//       alert("Ce créneau n'est pas disponible.");
//     }
//   };

//   const overlaps = (
//     range1: { startTime: Date; endTime: Date },
//     range2: { startTime: Date; endTime: Date }
//   ) => {
//     return (
//       isBefore(range1.startTime, range2.endTime) &&
//       isAfter(range1.endTime, range2.startTime)
//     );
//   };

//   return (
//     <div className="calendar_container">
//       {date.justDate ? (
//         <div className="time">
//           <h3>Choisissez vos créneaux :</h3>
//           {filteredTimes.map((time, index) => (
//             <div className="time_bloc" key={`time-${index}`}>
//               <button
//                 className="btn_times"
//                 onClick={() => {
//                   const endTime = addMinutes(time, Interval);
//                   handleRangeSelect(time, endTime);
//                 }}
//                 type="button"
//                 aria-label={`Sélectionner le créneau ${format(time, "kk:mm")}`}
//               >
//                 {format(time, "kk:mm")} -{" "}
//                 {format(addMinutes(time, Interval), "kk:mm")}
//               </button>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <DynamicCalendar
//           minDate={now}
//           className="REACT-CALENDAR p-2"
//           view="month"
//           tileDisabled={({ date }) => closedDays.includes(formatISO(date))}
//           tileClassName={({ date }) =>
//             closedDays.includes(formatISO(date)) ? "closed-day" : ""
//           }
//           onClickDay={(date, e) => {
//             e.preventDefault();
//             const dayIso = formatISO(date);
//             if (!closedDays.includes(dayIso)) {
//               setDate((prev) => ({ ...prev, justDate: date }));
//               setSelectedRanges([]);
//             }
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Calendar;
"use client";

import React, { FC, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { format, formatISO, isBefore } from "date-fns";
import type { Day } from "@prisma/client";
import { getOpeningTimes, filterAvailableTimes } from "@/utils/helpers";
import { now } from "@/app/constants/config";
import { getBookedTimes } from "@/actions/bookings";
import "react-calendar/dist/Calendar.css";
import "./Calendar.scss";

const DynamicCalendar = React.memo(
  dynamic(() => import("react-calendar"), { ssr: false })
);

interface CalendarProps {
  days: Day[];
  closedDays: string[];
}

const Calendar: FC<CalendarProps> = ({ days, closedDays }) => {
  const router = useRouter();

  // ⏳ Stocker la date, heure de début et heure de fin sélectionnées
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [bookedTimes, setBookedTimes] = useState<{ start: Date; end: Date }[]>(
    []
  );

  // 📡 Charger les créneaux réservés pour la date sélectionnée
  useEffect(() => {
    const fetchBookedTimes = async () => {
      if (date) {
        try {
          const booked = await getBookedTimes(formatISO(date));
          setBookedTimes(
            booked.map(({ startTime, endTime }) => ({
              start: new Date(startTime),
              end: new Date(endTime),
            }))
          );
        } catch (error) {
          console.error(
            "❌ Erreur lors de la récupération des créneaux :",
            error
          );
        }
      }
    };

    fetchBookedTimes();
  }, [date]);

  // 📅 Obtenir les créneaux disponibles
  const availableTimes = date ? getOpeningTimes(date, days) : [];
  const filteredTimes = filterAvailableTimes(
    availableTimes,
    bookedTimes.map((b) => b.start)
  );

  const handleSelectTime = (time: Date) => {
    if (!startTime) {
      console.log("🕐 Sélection du startTime :", time);
      setStartTime(time);
      setEndTime(null);
    } else if (!endTime) {
      if (isBefore(startTime, time)) {
        console.log("⏳ Sélection du endTime :", time);
        setEndTime(time);
      } else {
        alert("🚫 L'heure de fin doit être après l'heure de début !");
      }
    }
  };

  // 🔄 Sauvegarde `startTime` et `endTime` dans localStorage + Redirection
  useEffect(() => {
    if (startTime && endTime) {
      localStorage.setItem("selectedStartTime", startTime.toISOString());
      localStorage.setItem("selectedEndTime", endTime.toISOString());
      router.push("/serviceList");
    }
  }, [startTime, endTime, router]);

  return (
    <div className="calendar_container">
      {date ? (
        <div className="time">
          <h3>Choisissez vos horaires :</h3>

          {/* Affichage des créneaux disponibles */}
          {filteredTimes.length > 0 ? (
            filteredTimes.map((time, index) => (
              <div className="time_bloc" key={`time-${index}`}>
                <button
                  className={`btn_times ${startTime === time ? "selected" : ""} ${
                    endTime === time ? "selected" : ""
                  }`}
                  onClick={() => handleSelectTime(time)}
                  type="button"
                >
                  {format(time, "kk:mm")}
                </button>
              </div>
            ))
          ) : (
            <p>Aucune plage horaire disponible pour cette date.</p>
          )}

          {/* Affichage du créneau sélectionné */}
          {startTime && endTime && (
            <p>
              Réservation de {format(startTime, "kk:mm")} à{" "}
              {format(endTime, "kk:mm")}
            </p>
          )}
        </div>
      ) : (
        <DynamicCalendar
          minDate={now}
          className="REACT-CALENDAR p-2"
          view="month"
          tileDisabled={({ date }) => closedDays.includes(formatISO(date))}
          tileClassName={({ date }) =>
            closedDays.includes(formatISO(date)) ? "closed-day" : ""
          }
          onClickDay={(date) => {
            if (!closedDays.includes(formatISO(date))) {
              setDate(date);
              setStartTime(null);
              setEndTime(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default Calendar;
