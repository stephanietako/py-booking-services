"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Map from "../Map/Map";
import logo from "@/public/assets/logo/logo-new.png";

// Styles
import styles from "./styles.module.scss";
import { FaEnvelope, FaPhone } from "react-icons/fa";

export const dynamic = "force-dynamic";

const Footer: React.FC = () => {
  const date = new Date();
  const currentYear = date.getFullYear();

  return (
    <>
      <div className={styles.footer__container} id="footer">
        <div className={styles.footer__bloc}>
          <div className={styles.__bloc_container}>
            <div className={styles.__bloc_content}>
              <div className={styles.__bloc_content__inner}>
                <div className={styles.footer_list__content}>
                  <div className={styles.bloc_text__content}>
                    <ul className={styles.bloc_text}>
                      <li>
                        {/* Logo */}
                        <div className={styles.logo_image}>
                          <Image
                            src={logo}
                            alt="Yachting Day location de bateau Cap Camarat 12.5 WA – modèle 2021 port de cavalaire-sur-mer et maintenance nautique"
                            className={styles.logo}
                            width={200}
                            height={150}
                            priority
                            style={{
                              objectFit: "cover",
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        </div>
                        <p>
                          <strong>N’hésitez pas à nous contacter:</strong>
                        </p>
                      </li>
                      <li className={styles.mail}>
                        <a href="mailto:yachtingday@gmail.com">
                          <FaEnvelope size={20} className={styles.icon} />
                          yachtingday@gmail.com
                        </a>
                      </li>
                      <li>
                        <p>
                          <strong>Pierre-Yves Hemard</strong>
                        </p>
                        <p>
                          <a href="tel:+33767210017">
                            <FaPhone size={20} className={styles.icon} />
                            +33 (0) 7 67 21 00 17
                          </a>
                        </p>
                      </li>

                      <li>
                        <p>
                          <strong>Port de Cavalaire-sur-Mer</strong>
                        </p>
                      </li>
                    </ul>
                  </div>
                  <span className={styles.footer_baseline}>
                    <p> N&apos;attendez pas réservez votre journée !</p>
                  </span>
                </div>
                <div className={styles.google}>
                  <Map />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.footer_infos}>
            <div className={styles.footer_infos__container}>
              <div className={styles.column}>
                <ul>
                  <li>
                    <Link href="/">Accueil</Link>
                  </li>
                  <li>
                    <a href="tel:+33767210017">Nous contacter</a>
                  </li>
                  <li>
                    <Link href="/mention">Mentions Légales</Link>
                  </li>
                  <li>
                    <Link href="/cgu">CGU</Link>
                  </li>
                  <li>
                    <Link href="/terms">Politique de confidentialité</Link>
                  </li>
                  <li>
                    <Link href="/cookies">Politique de cookies</Link>
                  </li>
                </ul>
              </div>

              <div className={styles.__copyright}>
                <div>
                  <span className={styles.__copyright__img}>
                    <Link href="/">
                      <Image
                        src="/assets/logo/logo-new.png"
                        alt="Yachting Day location de bateau Cap Camarat 12.5 WA – modèle 2021 port de cavalaire-sur-mer et maintenance nautique"
                        width={100}
                        height={100}
                        className={styles.logo}
                        priority
                      />
                    </Link>
                  </span>
                </div>
                &#169; {currentYear} | Tako Dev
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
