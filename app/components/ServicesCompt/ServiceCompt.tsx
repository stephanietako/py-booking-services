"use client";

import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
// Styles
import styles from "./styles.module.scss";

interface Option {
  id: string;
  description: string;
  amount: number;
}

interface ServiceComptProps {
  name: string;
  description: string;
  imageUrl: string;
  categories: string[];
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  options?: Option[];
  totalAmount: number;
}

const ServiceCompt: React.FC<ServiceComptProps> = ({
  name,
  description,
  imageUrl,
  categories,
  startTime,
  endTime,
  options = [],
  totalAmount,
}) => {
  return (
    <div className={styles.service_card}>
      <div className={styles.__img_content}>
        <Image
          src={imageUrl || "/assets/logo/logo-full.png"}
          alt={name}
          width={200}
          height={200}
          className={styles.__img}
        />
      </div>

      <div className={styles.service_card__infos_bloc}>
        <h3 className={styles.service__title}>{name}</h3>
        <p className={styles.service__description}>{description}</p>

        <p className={styles.service__amount}>
          <strong>Total :</strong> {totalAmount.toFixed(2)} €
        </p>

        <p className={styles.service__categories}>
          <strong>Catégories :</strong>{" "}
          {categories.length > 0 ? categories.join(", ") : "Aucune"}
        </p>

        {options.length > 0 && (
          <div className={styles.service__options}>
            <strong>Options incluses :</strong>
            <ul>
              {options.map((option) => (
                <li key={option.id}>
                  <strong>{option.description} :</strong>{" "}
                  {option.amount.toFixed(2)} €
                </li>
              ))}
            </ul>
          </div>
        )}

        {startTime && endTime ? (
          <p className={styles.service__date}>
            <strong>Réservé pour :</strong>{" "}
            {format(new Date(startTime), "eeee dd MMMM yyyy 'de' HH:mm", {
              locale: fr,
            })}
            à {format(new Date(endTime), "HH:mm", { locale: fr })}
          </p>
        ) : (
          <p className={styles.service__date}>Pas encore réservé</p>
        )}
      </div>
    </div>
  );
};

export default ServiceCompt;
