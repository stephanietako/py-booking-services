// "use client";

// import { useState, useEffect } from "react";
// import { getOpeningTimes } from "@/utils/helpers";
// import { ServiceHours } from "@/type";
// import AdminCalendarForm from "@/app/components/AdminCalendarForm/AdminCalendarForm";
// import ClosedDays from "@/app/components/ClosedDays/ClosedDays";
// import { formatISO } from "date-fns";
// import {
//   changeOpeningHours,
//   closeDay,
//   getClosedDays,
//   getOpeningHours,
//   openDay,
// } from "@/actions/openingActions";
// import ManageOpeningHours from "@/app/components/ManageOpeningHours/ManageOpeningHours";
// export default function AdminPage() {
//   const [openingHours, setOpeningHours] = useState<ServiceHours[]>([]);
//   const [closedDays, setClosedDays] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
//   const [availableTimes, setAvailableTimes] = useState<ServiceHours[]>([]);

//   useEffect(() => {
//     async function fetchData() {
//       setIsLoading(true);
//       setError(null);

//       try {
//         const [hours, closed] = await Promise.all([
//           getOpeningHours(),
//           getClosedDays(),
//         ]);
//         setOpeningHours(hours);
//         setClosedDays(closed);
//       } catch (err) {
//         console.error("Erreur lors de la récupération des données :", err);
//         setError("Une erreur est survenue lors du chargement des données.");
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     fetchData();
//   }, []);

//   useEffect(() => {
//     if (openingHours.length > 0) {
//       const times = getOpeningTimes(selectedDate, openingHours);
//       setAvailableTimes(times);
//     }
//   }, [selectedDate, openingHours]);

//   const handleUpdateOpeningHours = async (updatedHours: ServiceHours[]) => {
//     setError(null);

//     try {
//       await changeOpeningHours(updatedHours);
//       setOpeningHours(updatedHours);
//       alert("Les horaires ont été mis à jour avec succès !");
//     } catch (err) {
//       console.error("Erreur lors de la mise à jour des horaires :", err);
//       setError("Impossible de mettre à jour les horaires.");
//     }
//   };

//   const handleCloseDay = async (date: { date: Date }) => {
//     setError(null);

//     try {
//       await closeDay(date);
//       setClosedDays((prev) => [...prev, formatISO(date.date)]);
//     } catch (err) {
//       console.error("Erreur lors de la fermeture du jour :", err);
//       setError("Impossible de fermer ce jour.");
//     }
//   };

//   const handleOpenDay = async (date: { date: Date }) => {
//     setError(null);

//     try {
//       await openDay(date);
//       setClosedDays((prev) => prev.filter((d) => d !== formatISO(date.date)));
//     } catch (err) {
//       console.error("Erreur lors de l'ouverture du jour :", err);
//       setError("Impossible de rouvrir ce jour.");
//     }
//   };

//   return (
//     <div className="admin_container">
//       <div>
//         <h1>Tableau de bord administrateur</h1>
//         <ManageOpeningHours />
//       </div>
//       <h1 className="admin_title">Gestion du Calendrier</h1>
//       {error && <p className="admin-error">{error}</p>}
//       {isLoading ? (
//         <p className="admin_loading">Chargement...</p>
//       ) : (
//         <>
//           <AdminCalendarForm
//             openingHours={openingHours}
//             onUpdate={handleUpdateOpeningHours}
//             closedDays={closedDays}
//           />
//           <ClosedDays
//             closedDays={closedDays}
//             onClose={handleCloseDay}
//             onOpen={handleOpenDay}
//           />

