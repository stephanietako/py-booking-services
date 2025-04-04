import React from "react";
import Image from "next/image";
import Link from "next/link"; // Importation de Link
import backgroundImg from "@/public/assets/images/hero.webp";
// Styles
import styles from "./styles.module.scss";

export const dynamic = "force-dynamic";

const Hero: React.FC = () => {
  return (
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
          <h1>Yachting Day</h1>
          <h2>Faites votre réservation facilement</h2>
          <span className={styles.heroText__tarifs_btn}>
            <Link href="#tarifs" className={styles.buttonHero}>
              Location de bateau
            </Link>
          </span>

          <p>
            Bienvenue sur la plateforme de réservation de
            <strong>Yachting Day</strong> !
          </p>
          <p>
            Situé sur le port de Cavalaire, au cœur de la baie du golfe de
            Saint-Tropez, nous vous proposons une expérience de navigation
            unique.
          </p>
          <p>
            Louez notre bateau et profitez de services personnalisés à bord : un
            capitaine expérimenté si besoin, une hôtesse pour un confort
            optimal, ainsi qu&apos;un service traiteur en partenariat avec des
            professionnels locaux.
          </p>
          <p>
            Nous proposons également des prestations d’entretien et de
            maintenance navale incluant le lavage de teck, la restauration des
            inox, le polish du gelcoat et bien plus encore, avec intervention
            dans les ports de Saint-Tropez, Port-Grimaud, Marine de Cogolin et
            Cavalaire.
          </p>
        </div>
        <div className={styles.heroButtons}>
          {/* link about */}
          <Link href="#about" className={styles.buttonHero}>
            Qui sommes-nous
          </Link>
          {/* link maintenance */}
          <Link href="#maintenance" className={styles.buttonHero}>
            Entretien de bateaux
          </Link>
          {/* link location */}
          <Link href="#footer" className={styles.buttonHero}>
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
