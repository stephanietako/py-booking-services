"use client";

import React, { useState } from "react";
import CalendarComponent from "../Calendar/Calendar";
import { Day } from "@prisma/client";
import Image from "next/image";
import backgroundImg from "@/public/assets/default.jpg";
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

  return (
    <div className={styles.hero_wrapper}>
      <Image
        src={backgroundImg}
        alt="coucher de soleil avc vue sur des palmiers"
        className={styles.hero_image}
        priority={true}
        fill={true}
        placeholder="blur"
      />
      <div className={styles.hero_content}>
        <div className={styles.hero_content__bloc}>
          <h1>Faites votre réservation facilement</h1>
          <p>Réservez votre bateau et vos services en quelques clics.</p>
          <button
            onClick={toggleCalendarVisibility}
            className={styles.calendar_btn}
          >
            {isCalendarVisible ? "Cacher le calendrier" : "Voir le calendrier"}
          </button>
        </div>
      </div>
      {/* MODAL */}
      <Modal
        isOpen={isCalendarVisible}
        onClose={toggleCalendarVisibility}
        title="Choisissez une date"
      >
        <p>Réservez votre bateau dès maintenant !</p>
        <CalendarComponent days={days} closedDays={closedDays} />
      </Modal>
    </div>
  );
};

export default Hero;