//           <div className="date_selector">
//             <h2 className="section_title">
//               Créneaux horaires pour {selectedDate.toLocaleDateString()}
//             </h2>
//             <input
//               type="date"
//               value={selectedDate.toISOString().split("T")[0]}
//               onChange={(e) => setSelectedDate(new Date(e.target.value))}
//             />
//             <ul className="available_times">
//               {availableTimes.map((time) => (
//                 <li key={time.id} className="available_time">
//                   {time.opening}:00 - {time.closing}:00
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { getOpeningTimes } from "@/utils/helpers";
import { ServiceHours } from "@/type";
import AdminCalendarForm from "@/app/components/AdminCalendarForm/AdminCalendarForm";
import ClosedDays from "@/app/components/ClosedDays/ClosedDays";
import { formatISO } from "date-fns";
import {
  changeOpeningHours,
  closeDay,
  getClosedDays,
  getOpeningHours,
  openDay,
} from "@/actions/openingActions";

import ManageOpeningHours from "@/app/components/ManageOpeningHours/ManageOpeningHours";
import Wrapper from "@/app/components/Wrapper/Wrapper";

export default function AdminPage() {
  const [openingHours, setOpeningHours] = useState<ServiceHours[]>([]);
  const [closedDays, setClosedDays] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableTimes, setAvailableTimes] = useState<ServiceHours[]>([]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const [hours, closed] = await Promise.all([
          getOpeningHours(), // API action
          getClosedDays(), // API action
        ]);
        setOpeningHours(hours);
        setClosedDays(closed);
      } catch (err) {
        console.error("Erreur lors de la récupération des données :", err);
        setError("Une erreur est survenue lors du chargement des données.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (openingHours.length > 0) {
      const times = getOpeningTimes(selectedDate, openingHours);
      setAvailableTimes(times);
    }
  }, [selectedDate, openingHours]);

  const handleUpdateOpeningHours = async (updatedHours: ServiceHours[]) => {
    setError(null);

    try {
      // Envoi de la mise à jour via l'action côté serveur
      await changeOpeningHours(updatedHours);
      setOpeningHours(updatedHours);
      alert("Les horaires ont été mis à jour avec succès !");
    } catch (err) {
      console.error("Erreur lors de la mise à jour des horaires :", err);
      setError("Impossible de mettre à jour les horaires.");
    }
  };

  const handleCloseDay = async (date: { date: Date }) => {
    setError(null);

    try {
      // Fermeture du jour via l'action côté serveur
      await closeDay(date);
      setClosedDays((prev) => [...prev, formatISO(date.date)]);
    } catch (err) {
      console.error("Erreur lors de la fermeture du jour :", err);
      setError("Impossible de fermer ce jour.");
    }
  };

  const handleOpenDay = async (date: { date: Date }) => {
    setError(null);

    try {
      // Réouverture du jour via l'action côté serveur
      await openDay(date);
      setClosedDays((prev) => prev.filter((d) => d !== formatISO(date.date)));
    } catch (err) {
      console.error("Erreur lors de l'ouverture du jour :", err);
      setError("Impossible de rouvrir ce jour.");
    }
  };

  return (
    <Wrapper>
      <div className="admin_container">
        <div>
          <h1>Tableau de bord administrateur</h1>
          <ManageOpeningHours />
        </div>
        <h1 className="admin_title">Gestion du Calendrier</h1>
        {error && <p className="admin-error">{error}</p>}
        {isLoading ? (
          <p className="admin_loading">Chargement...</p>
        ) : (
          <>
            <AdminCalendarForm
              openingHours={openingHours}
              onUpdate={handleUpdateOpeningHours}
              closedDays={closedDays}
            />
            <ClosedDays
              closedDays={closedDays}
              onClose={handleCloseDay}
              onOpen={handleOpenDay}
            />

            <div className="date_selector">
              <h2 className="section_title">
                Créneaux horaires pour {selectedDate.toLocaleDateString()}
              </h2>
              <input
                type="date"
                value={selectedDate.toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
              />
              <ul className="available_times">
                {availableTimes.map((time) => (
                  <li key={time.id} className="available_time">
                    {time.opening}:00 - {time.closing}:00
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </Wrapper>
  );
}
