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
  const [loading, setLoading] = useState(false);

  // Charger les jours fermés au montage
  useEffect(() => {
    async function fetchData() {
      const toastId = toast.loading("Chargement des jours fermés...", {
        ariaProps: { role: "status", "aria-live": "polite" },
      });
      try {
        const data = await getClosedDays();
        setClosedDays(data);
        toast.success("Jours fermés chargés avec succès.", {
          id: toastId,
          ariaProps: { role: "status", "aria-live": "polite" },
        });
      } catch {
        toast.error("Erreur lors du chargement des jours fermés.", {
          id: toastId,
          ariaProps: { role: "alert", "aria-live": "assertive" },
        });
      }
    }
    fetchData();
  }, []);

  // Gestion de l’ouverture/fermeture d’un jour
  const handleDayChange = async () => {
    if (!selectedDate || loading) return;

    const dayIso = formatISO(selectedDate);
    const isClosed = closedDays.includes(dayIso);
    const toastId = toast.loading("Mise à jour en cours...", {
      ariaProps: { role: "status", "aria-live": "polite" },
    });

    setLoading(true);
    try {
      if (isClosed) {
        await openDay({ date: new Date(dayIso) });
        setClosedDays((prev) => prev.filter((d) => d !== dayIso));
        toast.success("Le jour a été ouvert avec succès.", {
          id: toastId,
          ariaProps: { role: "status", "aria-live": "polite" },
        });
      } else {
        await closeDay({ date: new Date(dayIso) });
        setClosedDays((prev) => [...prev, dayIso]);
        toast.success("Le jour a été fermé avec succès.", {
          id: toastId,
          ariaProps: { role: "status", "aria-live": "polite" },
        });
      }
    } catch {
      toast.error("Erreur lors de la mise à jour des jours.", {
        id: toastId,
        ariaProps: { role: "alert", "aria-live": "assertive" },
      });
    } finally {
      setLoading(false);
      toast.dismiss(toastId);
    }
  };

  return (
    <div>
      <h2>Gérer les jours fermés</h2>

      <DynamicCalendar
        minDate={new Date()}
        tileClassName={({ date }) =>
          closedDays.includes(formatISO(date)) ? "closed-day" : null
        }
        onClickDay={(date) => setSelectedDate(date)}
        aria-label="Calendrier des jours fermés"
      />

      <button
        onClick={handleDayChange}
        disabled={!selectedDate || loading}
        aria-label={
          selectedDate && closedDays.includes(formatISO(selectedDate))
            ? "Ouvrir le jour sélectionné"
            : "Fermer le jour sélectionné"
        }
        aria-disabled={!selectedDate || loading}
      >
        {selectedDate && closedDays.includes(formatISO(selectedDate))
          ? "Ouvrir ce jour"
          : "Fermer ce jour"}
      </button>
    </div>
  );
};

export default ClosedDays;
// "use client";

// import React, { useState, useEffect } from "react";
// import { formatISO } from "date-fns";
// import { getClosedDays, openDay, closeDay } from "@/actions/openingActions";
// import dynamic from "next/dynamic";
// import { toast } from "react-hot-toast";

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
//         toast.success("Le jour a été ouvert avec succès.");
//       } else {
//         await closeDay({ date: new Date(dayIso) });
//         setClosedDays((prev) => [...prev, dayIso]);
//         toast.success("Le jour a été fermé avec succès.");
//       }
//     } catch {
//       setError("Erreur lors de la mise à jour des jours.");
//       toast.error("Erreur lors de la mise à jour des jours.");
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
//         onClickDay={(date) => {
//           const dayIso = formatISO(date);
//           if (closedDays.includes(dayIso)) {
//             toast.error("Ce jour est déjà fermé.");
//           } else {
//             setSelectedDate(date);
//           }
//         }}
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
