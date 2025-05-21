// "use client";

// import React, { FC, useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";
// import { format, formatISO, isBefore } from "date-fns";
// import { DayInput } from "@/types";
// import { getOpeningTimes, filterAvailableTimes } from "@/utils/helpers";
// import { now } from "@/app/constants/config";
// import { getBookedTimes } from "@/actions/bookings";
// // Styles
// import "react-calendar/dist/Calendar.css";
// import "./Calendar.scss";

// const DynamicCalendar = React.memo(
//   dynamic(() => import("react-calendar"), { ssr: false })
// );

// interface CalendarProps {
//   days: DayInput[]; // Utiliser DayInput au lieu de Day
//   closedDays: string[];
// }

// interface BookedTime {
//   start: Date;
//   end: Date;
// }

// const Calendar: FC<CalendarProps> = ({ days, closedDays }) => {
//   const router = useRouter();

//   // ⏳ Stocker la date, heure de début et heure de fin sélectionnées
//   const [date, setDate] = useState<Date | null>(null);
//   const [startTime, setStartTime] = useState<Date | null>(null);
//   const [endTime, setEndTime] = useState<Date | null>(null);
//   const [bookedTimes, setBookedTimes] = useState<BookedTime[]>([]); // Type correctement défini

//   // 📡 Charger les créneaux réservés pour la date sélectionnée
//   useEffect(() => {
//     const fetchBookedTimes = async () => {
//       if (date) {
//         try {
//           const booked = await getBookedTimes(formatISO(date));
//           setBookedTimes(
//             booked.map(({ startTime, endTime }) => ({
//               start: new Date(startTime),
//               end: new Date(endTime),
//             }))
//           );
//         } catch (error) {
//           console.error(
//             "❌ Erreur lors de la récupération des créneaux :",
//             error
//           );
//         }
//       }
//     };

//     fetchBookedTimes();
//   }, [date]);

//   // 📅 Obtenir les créneaux disponibles
//   const availableTimes = date ? getOpeningTimes(date, days) : [];
//   const filteredTimes = filterAvailableTimes(availableTimes, bookedTimes);

//   const handleSelectTime = (time: Date) => {
//     if (!startTime) {
//       console.log("🕐 Sélection du startTime :", time);
//       setStartTime(time);
//       setEndTime(null);
//     } else if (!endTime) {
//       if (isBefore(startTime, time)) {
//         console.log("⏳ Sélection du endTime :", time);
//         setEndTime(time);
//       } else {
//         alert("🚫 L'heure de fin doit être après l'heure de début !");
//       }
//     }
//   };

//   return (
//     <div className="calendar_container">
//       {!date ? (
//         <>
//           <h3>Choisissez une date:</h3>
//           <DynamicCalendar
//             minDate={now}
//             className="REACT-CALENDAR p-2"
//             view="month"
//             tileDisabled={({ date }) =>
//               Array.isArray(closedDays) && closedDays.includes(formatISO(date))
//             }
//             tileClassName={({ date }) =>
//               Array.isArray(closedDays) && closedDays.includes(formatISO(date))
//                 ? "closed-day"
//                 : ""
//             }
//             onClickDay={(date) => {
//               if (!closedDays.includes(formatISO(date))) {
//                 setDate(date);
//                 setStartTime(null);
//                 setEndTime(null);
//               }
//             }}
//           />
//         </>
//       ) : (
//         <div className="time">
//           <h3>Choisissez vos horaires :</h3>

//           {/* Affichage des créneaux disponibles */}
//           {filteredTimes.length > 0 ? (
//             filteredTimes.map((time, index) => (
//               <div className="time_bloc" key={`time-${index}`}>
//                 <button
//                   className={`btn_times ${startTime === time ? "selected" : ""} ${
//                     endTime === time ? "selected" : ""
//                   }`}
//                   onClick={() => handleSelectTime(time)}
//                   type="button"
//                 >
//                   {format(time, "kk:mm")}
//                 </button>
//               </div>
//             ))
//           ) : (
//             <p>Aucune plage horaire disponible pour cette date.</p>
//           )}

//           {/* Affichage du créneau sélectionné */}
//           {startTime && endTime && (
//             <p>
//               Réservation de {format(startTime, "kk:mm")} à{" "}
//               {format(endTime, "kk:mm")}
//             </p>
//           )}

