"use client";

import { useState, useEffect, useMemo } from "react";
import { getOpeningHours, updateOpeningHours } from "@/actions/openingActions";
import { DayInput } from "@/types";
import {
  Service_opening_time,
  Service_closing_time,
  Interval,
} from "@/app/constants/config";
// Styles
import styles from "./styles.module.scss";

// Fonction pour générer des créneaux horaires à intervalles réguliers (par exemple, 30 minutes)
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = Service_opening_time; hour <= Service_closing_time; hour++) {
    for (let minute = 0; minute < 60; minute += Interval) {
      const time = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      slots.push(time);
    }
  }
  return slots;
};

const ManageOpeningHours: React.FC = () => {
  const [openingHrs, setOpeningHrs] = useState<DayInput[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mémoriser les créneaux horaires pour éviter la régénération
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Mémoriser le tri pour éviter les recalculs inutiles
  const sortedOpeningHrs = useMemo(() => {
    return [...openingHrs].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }, [openingHrs]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await getOpeningHours();
        setOpeningHrs(data);
      } catch {
        setError("Erreur lors du chargement des horaires.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleChange = (
    dayOfWeek: number,
    type: "openTime" | "closeTime",
    value: string
  ) => {
    setOpeningHrs((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, [type]: value } : day
      )
    );
  };

  const saveOpeningHrs = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateOpeningHours(openingHrs);
      alert("Horaires mis à jour avec succès !");
    } catch {
      setError("Erreur lors de la sauvegarde des horaires.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <p>Chargement des horaires...</p>
      </div>
    );
  }

  return (
    <div className={styles.container_manage_hours}>
      <h2>Gérer les horaires d&apos;ouverture</h2>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.hours_container}>
        {/* Affichage des jours triés */}
        {sortedOpeningHrs.map((day) => (
          <div key={day.dayOfWeek} className={styles.hour_row}>
            <span className={styles.day_name}>{day.name}</span>

            {/* Sélecteur pour l'heure d'ouverture */}
            <select
              value={day.openTime}
              onChange={(e) =>
                handleChange(day.dayOfWeek, "openTime", e.target.value)
              }
              disabled={isSaving}
            >
              {timeSlots.map((timeSlot) => (
                <option key={timeSlot} value={timeSlot}>
                  {timeSlot}
                </option>
              ))}
            </select>

            {/* Sélecteur pour l'heure de fermeture */}
            <select
              value={day.closeTime}
              onChange={(e) =>
                handleChange(day.dayOfWeek, "closeTime", e.target.value)
              }
              disabled={isSaving}
            >
              {timeSlots.map((timeSlot) => (
                <option key={timeSlot} value={timeSlot}>
                  {timeSlot}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Bouton pour sauvegarder les horaires */}
        <button onClick={saveOpeningHrs} disabled={isSaving}>
          Sauvegarder
        </button>
      </div>
    </div>
  );
};

export default ManageOpeningHours;
