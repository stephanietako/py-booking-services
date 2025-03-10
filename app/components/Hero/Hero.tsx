"use client";

import React, { useState } from "react";
import Calendar from "../Calendar/Calendar";
import { Day } from "@prisma/client";
import Image from "next/image";
import backgroundImg from "@/public/assets/hero.jpg";
// Styles
import styles from "./styles.module.scss";
import Modal from "../Modal/Modal";

export const dynamic = "force-dynamic";

interface HeroProps {
  days: Day[];
  closedDays: string[];
}

const Hero: React.FC<HeroProps> = ({ days, closedDays }) => {
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  // Fonction pour afficher ou masquer le calendrier
  const toggleCalendarVisibility = () => {
    setIsCalendarVisible(!isCalendarVisible);
  };
  const handleClick = (label: string) => {
    alert(`Vous avez cliqué sur : ${label}`);
  };

  return (
    <>
      <div className={styles.hero_wrapper}>
        <div>
          <h1>Yachting Day</h1>
        </div>
        <Image
          src={backgroundImg}
          alt="coucher de soleil avc vue sur des palmiers"
          className={styles.hero_image}
          priority={true}
          fill={true}
          placeholder="blur"
        />
        <div className={styles.hero}>
          <div className={styles.hero_content__left}>
            <div className={styles.hero_content__bloc}>
              <h2>Faites votre réservation facilement</h2>
              <p>Réservez votre bateau et vos services en quelques clics.</p>
              <button
                onClick={toggleCalendarVisibility}
                className={styles.calendar_btn}
              >
                {isCalendarVisible
                  ? "Cacher le calendrier"
                  : "Voir le calendrier"}
              </button>
            </div>
          </div>
          <div className={styles.hero_content__right}>
            <div className={styles.hero_content__right}>
              <button
                className={styles.button_hero}
                onClick={() => handleClick("Qui sommes-nous")}
              >
                Qui sommes-nous
              </button>
              <button
                className={styles.button_hero}
                onClick={() => handleClick("Location de bateau")}
              >
                Location de bateau
              </button>
              <button
                className={styles.button_hero}
                onClick={() => handleClick("Entretien de bateaux")}
              >
                Entretien de bateaux
              </button>
            </div>
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
