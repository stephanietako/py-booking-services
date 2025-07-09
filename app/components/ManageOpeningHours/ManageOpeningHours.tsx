// // app/components/ManageOpeningHours/ManageOpeningHours.tsx
"use client";

import { FC, useState, useEffect, useMemo } from "react";
import { getOpeningHours, updateOpeningHours } from "@/actions/openingActions";
import { DayInput } from "@/types"; // Assurez-vous que DayInput correspond à votre modèle Day de Prisma
import {
  Service_opening_time,
  Service_closing_time,
  Interval,
} from "@/app/constants/config";
import { toast } from "react-hot-toast"; // Import de react-hot-toast
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

const ManageOpeningHours: FC = () => {
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
      setIsLoading(true);
      setError(null); // Réinitialiser l'erreur à chaque chargement
      try {
        const data = await getOpeningHours();
        setOpeningHrs(data);
      } catch (err) {
        console.error("Erreur au chargement des horaires:", err);
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
    const toastId = toast.loading("Sauvegarde des horaires...", {
      ariaProps: { role: "status", "aria-live": "polite" },
    });
    try {
      await updateOpeningHours(openingHrs);
      toast.success("Horaires mis à jour avec succès !", {
        id: toastId,
        ariaProps: { role: "status", "aria-live": "polite" },
      });
    } catch (err) {
      console.error("Erreur lors de la sauvegarde des horaires:", err);
      setError("Erreur lors de la sauvegarde des horaires.");
      toast.error("Erreur lors de la sauvegarde des horaires.", {
        id: toastId,
        ariaProps: { role: "alert", "aria-live": "assertive" },
      });
    } finally {
      setIsSaving(false);
      // toast.dismiss(toastId); // Le toast success/error dismiss lui-même le loading toast
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading_container}>
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
              aria-label={`Heure d'ouverture pour ${day.name}`}
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
              aria-label={`Heure de fermeture pour ${day.name}`}
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
        <button
          onClick={saveOpeningHrs}
          disabled={isSaving}
          className={styles.save_button}
        >
          {isSaving ? "Sauvegarde en cours..." : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
};

export default ManageOpeningHours;
