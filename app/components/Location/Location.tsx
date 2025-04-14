"use client";

import React from "react";
import Image from "next/image";
import styles from "./styles.module.scss";
import backgroundImg from "@/public/assets/images/plage-pampelonne.webp";
import Link from "next/link";

const Location: React.FC = () => {
  return (
    <div className={styles.locationSection} id="location">
      <div className={styles.titleBlock}>
        <h2>Location</h2>
        <div className={styles.buttons}>
          <Link href="/boat" className={styles.button}>
            Le bateau
          </Link>
          <Link href="/environs" className={styles.button}>
            Les environs
          </Link>
          <Link href="/excursions" className={styles.button}>
            Nos Excursions
          </Link>
        </div>
      </div>

      <div className={styles.hero}>
        <Image
          src={backgroundImg}
          alt="Plage Pampelonne"
          fill
          priority
          placeholder="blur"
          className={styles.heroBg}
        />
        <div className={styles.heroContent}>
          <div className={styles.left}>
            <p>
              Période du 16 octobre au 31 mai: <strong>1500€ / jour</strong>
            </p>
            <p>
              Période du 1er juin au 07 juillet et du 1er septembre au 15
              octobre: <strong>1700€ / jour</strong>
            </p>
            <p>
              Période du 08 juillet au 31 août: <strong>1900€ / jour</strong>
            </p>
            <h4>Faites votre réservation facilement</h4>
            <p>Réservez votre bateau et vos services en un clic.</p>
          </div>
          <div className={styles.heroContent}>
            <div className={styles.right}>
              <p id={styles.right_text}>
                Depuis le port de Cavalaire, embarquez pour une journée de rêve
                avec Yachting Day
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.cta}>
        <a href="mailto:yachtingday@gmail.com" className={styles.ctaButton}>
          Réservez votre bateau
        </a>
      </div>
    </div>
  );
};

export default Location;
