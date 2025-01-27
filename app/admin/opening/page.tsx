// "use client";

// import { useState, useEffect } from "react";
// import { Calendar } from "react-calendar";
// import "react-calendar/dist/Calendar.css";
// import toast, { Toaster } from "react-hot-toast";
// import { formatISO } from "date-fns";

// interface Day {
//   dayOfWeek: number;
//   openTime: string;
//   closeTime: string;
// }
// import { capitalize, weekdayIndexToName } from "@/utils/helpers";
// import {
//   getClosedDays,
//   openDay,
//   closeDay,
//   getOpeningHours,
//   updateOpeningHours,
// } from "@/actions/openingActions";
// import { now } from "@/app/constants/config";

// interface OpeningProps {
//   days: Day[];
// }
// const Opening: React.FC<OpeningProps> = ({ days }) => {
//   const [enabled, setEnabled] = useState(false);
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   // Non-null-assertions because if days are less than 7, an error is thrown previously
//   const [openingHrs, setOpeningHrs] = useState([
//     {
//       id: "sunday-id",
//       name: "sunday",
//       dayOfWeek: 0,
//       openTime: days[0]!.openTime,
//       closeTime: days[0]!.closeTime,
//     },
//     {
//       id: "monday-id",
//       name: "monday",
//       dayOfWeek: 1,
//       openTime: days[1]!.openTime,
//       closeTime: days[1]!.closeTime,
//     },
//     {
//       id: "tuesday-id",
//       name: "tuesday",
//       dayOfWeek: 2,
//       openTime: days[2]!.openTime,
//       closeTime: days[2]!.closeTime,
//     },
//     {
//       id: "wednesday-id",
//       name: "wednesday",
//       dayOfWeek: 3,
//       openTime: days[3]!.openTime,
//       closeTime: days[3]!.closeTime,
//     },
//     {
//       id: "thursday-id",
//       name: "thursday",
//       dayOfWeek: 4,
//       openTime: days[4]!.openTime,
//       closeTime: days[4]!.closeTime,
//     },
//     {
//       id: "friday-id",
//       name: "friday",
//       dayOfWeek: 5,
//       openTime: days[5]!.openTime,
//       closeTime: days[5]!.closeTime,
//     },
//     {
//       id: "saturday-id",
//       name: "saturday",
//       dayOfWeek: 6,
//       openTime: days[6]!.openTime,
//       closeTime: days[6]!.closeTime,
//     },
//   ]);
//   const [closedDays, setClosedDays] = useState<string[]>([]);
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchData() {
//       setIsLoading(true);
//       setError(null);

//       try {
//         const closedDays = await getClosedDays();
//         setClosedDays(closedDays);

//         const openingHours = await getOpeningHours();
//         setOpeningHrs(openingHours);
//       } catch (error) {
//         console.error("Erreur lors du chargement des données:", error);
//         setError("Impossible de charger les données.");
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     fetchData();
//   }, []);

//   const saveOpeningHrs = async () => {
//     try {
//       await updateOpeningHours(openingHrs);
//       toast.success("Opening hours saved successfully!");
//     } catch (error) {
//       console.error("Error saving opening hours", error);
//       toast.error("Failed to save opening hours. Try again later.");
//     }
//   };

//   const handleDayChange = async () => {
//     if (selectedDate) {
//       const dayIso = formatISO(selectedDate);
//       const isClosed = closedDays.includes(dayIso);

//       try {
//         if (isClosed) {
//           await openDay({ date: new Date(dayIso) });
//           setClosedDays((prev) => prev.filter((d) => d !== dayIso));
//         } else {
//           await closeDay({ date: new Date(dayIso) });
//           setClosedDays((prev) => [...prev, dayIso]);
//         }
//       } catch (error) {
//         console.error("Error toggling day status", error);
//         toast.error("Failed to update day status.");
//       }
//     }
//   };
//   // Curried for easier usage
//   function changeTime(
//     dayOfWeek: number,
//     type: "openTime" | "closeTime",
//     time: string
//   ) {
//     const index = openingHrs.findIndex(
//       (x) => x.name === weekdayIndexToName(dayOfWeek)
//     );
//     const newOpeningHrs = [...openingHrs];
//     newOpeningHrs[index]![type] = time;
//     setOpeningHrs(newOpeningHrs);
//   }

//   return (
//     <div className="admin-container">
//       <Toaster />
//       <h2>MANAGE OPENING HOURS</h2>
//       <div className="switch-container">
//         <button
//           className={`switch-btn ${!enabled ? "active" : ""}`}
//           onClick={() => setEnabled(false)}
//         >
//           Manage Opening Hours
//         </button>
//         <button
//           className={`switch-btn ${enabled ? "active" : ""}`}
//           onClick={() => setEnabled(true)}
//         >
//           Manage Closed Days
//         </button>
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       {!enabled ? (
//         <div className="hours-container">
//           {openingHrs.map((day) => (
//             <div className="hour-row" key={day.name}>
//               <span className="day-name">
//                 {capitalize(weekdayIndexToName(day.dayOfWeek))}
//               </span>
//               <input
//                 type="time"
//                 value={day.openTime}
//                 onChange={(e) =>
//                   changeTime(day.dayOfWeek, "openTime", e.target.value)
//                 }
//               />
//               <input
//                 type="time"
//                 value={day.closeTime}
//                 onChange={(e) =>
//                   changeTime(day.dayOfWeek, "closeTime", e.target.value)
//                 }
//               />
//             </div>
//           ))}
//           <button onClick={saveOpeningHrs} className="save-btn">
//             Save Hours
//           </button>
//         </div>
//       ) : (
//         <div className="calendar-container">
//           <Calendar
//             minDate={now}
//             className="REACT-CALENDAR p-2"
//             view="month"
//             onClickDay={(date) => setSelectedDate(date)}
//             tileClassName={({ date }) =>
//               closedDays.includes(formatISO(date)) ? "closed-day" : null
//             }
//           />
//           <button
//             onClick={handleDayChange}
//             disabled={!selectedDate}
//             className="toggle-day-btn"
//           >
//             {closedDays.includes(formatISO(selectedDate!))
//               ? "Open shop this day"
//               : "Close shop this day"}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Opening;

//////////////////////////////////////////////
// "use client";

// import { useState, useEffect } from "react";
// import { Calendar } from "react-calendar";
// import "react-calendar/dist/Calendar.css";
// import toast, { Toaster } from "react-hot-toast";
// import { formatISO } from "date-fns";
// import { capitalize, weekdayIndexToName } from "@/utils/helpers";
// import {
//   openDay,
//   closeDay,
//   updateOpeningHours,
//   getOpeningHours,
//   getClosedDays,
// } from "@/actions/openingActions";
// import { DayInput } from "@/types";

// const Opening: React.FC = () => {
//   const [enabled, setEnabled] = useState(false);
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [openingHrs, setOpeningHrs] = useState<DayInput[]>([]);
//   const [closedDays, setClosedDays] = useState<string[]>([]);
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchData() {
//       setIsLoading(true);
//       setError(null);

//       try {
//         const days = await getOpeningHours();
//         const closedDays = await getClosedDays();
//         setClosedDays(closedDays);
//         setOpeningHrs(
//           days.map((day, index) => ({
//             id: `${weekdayIndexToName(index)}-id`,
//             name: weekdayIndexToName(index),
//             dayOfWeek: index,
//             openTime: day.openTime,
//             closeTime: day.closeTime,
//           }))
//         );
//       } catch (error) {
//         console.error("Erreur lors du chargement des données:", error);
//         setError("Impossible de charger les données.");
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     fetchData();
//   }, []);

//   const saveOpeningHrs = async () => {
//     try {
//       await updateOpeningHours(openingHrs);
//       toast.success("Opening hours saved successfully!");
//     } catch (error) {
//       console.error("Error saving opening hours", error);
//       toast.error("Failed to save opening hours. Try again later.");
//     }
//   };

//   const handleDayChange = async () => {
//     if (selectedDate) {
//       const dayIso = formatISO(selectedDate);
//       const isClosed = closedDays.includes(dayIso);

//       try {
//         if (isClosed) {
//           await openDay({ date: new Date(dayIso) });
//           setClosedDays((prev) => prev.filter((d) => d !== dayIso));
//         } else {
//           await closeDay({ date: new Date(dayIso) });
//           setClosedDays((prev) => [...prev, dayIso]);
//         }
//       } catch (error) {
//         console.error("Error toggling day status", error);
//         toast.error("Failed to update day status.");
//       }
//     }
//   };

//   const changeTime = (
//     dayOfWeek: number,
//     type: "openTime" | "closeTime",
//     time: string
//   ) => {
//     setOpeningHrs((prev) =>
//       prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [type]: time } : d))
//     );
//   };

//   return (
//     <div className="admin-container">
//       <Toaster />
//       <h2>MANAGE OPENING HOURS</h2>
//       <div className="switch-container">
//         <button
//           className={`switch-btn ${!enabled ? "active" : ""}`}
//           onClick={() => setEnabled(false)}
//         >
//           Manage Opening Hours
//         </button>
//         <button
//           className={`switch-btn ${enabled ? "active" : ""}`}
//           onClick={() => setEnabled(true)}
//         >
//           Manage Closed Days
//         </button>
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       {!enabled ? (
//         <div className="hours-container">
//           {openingHrs.map((day, index) => (
//             <div className="hour-row" key={index}>
//               <span className="day-name">{capitalize(day.name)}</span>
//               <input
//                 type="time"
//                 value={day.openTime}
//                 onChange={(e) => changeTime(index, "openTime", e.target.value)}
//               />
//               <input
//                 type="time"
//                 value={day.closeTime}
//                 onChange={(e) => changeTime(index, "closeTime", e.target.value)}
//               />
//             </div>
//           ))}
//           <button onClick={saveOpeningHrs} className="save-btn">
//             Save Hours
//           </button>
//         </div>
//       ) : (
//         <div className="calendar-container">
//           <Calendar
//             minDate={new Date()}
//             className="REACT-CALENDAR p-2"
//             view="month"
//             onClickDay={(date) => setSelectedDate(date)}
//             tileClassName={({ date }) =>
//               closedDays.includes(formatISO(date)) ? "closed-day" : null
//             }
//           />
//           <button
//             onClick={handleDayChange}
//             disabled={!selectedDate}
//             className="toggle-day-btn"
//           >
//             {closedDays.includes(formatISO(selectedDate!))
//               ? "Open shop this day"
//               : "Close shop this day"}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Opening;
///////////////////
"use client";

import { useState, useEffect } from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import toast, { Toaster } from "react-hot-toast";
import { formatISO } from "date-fns";
import { capitalize } from "@/utils/helpers";
import {
  openDay,
  closeDay,
  updateOpeningHours,
  getOpeningHours,
  getClosedDays,
} from "@/actions/openingActions";
import { DayInput } from "@/types";

const Opening: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [openingHrs, setOpeningHrs] = useState<DayInput[]>([]);
  const [closedDays, setClosedDays] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   async function fetchData() {
  //     setIsLoading(true);
  //     setError(null);

  //     try {
  //       const response = await fetch("/api/opening/openingHours");
  //       if (!response.ok) {
  //         throw new Error("Erreur lors du chargement des données");
  //       }
  //       const data = await response.json();
  //       setClosedDays(data.closedDays);
  //       setOpeningHrs(
  //         data.days.map(
  //           (day: {
  //             id: string;
  //             openTime: string;
  //             closeTime: string;
  //             dayOfWeek: number;
  //           }) => ({
  //             id: day.id,
  //             name: weekdayIndexToName(day.dayOfWeek),
  //             dayOfWeek: day.dayOfWeek, // Ajoutez ce champ ici
  //             openTime: day.openTime,
  //             closeTime: day.closeTime,
  //           })
  //         )
  //       );
  //     } catch (error) {
  //       console.error("Erreur lors du chargement des données:", error);
  //       setError("Impossible de charger les données.");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }

  //   fetchData();
  // }, []);
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const days = await getOpeningHours();
        const closedDays = await getClosedDays();

        setClosedDays(closedDays);
        setOpeningHrs(
          days.map((day: DayInput) => ({
            ...day,
            name: capitalize(day.name), // S'assurer que le nom est bien capitalisé
          }))
        );
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        setError("Impossible de charger les données.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const saveOpeningHrs = async () => {
    try {
      if (openingHrs.length === 0) {
        throw new Error("No opening hours to save");
      }

      await updateOpeningHours(openingHrs);
      toast.success("Opening hours saved successfully!");
    } catch (error) {
      console.error("Error saving opening hours", error);
      toast.error("Failed to save opening hours. Try again later.");
    }
  };

  // const handleDayChange = async () => {
  //   if (selectedDate) {
  //     const dayIso = formatISO(selectedDate);
  //     const isClosed = closedDays.includes(dayIso);

  //     try {
  //       if (isClosed) {
  //         await openDay({ date: new Date(dayIso) });
  //         setClosedDays((prev) => prev.filter((d) => d !== dayIso));
  //       } else {
  //         await closeDay({ date: new Date(dayIso) });
  //         setClosedDays((prev) => [...prev, dayIso]);
  //       }
  //     } catch (error) {
  //       console.error("Error toggling day status", error);
  //       toast.error("Failed to update day status.");
  //     }
  //   }
  // };
  const handleDayChange = async () => {
    if (!selectedDate) return;

    const dayIso = formatISO(selectedDate); // Formate la date en ISO
    const isClosed = closedDays.includes(dayIso);

    try {
      if (isClosed) {
        await openDay({ date: new Date(dayIso) });
        setClosedDays((prev) => prev.filter((d) => d !== dayIso)); // Supprime la date des jours fermés
        toast.success("Day opened successfully!");
      } else {
        await closeDay({ date: new Date(dayIso) });
        setClosedDays((prev) => [...prev, dayIso]); // Ajoute la date aux jours fermés
        toast.success("Day closed successfully!");
      }
    } catch (error) {
      console.error("Error toggling day status", error);
      toast.error("Failed to update day status.");
    }
  };

  // const changeTime = (
  //   dayOfWeek: number,
  //   type: "openTime" | "closeTime",
  //   time: string
  // ) => {
  //   setOpeningHrs((prev) =>
  //     prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [type]: time } : d))
  //   );
  // };
  const changeTime = (
    dayOfWeek: number,
    type: "openTime" | "closeTime",
    time: string
  ) => {
    setOpeningHrs((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [type]: time } : d))
    );
  };

  return (
    <div className="admin-container">
      <Toaster />
      <h2>MANAGE OPENING HOURS</h2>
      <div className="switch-container">
        <button
          className={`switch-btn ${!enabled ? "active" : ""}`}
          onClick={() => setEnabled(false)}
        >
          Manage Opening Hours
        </button>
        <button
          className={`switch-btn ${enabled ? "active" : ""}`}
          onClick={() => setEnabled(true)}
        >
          Manage Closed Days
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!enabled ? (
        <div className="hours-container">
          {openingHrs.map((day, index) => (
            <div className="hour-row" key={index}>
              <span className="day-name">{capitalize(day.name)}</span>
              <input
                type="time"
                value={day.openTime}
                onChange={(e) => changeTime(index, "openTime", e.target.value)}
              />
              <input
                type="time"
                value={day.closeTime}
                onChange={(e) => changeTime(index, "closeTime", e.target.value)}
              />
            </div>
          ))}
          <button onClick={saveOpeningHrs} className="save-btn">
            Save Hours
          </button>
        </div>
      ) : (
        <div className="calendar-container">
          <Calendar
            minDate={new Date()}
            className="REACT-CALENDAR p-2"
            view="month"
            onClickDay={(date) => setSelectedDate(date)}
            tileClassName={({ date }) =>
              closedDays.includes(formatISO(date)) ? "closed-day" : null
            }
          />
          <button
            onClick={handleDayChange}
            disabled={!selectedDate}
            className="toggle-day-btn"
          >
            {closedDays.includes(formatISO(selectedDate!))
              ? "Open shop this day"
              : "Close shop this day"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Opening;
