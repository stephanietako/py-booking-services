import React from "react";
import Image from "next/image";
import image1 from "@/public/assets/images/vue-boat.webp";
//import image2 from "@/public/assets/images/Cap-Camarat3-Plan-de-Pont.jpg";
//import image3 from "@/public/assets/images/Cap-Camarat1-Plan-de-Cabine.jpg";
import styles from "./styles.module.scss";
import Galery from "../Galery/Galery";
import Link from "next/link";

export const dynamic = "force-dynamic";

const Boat = () => {
  return (
    <div className={styles.boat} id="boat">
      <div className={styles.header}>
        <div className={styles.header__bloc1}>
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
        <div className={styles.header__bloc2}>
          <span className={styles.header__bloc2__text}>
            <p>
              La réputation des Cap Camarat n’est plus à la discussion, la
              carène de ce bateau est faite pour affronter la mer ! Fort de ces
              12 mètres, faisant de lui le bateau dominant de la gamme et de sa
              puissance motrice de 900 chevaux, il atteindra des vitesses
              maximales de 41 Nœuds pour une vitesse de croisière confortable de
              30 Nœuds.
            </p>
            <p>
              Le bateau est équipé de toutes les dernières technologies de
              navigation dont le fameux stabilisateur « seakeeper » pour une
              journée sans tanguage, ainsi que de tous les équipements de
              sécurité en vigueur et nécessaires à une navigation sereine.
            </p>
          </span>
        </div>
      </div>

      <div className={styles.description}>
        <div className={styles.description__left}>
          <div className={styles.description__subtitle}>
            {" "}
            <h3>Caractéristiques principales</h3>
          </div>

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
        <div className={styles.description__right}>
          <div className={styles.description__subtitle}>
            <h3>Equipements principaux du bateau</h3>
          </div>

          <ul>
            <li>Seakeeper (stabilisateur anti-tanguage)</li>
            <li>Climatisation</li>
            <li>Frigos extérieurs et intérieur</li>
            <li>Machines à glaçons</li>
            <li>Groupe électrogène</li>
          </ul>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.text_container}>
          <h3>A l’intérieur :</h3>
          <p>
            L’intérieur du bateau se compose d’une cabine arrière avec un lit
            double (140x195) et un lit simple (60x180). Une salle de bain avec
            cabine de douche et WC électriques et un carré avec table
            transformable en lit double (180x200). La partie cuisine se compose
            d’un réfrigérateur, d’un four à micro-ondes, d’un évier, d’une
            plaque de cuisson, d’une bouilloire, d’une machine à café et de tous
            les ustensiles de cuisines nécessaires.
          </p>
          <br />
          <h3>Divertissements et confort :</h3>
          <p>
            Le bateau est équipé d’un système de musique Bluetooth haut de gamme
            avec dix haut-parleurs répartis sur le bateau, amplis et caisson de
            basse. Largement de quoi satisfaire vos envies musicales !
          </p>
          <p>
            Une cuisine extérieure, une télévision et une belle table à manger
            qui accueillera confortablement 6 à 8 personnes.
          </p>
          <p>
            Une grande plate-forme latérale agrandira votre espace de vie au
            mouillage et animera vos baignades.
          </p>
          <p>
            Le pont avant et le pont arrière peuvent être entièrement abrités
            par des taux de soleil et sont également modulables à la demande,
            espace apéritif, déjeuner, ou bain de soleil, choisissez la
            disposition qui vous conviendra !
          </p>
        </div>
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
              <li>1 plancha/grill</li>
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

      <div className={styles.gallery__content}>
        <Galery />
      </div>

      <div className={styles.buttons}>
        <Link
          href="/location
        "
          className={styles.button}
        >
          Réservez Votre Journée
        </Link>
      </div>
    </div>
  );
};

export default Boat;
