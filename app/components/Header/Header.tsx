"use client";

import React, { useState } from "react";
import Calendar from "../Calendar/Calendar";
import { Day } from "@prisma/client";
import Image from "next/image";
import backgroundImg from "@/public/assets/hero.jpg";
import Modal from "../Modal/Modal";
// Styles
import styles from "./styles.module.scss";

export const dynamic = "force-dynamic";

interface HeroProps {
  days: Day[];
  closedDays: string[];
}

const Header: React.FC<HeroProps> = ({ days, closedDays }) => {
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const toggleCalendarVisibility = () => {
    setIsCalendarVisible(!isCalendarVisible);
  };

  return (
    <>
      <div className={styles.heroWrapper}>
        <Image
          src={backgroundImg}
          alt="Vue du bateau en pleine mer avec des passagers"
          className={styles.heroImage}
          priority={true}
          fill={true}
          placeholder="blur"
        />
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h2>Yachting Day</h2>
            <h3>Grilles tarifaires</h3>
            <p>Période du 16 octobre au 31 mai: 1500 euros/jour.</p>
            <p>
              Période du 1er juin au 07 juillet et du 1er septembre au 15
              octobre: 1700 euros/jour.
            </p>
            <p>Période du 08 juillet au 31 aout: 1900 euros/Jour</p>
            <h4>Faites votre réservation facilement</h4>
            <p>Réservez votre bateau et vos services en quelques clics.</p>
            <button
              onClick={toggleCalendarVisibility}
              className={styles.calendarBtn}
            >
              {isCalendarVisible
                ? "Cacher le calendrier"
                : "Voir le calendrier"}
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isCalendarVisible}
        onClose={toggleCalendarVisibility}
        title="Choisissez une date"
      >
        <p>Réservez votre bateau dès maintenant !</p>
        <Calendar days={days} closedDays={closedDays} />
      </Modal>
    </>
  );
};

export default Header;
