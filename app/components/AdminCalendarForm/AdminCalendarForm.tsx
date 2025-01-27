import React, { useState } from "react";

// Définir les types des props
type OpeningHour = {
  dayOfWeek: number;
  opening: string;
  closing: string;
};

type AdminCalendarFormProps = {
  openingHours: OpeningHour[]; // Les horaires d'ouverture
  onUpdate: (updatedHours: OpeningHour[]) => void; // Fonction pour mettre à jour les horaires
  closedDays: string[]; // Liste des jours fermés
};

const AdminCalendarForm: React.FC<AdminCalendarFormProps> = ({
  openingHours,
  onUpdate,
  closedDays,
}) => {
  const [hours, setHours] = useState<OpeningHour[]>(openingHours);

  // Fonction pour gérer la mise à jour des horaires
  const handleTimeChange = (
    dayOfWeek: number,
    type: "opening" | "closing",
    value: string
  ) => {
    const updatedHours = hours.map((service) =>
      service.dayOfWeek === dayOfWeek
        ? { ...service, [type]: value } // Le format doit être 'HH:mm'
        : service
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
                    type="time" // Utilisation de type "time" pour entrer une heure valide
                    value={service.opening}
                    onChange={(e) =>
                      handleTimeChange(
                        service.dayOfWeek,
                        "opening",
                        e.target.value
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="time" // Utilisation de type "time" pour entrer une heure valide
                    value={service.closing}
                    onChange={(e) =>
                      handleTimeChange(
                        service.dayOfWeek,
                        "closing",
                        e.target.value
                      )
                    }
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