//           {/* Bouton de confirmation */}
//           {startTime && endTime && (
//             <div>
//               <button
//                 className="btn_confirm"
//                 onClick={() =>
//                   router.push(
//                     `/serviceList?start=${startTime.toISOString()}&end=${endTime.toISOString()}`
//                   )
//                 }
//               >
//                 Confirmer mes choix
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Calendar;
// "use client";

// import React, { FC, useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";
// import { format, formatISO, isBefore, isAfter } from "date-fns";
// import { DayInput } from "@/types";
// import { getOpeningTimes, filterAvailableTimes } from "@/utils/helpers";
// import { now } from "@/app/constants/config";
// import { getBookedTimes } from "@/actions/bookings";
// // Styles
// import "react-calendar/dist/Calendar.css";
// import "./Calendar.scss";

// // Utilisation de React.memo et dynamic pour un chargement optimisé du calendrier
// const DynamicCalendar = React.memo(
//   dynamic(() => import("react-calendar"), { ssr: false })
// );

// interface CalendarProps {
//   days: DayInput[];
//   closedDays: string[];
// }

// interface BookedTime {
//   start: Date;
//   end: Date;
// }

// const Calendar: FC<CalendarProps> = ({ days, closedDays }) => {
//   const router = useRouter();

//   const [date, setDate] = useState<Date | null>(null);
//   const [startTime, setStartTime] = useState<Date | null>(null);
//   const [endTime, setEndTime] = useState<Date | null>(null);
//   const [bookedTimes, setBookedTimes] = useState<BookedTime[]>([]);
//   const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(false);
//   const [bookingError, setBookingError] = useState<string | null>(null);
//   // Nouvel état pour le message d'instruction à l'utilisateur
//   const [instructionMessage, setInstructionMessage] = useState<string>("");

//   // Effet pour récupérer les créneaux déjà réservés lorsque la date change
//   useEffect(() => {
//     const fetchBookingsForDate = async () => {
//       if (date) {
//         setIsLoadingBookings(true);
//         setBookingError(null);
//         try {
//           const booked = await getBookedTimes(formatISO(date));
//           setBookedTimes(
//             booked.map(({ startTime, endTime }) => ({
//               start: new Date(startTime),
//               end: new Date(endTime),
//             }))
//           );
//         } catch (error) {
//           console.error(
//             "\u274C Erreur lors de la r\u00e9cup\u00e9ration des cr\u00e9neaux :",
//             error
//           );
//           setBookingError(
//             "Une erreur est survenue lors du chargement des réservations."
//           );
//           setBookedTimes([]); // Réinitialise les créneaux réservés en cas d'erreur
//         } finally {
//           setIsLoadingBookings(false);
//         }
//       } else {
//         setBookedTimes([]); // Réinitialise si aucune date n'est sélectionnée
//       }
//     };
//     fetchBookingsForDate();
//   }, [date]);

//   // Met à jour le message d'instruction en fonction de l'état de sélection
//   useEffect(() => {
//     if (!date) {
//       setInstructionMessage("Choisissez une date :");
//     } else if (!startTime) {
//       setInstructionMessage("Sélectionnez votre heure de début :");
//     } else if (!endTime) {
//       setInstructionMessage("Sélectionnez votre heure de fin :");
//     } else {
//       setInstructionMessage("Confirmez votre créneau :");
//     }
//   }, [date, startTime, endTime]);

//   // Calcul des horaires disponibles et filtrés
//   const availableTimes = date ? getOpeningTimes(date, days) : [];
//   const filteredTimes = filterAvailableTimes(availableTimes, bookedTimes);

//   // Gère la sélection des heures de début et de fin
//   const handleSelectTime = (time: Date) => {
//     if (!startTime) {
//       // Si aucune heure de début n'est sélectionnée, définir celle-ci
//       setStartTime(time);
//       setEndTime(null); // S'assurer que l'heure de fin est réinitialisée
//     } else if (!endTime) {
//       // Si une heure de début est sélectionnée mais pas de fin
//       if (isAfter(time, startTime)) {
//         // Vérifier que l'heure de fin est bien après l'heure de début
//         setEndTime(time);
//       } else {
//         alert(
//           "\u274C L'heure de fin doit \u00eatre apr\u00e8s l'heure de d\u00e9but !"
//         );
//       }
//     } else {
//       // Si les deux sont déjà sélectionnés, permet de recommencer la sélection
//       setStartTime(time);
//       setEndTime(null);
//     }
//   };

