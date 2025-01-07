"use client";

import React from "react";
import Image from "next/image";
import styles from "./styles.module.scss";
// Ce composant Service est une fonction qui reçoit des propriétés (title, description, price, imageUrl)
//et les affiche.
interface ServiceComptProps {
  name: string;
  description: string;
  amount: string;
  imageUrl: string;
}

const ServiceCompt: React.FC<ServiceComptProps> = ({
  name,
  description,
  amount,
  imageUrl,
}) => {
  return (
    <div className={styles.service}>
      <h1>SERVICECOMPT</h1>
      <div className={styles.image_container}>
        <Image
          src={imageUrl}
          alt={name}
          width={250}
          height={200}
          style={{
            display: "block",
            objectFit: "cover",
          }}
          className={styles.service_image}
        />
      </div>

      <h2 className={styles.service__name}>{name}</h2>
      <p className={styles.service__description}>{description}</p>
      <p className={styles.service__amount}>{amount}</p>
    </div>
  );
};

export default ServiceCompt;
