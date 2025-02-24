import React from "react";
import Image from "next/image";
// Styles
import styles from "./styles.module.scss";
import { format } from "date-fns";

interface ServiceComptProps {
  name: string;
  description: string;
  amount: number;
  imageUrl: string;
  categories: string[];
}

const ServiceCompt: React.FC<ServiceComptProps> = ({
  name,
  description,
  amount,
  imageUrl,
  categories,
}) => {
  // Récupérer l'heure et la date sélectionnées depuis `localStorage`
  const selectedTime = localStorage.getItem("selectedTime");
  // Vérifier si selectedTime existe et le formater
  let formattedDate = "";
  if (selectedTime) {
    const date = new Date(selectedTime); // Convertir en objet Date
    formattedDate = format(date, "iiii dd MMMM yyyy 'à' HH:mm"); // Exemple: "Tuesday 27 February 2025 at 08:00"
  }
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
        {/* <Image src={imageUrl} alt={name} width={100} height={100} /> */}
        <h3 className={styles.service__title}>{name}</h3>
        <p className={styles.service__description}>{description}</p>
        <p className={styles.service__description}>{amount} €</p>

        <p className={styles.service__price}>
          Catégories :{" "}
          {categories.length > 0 ? categories.join(", ") : "Aucune"}
        </p>
        {/* Afficher la date et l'heure sélectionnées */}
        {formattedDate && (
          <p className={styles.service__date}>Réservé pour : {formattedDate}</p>
        )}
      </div>
    </div>
  );
};

export default ServiceCompt;
