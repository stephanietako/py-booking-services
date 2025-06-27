"use client";

import React, { useState, useEffect, useMemo } from "react";
import { formatISO } from "date-fns";
import { getClosedDays, openDay, closeDay } from "@/actions/openingActions";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";

const DynamicCalendar = dynamic(() => import("react-calendar"), { ssr: false });

const ClosedDays: React.FC = () => {
  const [closedDays, setClosedDays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Mémoriser l'état du jour sélectionné
  const selectedDateIso = useMemo(
    () => (selectedDate ? formatISO(selectedDate) : null),
    [selectedDate]
  );

  const isSelectedDayClosed = useMemo(
    () => (selectedDateIso ? closedDays.includes(selectedDateIso) : false),
    [closedDays, selectedDateIso]
  );

  // Charger les jours fermés au montage
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
      } catch {
        toast.error("Erreur lors du chargement des jours fermés.", {
          id: toastId,
          ariaProps: { role: "alert", "aria-live": "assertive" },
        });
        setIsDataLoaded(true); // Même en cas d'erreur, on marque comme chargé
      }
    }
    fetchData();
  }, []);

  // Fonction mémorisée pour le className des tuiles
  const getTileClassName = useMemo(() => {
    return ({ date }: { date: Date }) =>
      closedDays.includes(formatISO(date)) ? "closed-day" : null;
  }, [closedDays]);

  // Gestion de l'ouverture/fermeture d'un jour
  const handleDayChange = async () => {
    if (!selectedDate || loading || !selectedDateIso) return;

    const toastId = toast.loading("Mise à jour en cours...", {
      ariaProps: { role: "status", "aria-live": "polite" },
    });

    setLoading(true);
    try {
      if (isSelectedDayClosed) {
        await openDay({ date: new Date(selectedDateIso) });
        setClosedDays((prev) => prev.filter((d) => d !== selectedDateIso));
        toast.success("Le jour a été ouvert avec succès.", {
          id: toastId,
          ariaProps: { role: "status", "aria-live": "polite" },
        });
      } else {
        await closeDay({ date: new Date(selectedDateIso) });
        setClosedDays((prev) => [...prev, selectedDateIso]);
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

  // Affichage de chargement pour éviter l'hydratation avec des données vides
  if (!isDataLoaded) {
    return (
      <div className="closed_days_container">
        <h2>Gérer les jours fermés</h2>
        <p>Chargement du calendrier...</p>
      </div>
    );
  }

  return (
    <div
      className="closed_days_container"
      style={{
        padding: "20px",
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        marginTop: "20px",
        display: "flex",
        width: "100%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h2
        style={{
          color: "#1e293b",
          marginBottom: "1rem",
          fontSize: "1.2rem",
          fontWeight: 700,
        }}
      >
        Gérer les jours fermés
      </h2>

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
      >
        {isSelectedDayClosed ? "Ouvrir ce jour" : "Fermer ce jour"}
      </button>
    </div>
  );
};

export default ClosedDays;