//   // Vérifie si un créneau horaire est compris dans la plage sélectionnée
//   const isInRange = (time: Date) =>
//     startTime && endTime && isAfter(time, startTime) && isBefore(time, endTime);

//   return (
//     <div className="calendar_container">
//       <h3>{instructionMessage}</h3> {/* Message d'instruction dynamique */}
//       {!date ? (
//         <DynamicCalendar
//           minDate={now} // Empêche la sélection de dates passées
//           className="REACT-CALENDAR p-2"
//           view="month"
//           tileDisabled={({ date }) =>
//             // Désactive les tuiles pour les jours fermés
//             Array.isArray(closedDays) && closedDays.includes(formatISO(date))
//           }
//           tileClassName={({ date }) =>
//             // Applique une classe CSS aux jours fermés
//             Array.isArray(closedDays) && closedDays.includes(formatISO(date))
//               ? "closed-day"
//               : ""
//           }
//           onClickDay={(date) => {
//             // Ne sélectionne la date que si elle n'est pas un jour fermé
//             if (!closedDays.includes(formatISO(date))) {
//               setDate(date);
//               setStartTime(null);
//               setEndTime(null);
//             }
//           }}
//         />
//       ) : (
//         <div className="time_selection_area">
//           {isLoadingBookings ? (
//             <p>Chargement des créneaux disponibles...</p>
//           ) : bookingError ? (
//             <p className="error-message">{bookingError}</p>
//           ) : filteredTimes.length > 0 ? (
//             <div className="time_grid">
//               {filteredTimes.map((time, index) => {
//                 const isStart =
//                   startTime && time.getTime() === startTime.getTime();
//                 const isEnd = endTime && time.getTime() === endTime.getTime();
//                 const inRange = isInRange(time);

//                 const isDisabled =
//                   (startTime !== null &&
//                     endTime === null &&
//                     isBefore(time, startTime)) ||
//                   (startTime !== null &&
//                     endTime !== null &&
//                     !isStart &&
//                     !isEnd &&
//                     !inRange); // Désactive les autres si une plage complète est déjà choisie

//                 return (
//                   <div className="time_bloc" key={`time-${index}`}>
//                     <button
//                       className={`btn_times ${
//                         isStart ? "selected start" : ""
//                       } ${isEnd ? "selected end" : ""} ${
//                         inRange ? "in-range" : ""
//                       } ${
//                         startTime && !endTime && isAfter(time, startTime)
//                           ? "available-for-end"
//                           : ""
//                       }`}
//                       onClick={() => handleSelectTime(time)}
//                       type="button"
//                       disabled={isDisabled}
//                     >
//                       {format(time, "kk:mm")}
//                     </button>
//                   </div>
//                 );
//               })}
//             </div>
//           ) : (
//             <p>Aucune plage horaire disponible pour cette date.</p>
//           )}

//           {/* Affichage du récapitulatif du créneau sélectionné */}
//           {startTime && endTime && (
//             <div className="summary">
//               <h4>Votre créneau sélectionné :</h4>
//               <p className="highlight">
//                 {format(startTime, "kk:mm")} &rarr; {format(endTime, "kk:mm")}
//               </p>
//             </div>
//           )}

//           {/* Boutons d'action */}
//           <div className="action_buttons">
//             {startTime && endTime && (
//               <button
//                 className="btn_confirm"
//                 onClick={() =>
//                   router.push(
//                     `/serviceList?start=${startTime.toISOString()}&end=${endTime.toISOString()}`
//                   )
//                 }
//               >
//                 Confirmer ma réservation
//               </button>
//             )}

//             <button
//               className="btn_reset"
//               onClick={() => {
//                 setDate(null);
//                 setStartTime(null);
//                 setEndTime(null);
//                 setBookedTimes([]); // Assurez-vous que les bookedTimes sont aussi réinitialisés
//                 setBookingError(null);
//               }}
//             >
//               Changer de date ou réinitialiser
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Calendar;
// "use client";

// import React, { FC, useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";
// import { format, formatISO, isBefore, isAfter } from "date-fns";
// import { DayInput } from "@/types";
// import { getOpeningTimes, filterAvailableTimes } from "@/utils/helpers";
// import { now } from "@/app/constants/config";
// import { getBookedTimes } from "@/actions/bookings";
// import "react-calendar/dist/Calendar.css";
// import "./Calendar.scss";

// const DynamicCalendar = React.memo(
//   dynamic(() => import("react-calendar"), { ssr: false })
// );

