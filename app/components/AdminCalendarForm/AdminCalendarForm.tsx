// app/admin/components/AdminCalendarForm.tsx
import { ServiceHours } from "@/type";
import React, { useState } from "react";

// Définir les types des props
type AdminCalendarFormProps = {
  openingHours: ServiceHours[]; // Les horaires d'ouverture
  onUpdate: (updatedHours: ServiceHours[]) => void; // Fonction pour mettre à jour les horaires
  closedDays: string[]; // Liste des jours fermés
};

const AdminCalendarForm: React.FC<AdminCalendarFormProps> = ({
  openingHours,
  onUpdate,
  closedDays,
}) => {
  const [hours, setHours] = useState<ServiceHours[]>(openingHours);

  // Fonction pour gérer la mise à jour des horaires
  const handleTimeChange = (
    dayOfWeek: string,
    type: "opening" | "closing",
    value: number
  ) => {
    const updatedHours = hours.map((service) =>
      service.dayOfWeek === dayOfWeek ? { ...service, [type]: value } : service
    );
    setHours(updatedHours);
  };

  // Fonction pour soumettre les changements des horaires
  const handleSubmit = () => {
    onUpdate(hours);
  };

  return (
    <div>
      <h2>Calendrier des jours fermés</h2>
      <ul>
        {closedDays.length === 0 ? (
          <p>Aucun jour fermé</p>
        ) : (
          closedDays.map((day) => <li key={day}>{day}</li>)
        )}
      </ul>

      <h3>Gestion des horaires d&apos;ouverture</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <table>
          <thead>
            <tr>
              <th>Jour</th>
              <th>Heure d&apos;ouverture</th>
              <th>Heure de fermeture</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((service) => (
              <tr key={service.dayOfWeek}>
                <td>{service.dayOfWeek}</td>
                <td>
                  <input
                    type="number"
                    value={service.opening}
                    onChange={(e) =>
                      handleTimeChange(
                        service.dayOfWeek,
                        "opening",
                        parseInt(e.target.value)
                      )
                    }
                    min={0}
                    max={23}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={service.closing}
                    onChange={(e) =>
                      handleTimeChange(
                        service.dayOfWeek,
                        "closing",
                        parseInt(e.target.value)
                      )
                    }
                    min={0}
                    max={23}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button type="submit">Mettre à jour les horaires</button>
      </form>
    </div>
  );
};

export default AdminCalendarForm;
