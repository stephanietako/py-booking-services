"use client";

import React from "react";
import Image from "next/image";
import styles from "./styles.module.scss";
// Ce composant Service est une fonction qui reçoit des propriétés (title, description, price, imageUrl)
//et les affiche.
interface ServiceComptProps {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
}

const ServiceCompt: React.FC<ServiceComptProps> = ({
  title,
  description,
  price,
  imageUrl,
}) => {
  return (
    <div className={styles.service}>
      <div className={styles.image_container}>
        <Image
          src={imageUrl}
          alt={title}
          width={250}
          height={200}
          style={{
            display: "block",
            objectFit: "cover",
          }}
          className={styles.service_image}
        />
      </div>

      <h2 className={styles.service__title}>{title}</h2>
      <p className={styles.service__description}>{description}</p>
      <p className={styles.service__price}>{price}</p>
    </div>
  );
};

export default ServiceCompt;