// interface CalendarProps {
//   days: DayInput[];
//   closedDays: string[];
// }

// interface BookedTime {
//   start: Date;
//   end: Date;
// }

// const Calendar: FC<CalendarProps> = ({ days, closedDays }) => {
//   const router = useRouter();

//   const [date, setDate] = useState<Date | null>(null);
//   const [startTime, setStartTime] = useState<Date | null>(null);
//   const [endTime, setEndTime] = useState<Date | null>(null);
//   const [bookedTimes, setBookedTimes] = useState<BookedTime[]>([]);
//   const [isLoadingBookings, setIsLoadingBookings] = useState(false);
//   const [bookingError, setBookingError] = useState<string | null>(null);
//   const [instructionMessage, setInstructionMessage] = useState("");

//   useEffect(() => {
//     const fetchBookedTimes = async () => {
//       if (!date) return setBookedTimes([]);

//       setIsLoadingBookings(true);
//       setBookingError(null);
//       try {
//         const booked = await getBookedTimes(formatISO(date));
//         setBookedTimes(
//           booked.map(({ startTime, endTime }) => ({
//             start: new Date(startTime),
//             end: new Date(endTime),
//           }))
//         );
//       } catch (err) {
//         console.error("Erreur lors du chargement des créneaux :", err);
//         setBookingError("Une erreur est survenue lors du chargement.");
//         setBookedTimes([]);
//       } finally {
//         setIsLoadingBookings(false);
//       }
//     };

//     fetchBookedTimes();
//   }, [date]);

//   useEffect(() => {
//     if (!date) setInstructionMessage("Choisissez une date :");
//     else if (!startTime)
//       setInstructionMessage("Sélectionnez l'heure de début :");
//     else if (!endTime) setInstructionMessage("Sélectionnez l'heure de fin :");
//     else setInstructionMessage("Confirmez votre créneau :");
//   }, [date, startTime, endTime]);

//   const availableTimes = date ? getOpeningTimes(date, days) : [];
//   const filteredTimes = filterAvailableTimes(availableTimes, bookedTimes);

//   const handleSelectTime = (time: Date) => {
//     if (!startTime) {
//       setStartTime(time);
//       setEndTime(null);
//     } else if (!endTime) {
//       if (isAfter(time, startTime)) {
//         setEndTime(time);
//       } else {
//         alert("⛔ L'heure de fin doit être après l'heure de début !");
//       }
//     } else {
//       setStartTime(time);
//       setEndTime(null);
//     }
//   };

//   const isInRange = (time: Date): boolean =>
//     !!startTime &&
//     !!endTime &&
//     isAfter(time, startTime) &&
//     isBefore(time, endTime);

//   const handleReset = () => {
//     setDate(null);
//     setStartTime(null);
//     setEndTime(null);
//     setBookedTimes([]);
//     setBookingError(null);
//   };

//   const handleConfirm = () => {
//     if (startTime && endTime) {
//       router.push(
//         `/serviceList?start=${startTime.toISOString()}&end=${endTime.toISOString()}`
//       );
//     }
//   };

//   return (
//     <div className="calendar_container">
//       <h3>{instructionMessage}</h3>

//       {!date ? (
//         <DynamicCalendar
//           minDate={now}
//           view="month"
//           className="REACT-CALENDAR p-2"
//           onClickDay={(selectedDate) => {
//             const iso = formatISO(selectedDate);
//             if (!closedDays.includes(iso)) {
//               setDate(selectedDate);
//               setStartTime(null);
//               setEndTime(null);
//             }
//           }}
//           tileDisabled={({ date }) => closedDays.includes(formatISO(date))}
//           tileClassName={({ date }) =>
//             closedDays.includes(formatISO(date)) ? "closed-day" : ""
//           }
//         />
//       ) : (
//         <div className="time_selection_area">
//           {isLoadingBookings && <p>Chargement des créneaux disponibles...</p>}
//           {bookingError && <p className="error-message">{bookingError}</p>}

//           {!isLoadingBookings && !bookingError && (
//             <>
//               {filteredTimes.length > 0 ? (
//                 <div className="time_grid">
//                   {filteredTimes.map((time, i) => {
//                     const isStart = startTime?.getTime() === time.getTime();
//                     const isEnd = endTime?.getTime() === time.getTime();
//                     const inRange = isInRange(time);

