// app/components/ClosedDays/ClosedDays.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { formatISO, startOfDay } from "date-fns";
import { getClosedDays, openDay, closeDay } from "@/actions/openingActions";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";

import "react-calendar/dist/Calendar.css";

import "../Calendar/Calendar.scss";

const DynamicCalendar = dynamic(() => import("react-calendar"), { ssr: false });

const ClosedDays: React.FC = () => {
  const [closedDays, setClosedDays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const selectedDateIso = useMemo(
    () =>
      selectedDate
        ? formatISO(startOfDay(selectedDate), { representation: "date" })
        : null,
    [selectedDate]
  );

  const isSelectedDayClosed = useMemo(
    () => (selectedDateIso ? closedDays.includes(selectedDateIso) : false),
    [closedDays, selectedDateIso]
  );

  useEffect(() => {
    async function fetchData() {
      const toastId = toast.loading("Chargement des jours fermés...", {
        ariaProps: { role: "status", "aria-live": "polite" },
      });
      try {
        const data = await getClosedDays();
        setClosedDays(data);
        setIsDataLoaded(true);
        toast.success("Jours fermés chargés avec succès.", {
          id: toastId,
          ariaProps: { role: "status", "aria-live": "polite" },
        });
      } catch (err) {
        console.error("Erreur lors du chargement des jours fermés:", err);
        toast.error("Erreur lors du chargement des jours fermés.", {
          id: toastId,
          ariaProps: { role: "alert", "aria-live": "assertive" },
        });
        setIsDataLoaded(true);
      }
    }
    fetchData();
  }, []);

  const getTileClassName = useMemo(() => {
    return ({ date }: { date: Date }) =>
      closedDays.includes(
        formatISO(startOfDay(date), { representation: "date" })
      )
        ? "closed-day"
        : null;
  }, [closedDays]);

  const handleDayChange = async () => {
    if (!selectedDate || loading || !selectedDateIso) return;

    const toastId = toast.loading("Mise à jour en cours...", {
      ariaProps: { role: "status", "aria-live": "polite" },
    });

    setLoading(true);
    try {
      const dateToUpdate = new Date(selectedDateIso);

      if (isSelectedDayClosed) {
        await openDay({ date: dateToUpdate });
        setClosedDays((prev) => prev.filter((d) => d !== selectedDateIso));
        toast.success("Le jour a été ouvert avec succès.", {
          id: toastId,
          ariaProps: { role: "status", "aria-live": "polite" },
        });
      } else {
        await closeDay({ date: dateToUpdate });
        setClosedDays((prev) => [...prev, selectedDateIso]);
        toast.success("Le jour a été fermé avec succès.", {
          id: toastId,
          ariaProps: { role: "status", "aria-live": "polite" },
        });
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour des jours:", err);
      toast.error("Erreur lors de la mise à jour des jours.", {
        id: toastId,
        ariaProps: { role: "alert", "aria-live": "assertive" },
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isDataLoaded) {
    return (
      <div
        className="calendar_container"
        style={{ textAlign: "center", padding: "20px" }}
      >
        <p>Chargement du calendrier...</p>
      </div>
    );
  }

  return (
    <div className="calendar_container">
      {" "}
      <h2 className="title"> Gérer les jours fermés</h2>
      <DynamicCalendar
        minDate={new Date()}
        tileClassName={getTileClassName}
        onClickDay={(date) => setSelectedDate(date)}
        aria-label="Calendrier des jours fermés"
      />
      <button
        onClick={handleDayChange}
        disabled={!selectedDate || loading}
        aria-label={
          isSelectedDayClosed
            ? "Ouvrir le jour sélectionné"
            : "Fermer le jour sélectionné"
        }
        aria-disabled={!selectedDate || loading}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: isSelectedDayClosed
            ? "var(--couleur-erreur)"
            : "var(--couleur-succes)",
          color: "var(--blanc)",
          border: "none",
          borderRadius: "5px",
          transition: "background-color 0.3s ease",
        }}
      >
        {isSelectedDayClosed ? "Ouvrir ce jour" : "Fermer ce jour"}
      </button>
    </div>
  );
};

export default ClosedDays;
