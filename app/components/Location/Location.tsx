"use client";

import React from "react";
// Styles
import styles from "./styles.module.scss";
import Image from "next/image";
import image1 from "@/public/assets/images/vue-exterieur.webp";
import logo from "@/public/assets/logo/hippo.png";
import placeholder from "@/public/assets/images/placeholder.svg";
import Link from "next/link";
import Wrapper from "../Wrapper/Wrapper";

const Location: React.FC = () => {
  return (
    <Wrapper>
      <section>
        <div className={styles.location} id="location">
          <div className={styles.logo_title_wrapper}>
            <div className={styles.logo_container}>
              <Image
                src={logo || placeholder}
                alt="Yachting Day location de bateau port de cavalaire-sur-mer et maintenance nautique"
                className={styles.logo}
                fill
                priority
              />
            </div>
            <h2 className={styles.title}>Location</h2>
          </div>
          {/* BOUTONS POUR DESKTOP */}
          <div className={styles.topButtonsDesktop}>
            <Link href="/boat" className={styles.button}>
              Le bateau
            </Link>
            <Link href="/environs" className={styles.button}>
              Les environs
            </Link>
            <Link href="/excursions" className={styles.button}>
              Nos Excursions
            </Link>
          </div>

          {/* <div className={styles.location_header_bloc__content}>
            <div className={styles.subtitle}>
              <p id={styles.sub_text}>
                Depuis le port de Cavalaire, embarquez pour une journée de rêve
                avec Yachting Day
              </p>
            </div>
          </div> */}

          <div className={styles.content_wrapper}>
            <div className={styles.content}>
              <div className={styles.text_container}>
                <span className={styles.top_text}>
                  <p id={styles.top_text__typo1}>
                    Offrez-vous le plaisir d&apos;une sortie en mer et venez
                    découvrir notre Cap Camarat 12.5 WA
                  </p>
                  {/* <p id={styles.top_text__typo2}>
                    et venez découvrir notre Cap Camarat 12.5 WA
                  </p> */}
                  {/* <p id={styles.top_text__typo2}>
                    et venez découvrir notre Cap Camarat 12.5 WA
                  </p> */}
                </span>

                <div className={styles.row}>
                  <strong>Basse Saison</strong>
                  <strong>1500 Euros</strong>
                </div>
                <p className={styles.dates}>(du 16 Octobre au 31 Mai)</p>
                <br />
                <div className={styles.row}>
                  <strong>Moyenne Saison</strong>
                  <strong>1700 Euros</strong>
                </div>
                <p className={styles.dates}>
                  (01er Juin - 07 Juillet et 01er Sept. - 15 Oct.)
                </p>
                <br />
                <div className={styles.row}>
                  <strong>Haute Saison</strong>
                  <strong>1900 Euros</strong>
                </div>
                <p className={styles.dates}>(du 08 Juillet au 31 Aout)</p>
                <br />

                <div className={styles.buttons}>
                  <a
                    href="mailto:yachtingday@gmail.com"
                    className={styles.button}
                    id={styles.buttons__reservation}
                  >
                    Réservez votre bateau
                  </a>
                </div>
              </div>

              <div className={styles.main_image}>
                <Image
                  src={image1}
                  alt="Cap Camarat 12.5 Wa"
                  className={styles.__image}
                  width={387}
                  height={300}
                  priority
                />
              </div>
            </div>
          </div>
          {/* BOUTONS POUR MOBILE */}
          <div className={styles.topButtonsMobile}>
            <Link href="/boat" className={styles.button}>
              Le bateau
            </Link>
            <Link href="/environs" className={styles.button}>
              Les environs
            </Link>
            <Link href="/excursions" className={styles.button}>
              Nos Excursions
            </Link>
          </div>
          <div className={styles.location_header_bloc__content}>
            <div className={styles.subtitle}>
              <p id={styles.sub_text}>
                Depuis le port de Cavalaire, embarquez pour une journée de rêve
                avec Yachting Day
              </p>
            </div>
          </div>
        </div>
      </section>
    </Wrapper>
  );
};

export default Location;