//                     const isDisabled: boolean =
//                       (startTime !== null &&
//                         endTime === null &&
//                         isBefore(time, startTime)) ||
//                       (startTime !== null &&
//                         endTime !== null &&
//                         !isStart &&
//                         !isEnd &&
//                         !inRange);

//                     return (
//                       <div className="time_bloc" key={`time-${i}`}>
//                         <button
//                           type="button"
//                           className={`btn_times
//                             ${isStart ? "selected start" : ""}
//                             ${isEnd ? "selected end" : ""}
//                             ${inRange ? "in-range" : ""}
//                             ${
//                               startTime && !endTime && isAfter(time, startTime)
//                                 ? "available-for-end"
//                                 : ""
//                             }`}
//                           onClick={() => handleSelectTime(time)}
//                           disabled={isDisabled}
//                           aria-pressed={isStart || isEnd}
//                           aria-label={`Heure ${format(time, "kk:mm")}`}
//                         >
//                           {format(time, "kk:mm")}
//                         </button>
//                       </div>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <p>Aucune plage horaire disponible pour cette date.</p>
//               )}
//             </>
//           )}

//           {startTime && endTime && (
//             <div className="summary">
//               <h4>Votre créneau sélectionné :</h4>
//               <p className="highlight">
//                 {format(startTime, "kk:mm")} &rarr; {format(endTime, "kk:mm")}
//               </p>
//             </div>
//           )}

//           <div className="action_buttons">
//             {startTime && endTime && (
//               <button className="btn_confirm" onClick={handleConfirm}>
//                 Confirmer ma réservation
//               </button>
//             )}
//             <button className="btn_reset" onClick={handleReset}>
//               Changer de date ou réinitialiser
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Calendar;
"use client";

