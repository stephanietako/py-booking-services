"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Map from "../Map/Map";
//import { FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
// Styles
import styles from "./styles.module.scss";
//import backgroundImg from "@/public/assets/images/ramatuelle-cap-taillat.webp";

export const dynamic = "force-dynamic";

const Footer: React.FC = () => {
  const date = new Date();
  const currentYear = date.getFullYear();
  const router = useRouter();

  const handleIconClick = () => {
    router.push("sectionHome");
  };

  return (
    <>
      <div className={styles.footer__container} id="footer">
        <div className={styles.footer__bloc}>
          <div className={styles.__bloc_container}>
            <div className={styles.__bloc_content}>
              <div className={styles.__bloc_content__inner}>
                <div className={styles.google}>
                  <Map />
                </div>

                <div className={styles.footer_list__content}>
                  <div className={styles.bloc_text__content}>
                    <ul className={styles.bloc_text}>
                      <li>
                        <p id={styles.bloc_text__contact}>CONTACT</p>
                      </li>
                      <li>
                        <p>Yachting Day</p>
                        <p>Port de Cavalaire</p>
                      </li>

                      <li>
                        <p>
                          <a href="mailto:yachtingday@gmail.com">
                            yachtingday@gmail.com
                          </a>
                        </p>
                        <p>Pierre-Yves Hemard</p>
                      </li>
                      <li>
                        <p>
                          <a href="tel:+33767210017">+33 (0) 7 67 21 00 17</a>
                        </p>
                      </li>
                      <li id={styles.bloc_text__subtext}>
                        Embarquez pour une journée de rêve avec Yatching Day
                      </li>
                    </ul>
                  </div>
                  <span className={styles.footer_baseline}>
                    <p>N&apos;attendez pas réservez votre journée !</p>
                  </span>
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
                    <a href="tel:+33123456789">Nous contacter</a>
                  </li>
                  <li>
                    <Link href="/">Mentions Légales</Link>
                  </li>
                  <li>
                    <Link href="/">CGU</Link>
                  </li>
                  <li>
                    <Link href="/">Politique de confidentialité</Link>
                  </li>
                  <li>
                    <Link href="/">Politique de cookies</Link>
                  </li>
                </ul>
              </div>

              <div className={styles.__copyright}>
                <div onClick={handleIconClick}>
                  <span className={styles.__copyright__img}>
                    <Link href="/">
                      <Image
                        src="/assets/logo/logo-new.png"
                        alt="Logo"
                        width={100}
                        height={100}
                        className={styles.logo}
                        priority
                      />
                    </Link>
                  </span>
                </div>
                &#169; {currentYear} | <a href="#">Tako Dev</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
