// "use client";

// import React, { useState, useEffect } from "react";
// import { formatISO } from "date-fns";
// import { getClosedDays, openDay, closeDay } from "@/actions/openingActions";
// import dynamic from "next/dynamic";

// const DynamicCalendar = dynamic(() => import("react-calendar"), { ssr: false });

// const ClosedDays: React.FC = () => {
//   const [closedDays, setClosedDays] = useState<string[]>([]);
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const data = await getClosedDays();
//         setClosedDays(data);
//       } catch {
//         setError("Erreur lors du chargement des jours fermés.");
//       }
//     }
//     fetchData();
//   }, []);

//   const handleDayChange = async () => {
//     if (!selectedDate) return;

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
//     } catch {
//       setError("Erreur lors de la mise à jour des jours.");
//     }
//   };

//   return (
//     <div>
//       <h2>Gérer les jours fermés</h2>
//       {error && <p className="error">{error}</p>}
//       <DynamicCalendar
//         minDate={new Date()}
//         tileClassName={({ date }) =>
//           closedDays.includes(formatISO(date)) ? "closed-day" : null
//         }
//         onClickDay={(date) => setSelectedDate(date)}
//       />
//       <button onClick={handleDayChange} disabled={!selectedDate}>
//         {selectedDate && closedDays.includes(formatISO(selectedDate))
//           ? "Ouvrir ce jour"
//           : "Fermer ce jour"}
//       </button>
//     </div>
//   );
// };

// export default ClosedDays;
"use client";

import React, { useState, useEffect } from "react";
import { formatISO } from "date-fns";
import { getClosedDays, openDay, closeDay } from "@/actions/openingActions";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";

const DynamicCalendar = dynamic(() => import("react-calendar"), { ssr: false });

const ClosedDays: React.FC = () => {
  const [closedDays, setClosedDays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getClosedDays();
        setClosedDays(data);
      } catch {
        setError("Erreur lors du chargement des jours fermés.");
      }
    }
    fetchData();
  }, []);

  const handleDayChange = async () => {
    if (!selectedDate) return;

    const dayIso = formatISO(selectedDate);
    const isClosed = closedDays.includes(dayIso);

    try {
      if (isClosed) {
        await openDay({ date: new Date(dayIso) });
        setClosedDays((prev) => prev.filter((d) => d !== dayIso));
        toast.success("Le jour a été ouvert avec succès.");
      } else {
        await closeDay({ date: new Date(dayIso) });
        setClosedDays((prev) => [...prev, dayIso]);
        toast.success("Le jour a été fermé avec succès.");
      }
    } catch {
      setError("Erreur lors de la mise à jour des jours.");
      toast.error("Erreur lors de la mise à jour des jours.");
    }
  };

  return (
    <div>
      <h2>Gérer les jours fermés</h2>
      {error && <p className="error">{error}</p>}
      <DynamicCalendar
        minDate={new Date()}
        tileClassName={({ date }) =>
          closedDays.includes(formatISO(date)) ? "closed-day" : null
        }
        onClickDay={(date) => {
          const dayIso = formatISO(date);
          if (closedDays.includes(dayIso)) {
            toast.error("Ce jour est déjà fermé.");
          } else {
            setSelectedDate(date);
          }
        }}
      />
      <button onClick={handleDayChange} disabled={!selectedDate}>
        {selectedDate && closedDays.includes(formatISO(selectedDate))
          ? "Ouvrir ce jour"
          : "Fermer ce jour"}
      </button>
    </div>
  );
};

export default ClosedDays;
