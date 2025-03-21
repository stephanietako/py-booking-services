import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import styles from "./styles.module.scss";

interface Option {
  amount: number;
}

interface ServiceComptProps {
  name: string;
  description: string;
  amount: number;
  imageUrl: string;
  categories: string[];
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  options?: Option[]; // Liste des options
}

const ServiceCompt: React.FC<ServiceComptProps> = ({
  name,
  description,
  amount,
  imageUrl,
  categories,
  startTime,
  endTime,
  options = [], // Default à une liste vide si pas de options
}) => {
  // Vérifier si startTime est valide
  const isValidStartTime =
    startTime instanceof Date && !isNaN(startTime.getTime());
  const isValidEndTime = endTime instanceof Date && !isNaN(endTime.getTime());

  const formattedStartTime = isValidStartTime
    ? format(startTime as Date, "eeee dd MMMM yyyy 'de' HH:mm", { locale: fr })
    : null;

  const formattedEndTime = isValidEndTime
    ? format(endTime as Date, "HH:mm", { locale: fr })
    : null;

  // Calcul des options
  const totalOptionAmount = options.reduce(
    (sum, option) => sum + option.amount,
    0
  );
  const remainingAmount = amount + totalOptionAmount; // Montant restant à atteindre
  const progressValue =
    totalOptionAmount > amount ? 100 : (totalOptionAmount / amount) * 100; // Calcul de la barre de progression

  return (
    <div className={styles.service_card}>
      <div className={styles.service_card__img_content}>
        <Image
          src={imageUrl}
          alt={name}
          width={250}
          height={250}
          className={styles.service_card__img}
        />
      </div>
      <div className={styles.service_card__infos_bloc}>
        <h3 className={styles.service__title}>{name}</h3>
        <p className={styles.service__description}>{description}</p>
        <p className={styles.service__description}>{amount} €</p>

        <p className={styles.service__price}>
          Catégories :{" "}
          {categories.length > 0 ? categories.join(", ") : "Aucune"}
        </p>

        {/* Affichage des options */}
        <div className={styles.service__transactions}>
          <span>{totalOptionAmount} € dépensés</span>
          <span>{remainingAmount} € restant à payer</span>
        </div>

        {/* Barre de progression */}
        <div className={styles.service__progress}>
          <progress value={progressValue} max="100" />
        </div>

        {/* Affichage des horaires de réservation */}
        {formattedStartTime && formattedEndTime ? (
          <p className={styles.service__date}>
            Réservé pour : {formattedStartTime} à {formattedEndTime}
          </p>
        ) : (
          <p className={styles.service__date}>Pas encore réservé</p>
        )}
      </div>
    </div>
  );
};

export default ServiceCompt;