import React, { FC, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { format, formatISO, isBefore, isAfter } from "date-fns";
import { DayInput } from "@/types";
import { getOpeningTimes, filterAvailableTimes } from "@/utils/helpers";
import { now } from "@/app/constants/config";
import { getBookedTimes } from "@/actions/bookings";
import "react-calendar/dist/Calendar.css";
import "./Calendar.scss";

const DynamicCalendar = React.memo(
  dynamic(() => import("react-calendar"), { ssr: false })
);

interface CalendarProps {
  days: DayInput[];
  closedDays: string[];
}

interface BookedTime {
  start: Date;
  end: Date;
}

const Calendar: FC<CalendarProps> = ({ days, closedDays }) => {
  const router = useRouter();

  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [bookedTimes, setBookedTimes] = useState<BookedTime[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [instructionMessage, setInstructionMessage] = useState("");

  useEffect(() => {
    const fetchBookedTimes = async () => {
      if (!date) return setBookedTimes([]);

      setIsLoadingBookings(true);
      setBookingError(null);
      try {
        const booked = await getBookedTimes(formatISO(date));
        setBookedTimes(
          booked.map(({ startTime, endTime }) => ({
            start: new Date(startTime),
            end: new Date(endTime),
          }))
        );
      } catch (err) {
        console.error("Erreur lors du chargement des créneaux :", err);
        setBookingError("Une erreur est survenue lors du chargement.");
        setBookedTimes([]);
      } finally {
        setIsLoadingBookings(false);
      }
    };

    fetchBookedTimes();
  }, [date]);

  useEffect(() => {
    if (!date) setInstructionMessage("Choisissez une date :");
    else if (!startTime)
      setInstructionMessage("Sélectionnez l'heure de début :");
    else if (!endTime) setInstructionMessage("Sélectionnez l'heure de fin :");
    else setInstructionMessage("Confirmez votre créneau :");
  }, [date, startTime, endTime]);

  const availableTimes = date ? getOpeningTimes(date, days) : [];
  const filteredTimes = filterAvailableTimes(availableTimes, bookedTimes);

  const handleSelectTime = (time: Date) => {
    if (!startTime) {
      setStartTime(time);
      setEndTime(null);
    } else if (!endTime) {
      if (isAfter(time, startTime)) {
        setEndTime(time);
      } else {
        alert("⛔ L'heure de fin doit être après l'heure de début !");
      }
    } else {
      setStartTime(time);
      setEndTime(null);
    }
  };

  const isInRange = (time: Date): boolean =>
    !!startTime &&
    !!endTime &&
    isAfter(time, startTime) &&
    isBefore(time, endTime);

  const handleReset = () => {
    setDate(null);
    setStartTime(null);
    setEndTime(null);
    setBookedTimes([]);
    setBookingError(null);
  };

  const handleConfirm = () => {
    if (startTime && endTime) {
      router.push(
        `/serviceList?start=${startTime.toISOString()}&end=${endTime.toISOString()}`
      );
    }
  };

  // Calcul de l’étape actuelle pour la barre d’étapes
  let currentStep = 1;
  if (date && !startTime) currentStep = 2;
  else if (startTime && !endTime) currentStep = 3;
  else if (startTime && endTime) currentStep = 4;

  return (
    <div className="calendar_container">
      {/* Barre d’étapes */}
      <div
        className="steps_bar"
        role="list"
        aria-label="Progression des étapes"
      >
        <div
          className={`step ${currentStep === 1 ? "active" : currentStep > 1 ? "completed" : ""}`}
          role="listitem"
          aria-current={currentStep === 1 ? "step" : undefined}
        >
          <span className="step_number">1</span> Choix de la date
        </div>
        <div
          className={`step ${currentStep === 2 ? "active" : currentStep > 2 ? "completed" : ""}`}
          role="listitem"
          aria-current={currentStep === 2 ? "step" : undefined}
        >
          <span className="step_number">2</span> Choix heure début
        </div>
        <div
          className={`step ${currentStep === 3 ? "active" : currentStep > 3 ? "completed" : ""}`}
          role="listitem"
          aria-current={currentStep === 3 ? "step" : undefined}
        >
          <span className="step_number">3</span> Choix heure fin
        </div>
        <div
          className={`step ${currentStep === 4 ? "active" : ""}`}
          role="listitem"
          aria-current={currentStep === 4 ? "step" : undefined}
        >
          <span className="step_number">4</span> Confirmation
        </div>
      </div>

      <h3>{instructionMessage}</h3>

      {!date ? (
        <DynamicCalendar
          minDate={now}
          view="month"
          className="react-calendar p-2"
          onClickDay={(selectedDate) => {
            const iso = formatISO(selectedDate);
            if (!closedDays.includes(iso)) {
              setDate(selectedDate);
              setStartTime(null);
              setEndTime(null);
            }
          }}
          tileDisabled={({ date }) => closedDays.includes(formatISO(date))}
          tileClassName={({ date }) =>
            closedDays.includes(formatISO(date)) ? "closed-day" : ""
          }
        />
      ) : (
        <div className="time_selection_area">
          {isLoadingBookings && <p>Chargement des créneaux disponibles...</p>}
          {bookingError && <p className="error-message">{bookingError}</p>}

          {!isLoadingBookings && !bookingError && (
            <>
              {filteredTimes.length > 0 ? (
                <div className="time_grid">
                  {filteredTimes.map((time, i) => {
                    const isStart = startTime?.getTime() === time.getTime();
                    const isEnd = endTime?.getTime() === time.getTime();
                    const inRange = isInRange(time);

                    const isDisabled: boolean =
                      (startTime !== null &&
                        endTime === null &&
                        isBefore(time, startTime)) ||
                      (startTime !== null &&
                        endTime !== null &&
                        !isStart &&
                        !isEnd &&
                        !inRange);

                    return (
                      <div className="time_bloc" key={`time-${i}`}>
                        <button
                          type="button"
                          className={`btn_times
                            ${isStart ? "selected start" : ""}
                            ${isEnd ? "selected end" : ""}
                            ${inRange ? "in-range" : ""}
                            ${
                              startTime && !endTime && isAfter(time, startTime)
                                ? "available-for-end"
                                : ""
                            }`}
                          onClick={() => handleSelectTime(time)}
                          disabled={isDisabled}
                          aria-pressed={isStart || isEnd}
                          aria-label={`Heure ${format(time, "kk:mm")}`}
                        >
                          {format(time, "kk:mm")}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>Aucune plage horaire disponible pour cette date.</p>
              )}
            </>
          )}

          {startTime && endTime && (
            <div className="summary">
              <h4>Votre créneau sélectionné :</h4>
              <p className="highlight">
                {format(startTime, "kk:mm")} &rarr; {format(endTime, "kk:mm")}
              </p>
            </div>
          )}

          <div className="action_buttons">
            <button
              className="btn_confirm"
              onClick={handleConfirm}
              disabled={!(startTime && endTime)}
              aria-disabled={!(startTime && endTime)}
            >
              Confirmer ma réservation
            </button>
            <button className="btn_reset" onClick={handleReset}>
              Changer de date ou réinitialiser
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
