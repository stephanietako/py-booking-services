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

const Hero: React.FC<HeroProps> = ({ days, closedDays }) => {
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const toggleCalendarVisibility = () => {
    setIsCalendarVisible(!isCalendarVisible);
  };

  const handleClick = (label: string) => {
    alert(`Vous avez cliqué sur : ${label}`);
  };

  return (
    <>
      <div className={styles.heroWrapper}>
        <Image
          src={backgroundImg}
          alt="Coucher de soleil avec vue sur des palmiers"
          className={styles.heroImage}
          priority={true}
          fill={true}
          placeholder="blur"
        />
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1>Yachting Day</h1>
            <h2>Faites votre réservation facilement</h2>
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
          <div className={styles.heroButtons}>
            <button
              className={styles.buttonHero}
              onClick={() => handleClick("Qui sommes-nous")}
            >
              Qui sommes-nous
            </button>
            <button
              className={styles.buttonHero}
              onClick={() => handleClick("Location de bateau")}
            >
              Location de bateau
            </button>
            <button
              className={styles.buttonHero}
              onClick={() => handleClick("Entretien de bateaux")}
            >
              Entretien de bateaux
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

export default Hero;
