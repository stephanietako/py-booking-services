"use client";

import React, { useState } from "react"; // Ajout de useEffect
import Calendar from "../Calendar/Calendar";
import { Day } from "@prisma/client";
import Image from "next/image";
import logo from "@/public/assets/logo/hippo.png";
import placeholder from "@/public/assets/images/placeholder.svg";
import backgroundImg from "@/public/assets/images/header.webp";
import Modal from "../Modal/Modal";
import styles from "./styles.module.scss";

export const dynamic = "force-dynamic";

interface HeaderProps {
  days: Day[];
  closedDays: string[];
}

const Header: React.FC<HeaderProps> = ({ days, closedDays }) => {
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Ajout de isLoading

  const toggleCalendarVisibility = () => {
    setIsCalendarVisible(true);
    setIsLoading(true);

    // Simule le chargement du calendrier
    setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Ajuste le temps si besoin
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
            <div className={styles.logo_title_wrapper}>
              <div className={styles.logo_container}>
                <Image
                  src={logo || placeholder}
                  alt="Yachting Day Logo"
                  className={styles.logo}
                  width={100}
                  height={100}
                  priority
                />
              </div>
              <h2 className={styles.title}>Location et tarifications</h2>
            </div>
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
              Voir le calendrier
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCalendarVisible}
        onClose={() => setIsCalendarVisible(false)}
        title="Calendrier de réservation"
      >
        {isLoading ? (
          <p>Chargement du calendrier...</p>
        ) : (
          <Calendar days={days} closedDays={closedDays} />
        )}
      </Modal>
    </>
  );
};

export default Header;
