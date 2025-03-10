import Image from "next/image";
import image1 from "@/public/assets/Cap-Camarat1-Plan-de-Cabine.jpg";
import image2 from "@/public/assets/Cap-Camarat3-Plan-de-Pont.jpg";
import image3 from "@/public/assets/Cap-Camarat1-Plan-de-Cabine.jpg";
import styles from "./styles.module.scss";

export const dynamic = "force-dynamic";

const Boat = () => {
  return (
    <div className={styles.boat}>
      {/* En-tête avec image et titre */}
      <div className={styles.header}>
        <h2 className={styles.title}>Le Bateau</h2>
        <Image
          src={image1}
          alt="Cap Camarat 12.5 Wa"
          className={styles.mainImage}
          width={500}
          height={300}
        />
      </div>

      {/* Description principale */}
      <div className={styles.description}>
        <h3>Caractéristiques principales</h3>
        <ul>
          <li>
            <strong>Bateau :</strong> Cap Camarat 12.5 Wa (2021)
          </li>
          <li>
            <strong>Taille :</strong> 12m x 3.60m
          </li>
          <li>
            <strong>Moteurs :</strong> 3 x 300 Ch V6 Yamaha
          </li>
          <li>
            <strong>Capacité :</strong> 11 personnes (capitaine inclus)
          </li>
        </ul>
      </div>

      {/* Équipements */}
      <div className={styles.equipements}>
        <h3>Équipements du bateau</h3>
        <div className={styles.grid}>
          <div className={styles.column}>
            <h4>Techniques</h4>
            <ul>
              <li>Stabilisateur Seakeeper</li>
              <li>Joystick de commande</li>
              <li>Propulseur d’étrave</li>
              <li>VHF/ASN Fixe et Portable</li>
              <li>Générateur 220V</li>
            </ul>
          </div>
          <div className={styles.column}>
            <h4>Sur le pont</h4>
            <ul>
              <li>Plate-forme latérale hydraulique</li>
              <li>Table pour 8 personnes</li>
              <li>Système audio premium</li>
              <li>Réfrigérateurs et machine à glaçons</li>
              <li>Plancha / Grill</li>
            </ul>
          </div>
          <div className={styles.column}>
            <h4>À l’intérieur</h4>
            <ul>
              <li>Climatisation cabines et cockpit</li>
              <li>Toilettes électriques & douche</li>
              <li>Cuisine équipée</li>
              <li>TV et espace détente</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Galerie d'images */}
      <div className={styles.gallery}>
        <h3>Galerie</h3>
        <div className={styles.images}>
          <Image
            src={image2}
            alt="Bateau vue latérale"
            className={styles.image}
            width={400}
            height={250}
          />
          <Image
            src={image3}
            alt="Intérieur du bateau"
            className={styles.image}
            width={400}
            height={250}
          />
        </div>
      </div>
    </div>
  );
};

export default Boat;
