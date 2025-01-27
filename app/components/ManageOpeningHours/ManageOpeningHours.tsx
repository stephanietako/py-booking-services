"use client";

import { useState, useEffect } from "react";
import { getOpeningHours, postHoursToDataBase } from "@/actions/openingActions";
import { Day } from "@prisma/client";

const ManageOpeningHours: React.FC = () => {
  const [openingHours, setOpeningHours] = useState<Day[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Générer les options d'heures
  const generateTimeOptions = () => {
    return Array.from({ length: 19 }, (_, i) =>
      Array.from(
        { length: 2 },
        (_, j) =>
          `${(i + 5).toString().padStart(2, "0")}:${(j * 30)
            .toString()
            .padStart(2, "0")}`
      )
    ).flat();
  };

  const timeOptions = generateTimeOptions();

  // Récupérer les horaires d'ouverture depuis l'API
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const data: Day[] = await getOpeningHours(); // Récupère les horaires
        console.log("Données récupérées depuis l'API:", data);
        setOpeningHours(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des horaires :", err);
        setError("Impossible de récupérer les horaires.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Mise à jour des horaires
  const handleChange = async (
    dayId: string,
    key: "openTime" | "closeTime",
    value: string
  ) => {
    setError(null);
    setIsSaving(true);
    try {
      const updatedHours = openingHours.map((day) =>
        day.id === dayId ? { ...day, [key]: value } : day
      );

      if (!updatedHours.every((day) => day.id)) {
        throw new Error("Tous les jours doivent avoir un ID");
      }

      setOpeningHours(updatedHours); // Mise à jour locale
      await postHoursToDataBase(updatedHours); // Sauvegarde dans la base
      alert("Les horaires ont été mis à jour avec succès !");
    } catch (err) {
      console.error("Erreur lors de la mise à jour des horaires :", err);
      setError("Impossible de mettre à jour les horaires.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="manage-opening-hours">
      <h2>Gestion des horaires d&apos;ouverture</h2>
      {error && <p className="error">{error}</p>}
      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <table className="hours-table">
          <thead>
            <tr>
              <th>Jour</th>
              <th>Heure d&apos;ouverture</th>
              <th>Heure de fermeture</th>
            </tr>
          </thead>
          <tbody>
            {openingHours.map((day) => (
              <tr key={day.id}>
                <td>{day.name}</td>
                <td>
                  <select
                    value={day.openTime}
                    onChange={(e) =>
                      handleChange(day.id, "openTime", e.target.value)
                    }
                    aria-label={`Sélectionnez l'heure d'ouverture pour ${day.name}`}
                    disabled={isSaving}
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={day.closeTime}
                    onChange={(e) =>
                      handleChange(day.id, "closeTime", e.target.value)
                    }
                    aria-label={`Sélectionnez l'heure de fermeture pour ${day.name}`}
                    disabled={isSaving}
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageOpeningHours;
