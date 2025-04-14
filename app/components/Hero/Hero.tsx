import React from "react";
import Image from "next/image";
//import Link from "next/link"; // Importation de Link
import backgroundImg from "@/public/assets/images/hero.webp"; // Importation de l'image de fond
// Styles
import styles from "./styles.module.scss";

export const dynamic = "force-dynamic";

const Hero: React.FC = () => {
  return (
    <div className={styles.heroWrapper}>
      <Image
        src={backgroundImg}
        alt="plan rapproché vue mer"
        className={styles.heroImage}
        priority
        fill
        placeholder="blur"
      />
      <div className={styles.heroContent}>
        <div className={styles.hero_container}>
          <div className={styles.hero_bloc}>
            <div className={styles.hero_text}>
              <h1>Locations & Entretiens</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
