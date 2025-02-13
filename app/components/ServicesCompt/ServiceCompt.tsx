import React from "react";
import Image from "next/image";
// Styles
import styles from "./styles.module.scss";

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
      </div>
    </div>
  );
};

export default ServiceCompt;
