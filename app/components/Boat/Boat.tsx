import React from "react";
import Image from "next/image";
import image1 from "@/public/assets/images/boat-cote1.jpg";
import image2 from "@/public/assets/images/Cap-Camarat3-Plan-de-Pont.jpg";
import image3 from "@/public/assets/images/Cap-Camarat1-Plan-de-Cabine.jpg";
import styles from "./styles.module.scss";
import Galery from "../Galery/Galery";

export const dynamic = "force-dynamic";

const Boat = () => {
  return (
    <div className={styles.boat} id="boat">
      <div className={styles.header}>
        <h2 className={styles.title}>Le Bateau</h2>
        <div className={styles.main_image}>
          <Image
            src={image1}
            alt="Cap Camarat 12.5 Wa"
            className={styles.__image}
            width={400}
            height={300}
            priority
          />
        </div>
      </div>

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
              <li>3x300Ch. V6 Yamaha</li>
              <li>2 écrans Garmin 16&quot;</li>
              <li>Joystick de commande moteurs</li>
              <li>Propulseur d’étrave</li>
              <li>Stabilisateur « seakeeper »</li>
              <li>Transpondeur AIS</li>
              <li>VHF/ASN Fixe et Portable</li>
              <li>Sondeur</li>
              <li>Guindeau électrique</li>
              <li>Compteur de chaînes</li>
              <li>Générateur 220V</li>
              <li>
                14 gilets de sauvetages automatiques avec lumières (adultes et
                enfants)
              </li>
              <li>Pack de sécurité côtier complet</li>
            </ul>
          </div>
          <div className={styles.column}>
            <h4>Sur le pont</h4>
            <ul>
              <li>Plate-forme latérale hydraulique</li>
              <li>2 échelles de bain</li>
              <li>Douchette de pont</li>
              <li>Taux de soleil avant et arrière</li>
              <li>Bâche de fermeture du cockpit (utilisable en navigation)</li>
              <li>Table pour 8 personnes</li>
              <li>Table de pont avant</li>
              <li>Bain de soleil avant et arrière</li>
              <li>Système de musique haut de gamme, intérieur et extérieurs</li>
              <li>TV</li>
              <li>Climatisation de cockpit</li>
              <li>Lumière de pont</li>
              <li>2 réfrigérateurs</li>
              <li>1 machine à glaçons</li>
              <li>1 plaques de cuissons</li>
              <li>1 plancha/gril</li>
              <li>1 évier</li>
            </ul>
          </div>
          <div className={styles.column}>
            <h4>À l’intérieur</h4>
            <ul>
              <li>1 réfrigérateur</li>
              <li>1 four à micro-ondes</li>
              <li>1 évier</li>
              <li>Toilettes électriques</li>
              <li>Cabine de douche</li>
              <li>Lavabo</li>
              <li>
                Carré avec table transformable en lit double (180/150x200)
              </li>
              <li>1 Cabine de 3 couchages (1 lit 140x195 / 1 lit 60x180)</li>
              <li>Climatisation cabine et carré</li>
              <li>Chauffe-eau</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Galerie d'images */}
      <div className={styles.gallery}>
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
            priority
          />
        </div>
      </div>
      <div className={styles.gallery__content}>
        <Galery />
      </div>
    </div>
  );
};

export default Boat;
