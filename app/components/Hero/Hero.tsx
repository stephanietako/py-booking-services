import React from "react";
import Image from "next/image";
import backgroundImg from "@/public/assets/images/hero.webp"; // Importation de l'image de fond
// Styles
import styles from "./styles.module.scss";

export const dynamic = "force-dynamic";

const Hero: React.FC = () => {
  return (
    <div className={styles.heroWrapper}>
      <Image
        src={backgroundImg}
        alt="Yachting Day location de bateau Cap Camarat 12.5 WA – modèle 2021 port de cavalaire-sur-mer et maintenance nautique"
        className={styles.heroImage}
        priority
        fill
        placeholder="blur"
      />
      <div className={styles.heroContent}>
        <div className={styles.hero_container}>
          <div className={styles.hero_bloc}>
            <div className={styles.hero_text}>
              <h1>Location De Bateau Cavalaire-Sur-Mer</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
