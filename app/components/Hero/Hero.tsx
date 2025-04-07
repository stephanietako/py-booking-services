import React from "react";
import Image from "next/image";
import Link from "next/link"; // Importation de Link
import backgroundImg from "@/public/assets/images/hero.jpg"; // Importation de l'image de fond
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
        priority={true}
        fill={true}
        placeholder="blur"
      />
      <div className={styles.heroContent}>
        <div className={styles.hero_container}>
          <div className={styles.hero_bloc}>
            <div className={styles.heroButtons}>
              <Link href="/about" className={styles.buttonHero}>
                Qui sommes-nous
              </Link>
              <Link href="/tarifs" className={styles.buttonHero}>
                Location
              </Link>
              <Link href="/entretien" className={styles.buttonHero}>
                Entretien
              </Link>
              <Link href="#footer" className={styles.buttonHero}>
                Contact
              </Link>
            </div>
            <div className={styles.hero_text}>
              <h1>Locations de bateau à la journée</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
