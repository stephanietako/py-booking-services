// "use client";

// import { useState, useEffect } from "react";
// import { getOpeningHours, updateOpeningHours } from "@/actions/openingActions";
// import { DayInput } from "@/types";

// const ManageOpeningHours: React.FC = () => {
//   // État pour stocker les horaires d'ouverture récupérés
//   const [openingHrs, setOpeningHrs] = useState<DayInput[]>([]);

//   // État pour suivre si l'on est en train de sauvegarder les horaires
//   const [isSaving, setIsSaving] = useState(false);

//   // État pour gérer les erreurs (si une erreur se produit lors de la récupération ou de la sauvegarde)
//   const [error, setError] = useState<string | null>(null);

//   // useEffect pour récupérer les horaires d'ouverture au moment du montage du composant
//   useEffect(() => {
//     // Fonction asynchrone pour récupérer les horaires d'ouverture
//     async function fetchData() {
//       try {
//         // Appel à l'API pour récupérer les horaires d'ouverture
//         const data = await getOpeningHours();
//         setOpeningHrs(data); // On met à jour l'état avec les horaires récupérés
//       } catch {
//         // En cas d'erreur, on affiche un message d'erreur
//         setError("Erreur lors du chargement des horaires.");
//       }
//     }
//     fetchData(); // Appel de la fonction pour récupérer les données
//   }, []); // Le tableau vide signifie que cet effet se lance uniquement au montage du composant

//   // Fonction pour gérer le changement des horaires d'ouverture ou de fermeture
//   const handleChange = (
//     dayOfWeek: number, // Jour de la semaine
//     type: "openTime" | "closeTime", // Type de l'heure (ouverture ou fermeture)
//     value: string // Valeur de l'heure modifiée
//   ) => {
//     // Mise à jour de l'état 'openingHrs' avec la nouvelle valeur pour le jour concerné
//     setOpeningHrs((prev) =>
//       prev.map(
//         (day) => (day.dayOfWeek === dayOfWeek ? { ...day, [type]: value } : day) // On met à jour l'heure correspondant au jour
//       )
//     );
//   };

//   // Fonction pour sauvegarder les horaires modifiés
//   const saveOpeningHrs = async () => {
//     setIsSaving(true); // Indique que la sauvegarde est en cours
//     setError(null); // Réinitialise l'erreur avant de tenter la sauvegarde
//     try {
//       // Appel à l'API pour sauvegarder les horaires modifiés
//       await updateOpeningHours(openingHrs);
//       alert("Horaires mis à jour avec succès !"); // Message de succès
//     } catch {
//       // En cas d'erreur lors de la sauvegarde, on met à jour l'état d'erreur
//       setError("Erreur lors de la sauvegarde des horaires.");
//     } finally {
//       setIsSaving(false); // On désactive l'état de sauvegarde en fin de processus
//     }
//   };

//   return (
//     <div>
//       <h2>Gérer les horaires d&apos;ouverture</h2>
//       {error && <p className="error">{error}</p>}{" "}
//       {/* Affiche le message d'erreur si présent */}
//       <div className="hours-container">
//         {/* On affiche une ligne pour chaque jour de la semaine */}
//         {openingHrs.map((day) => (
//           <div key={day.dayOfWeek} className="hour-row">
//             {/* Affiche le nom du jour */}
//             <span className="day-name">{day.name}</span>

//             {/* Champ pour l'heure d'ouverture */}
//             <input
//               type="time"
//               value={day.openTime}
//               onChange={(e) =>
//                 handleChange(day.dayOfWeek, "openTime", e.target.value)
//               }
//               disabled={isSaving} // Désactive les champs pendant la sauvegarde
//             />

//             {/* Champ pour l'heure de fermeture */}
//             <input
//               type="time"
//               value={day.closeTime}
//               onChange={(e) =>
//                 handleChange(day.dayOfWeek, "closeTime", e.target.value)
//               }
//               disabled={isSaving} // Désactive les champs pendant la sauvegarde
//             />
//           </div>
//         ))}

//         {/* Bouton pour sauvegarder les horaires */}
//         <button onClick={saveOpeningHrs} disabled={isSaving}>
//           Sauvegarder
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ManageOpeningHours;
"use client";

import { useState, useEffect } from "react";
import { getOpeningHours, updateOpeningHours } from "@/actions/openingActions";
import { DayInput } from "@/types";
import {
  Service_opening_time,
  Service_closing_time,
  Interval,
} from "@/app/constants/config";

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

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getOpeningHours();
        setOpeningHrs(data);
      } catch {
        setError("Erreur lors du chargement des horaires.");
      }
    }
    fetchData();
  }, []);

  // Trier les jours dans l'ordre de la semaine (Lundi, Mardi, ...)
  const sortedOpeningHrs = openingHrs.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

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

  return (
    <div>
      <h2>Gérer les horaires d&apos;ouverture</h2>
      {error && <p className="error">{error}</p>}

      <div className="hours-container">
        {/* Affichage des jours triés */}
        {sortedOpeningHrs.map((day) => (
          <div key={day.dayOfWeek} className="hour-row">
            <span className="day-name">{day.name}</span>

            {/* Sélecteur pour l'heure d'ouverture */}
            <select
              value={day.openTime}
              onChange={(e) =>
                handleChange(day.dayOfWeek, "openTime", e.target.value)
              }
              disabled={isSaving}
            >
              {generateTimeSlots().map((timeSlot) => (
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
              {generateTimeSlots().map((timeSlot) => (
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
