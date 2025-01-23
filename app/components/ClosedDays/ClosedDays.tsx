import React from "react";
import { formatISO } from "date-fns";
// Définir les types des props
type ClosedDaysProps = {
  closedDays: string[]; // Liste des jours fermés sous forme de chaînes (par exemple, formatISO)
  onClose: (date: { date: Date }) => Promise<void>; // Fonction pour fermer un jour
  onOpen: (date: { date: Date }) => Promise<void>; // Fonction pour ouvrir un jour
};

const ClosedDays: React.FC<ClosedDaysProps> = ({
  closedDays,
  onClose,
  onOpen,
}) => {
  // Fonction utilitaire pour convertir une date en chaîne ISO et obtenir un objet Date
  const handleClose = async (date: string) => {
    try {
      const dateObj = new Date(date);
      await onClose({ date: dateObj });
    } catch (error) {
      console.error("Erreur lors de la fermeture du jour", error);
    }
  };

  const handleOpen = async (date: string) => {
    try {
      const dateObj = new Date(date); // Convertir la chaîne en objet Date
      await onOpen({ date: dateObj });
    } catch (error) {
      console.error("Erreur lors de l'ouverture du jour", error);
    }
  };

  return (
    <div>
      <h2>Jours Fermés</h2>
      <ul>
        {closedDays.length === 0 ? (
          <p>Aucun jour fermé</p>
        ) : (
          closedDays.map((day) => (
            <li key={day}>
              <span>{day}</span>
              <button onClick={() => handleOpen(day)}>Ouvrir</button>
            </li>
          ))
        )}
      </ul>
      <h2>Ajouter un Jour Fermé</h2>
      <button
        onClick={() => {
          const date = new Date(); // Exemple d'ajout du jour actuel comme fermé
          handleClose(formatISO(date)); // Ajouter le jour actuel comme fermé
        }}
      >
        Fermer le jour actuel
      </button>
    </div>
  );
};

export default ClosedDays;
