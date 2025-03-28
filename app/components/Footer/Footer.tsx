"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Map from "../Map/Map";
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
// Styles
import styles from "./styles.module.scss";
import backgroundImg from "@/public/assets/table-avant.webp";

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
      <div className={styles.footer__header}>
        <div className={styles.link_infos}>
          <ul className={styles.link_list}>
            <li className={styles.link}>
              <div className={styles.link__txt}>
                <p>Envoyez-nous un email</p>
              </div>
              <span className={styles.link__img}>
                <a href="mailto:yachtingday@gmail.com">
                  <FaEnvelope size={30} />
                </a>
              </span>
            </li>
            <li className={styles.link}>
              <div className={styles.link__txt}>
                <p>Nous rendre visite</p>
              </div>
              <span className={styles.link__img}>
                <a href="#footer">
                  <FaMapMarkerAlt size={30} />
                </a>
              </span>
            </li>
            <li className={styles.link}>
              <div className={styles.link__txt}>
                <p>+33 (0)1 23 45 67 89</p>
              </div>
              <span className={styles.link__img}>
                <a href="tel:+33 7 67 21 00 17">
                  <FaPhone size={30} />
                </a>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.footer__container} id="footer">
        <div className={styles.footer__bloc}>
          <div className={styles.__bloc_container}>
            <div className={styles.__bloc_content}>
              <div className={styles.google}>
                <Map />
              </div>

              <div className={styles.footer_list__content}>
                <Image
                  src={backgroundImg}
                  alt="Vue de l'avant du bateau"
                  className={styles.footer_image}
                  priority={true}
                  fill={true}
                  placeholder="blur"
                />
                <div className={styles.bloc_text__content}>
                  <ul className={styles.bloc_text}>
                    <li>
                      <p>Retrouvez-nous à :</p>
                    </li>
                    <li>
                      <p>Port de Cavalaire, 83240 Cavalaire-sur-Mer</p>
                    </li>
                    <li>
                      <p>
                        <a href="tel:+33767210017">+33 (0) 7 67 21 00 17</a>
                      </p>
                    </li>
                    <li>
                      <p>
                        <a href="mailto:yachtingday@gmail.com">
                          yachtingday@gmail.com
                        </a>
                      </p>
                    </li>
                    <li>
                      <p>Venez découvrir le Golfe de Saint-Tropez</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.footer_infos}>
            <div className={styles.footer_infos__container}>
              <div className={styles.column}>
                <h3>RESTONS CONNECTÉS</h3>
                <ul>
                  <li>
                    <a href="mailto:yachtingday@gmail.com">
                      <FaEnvelope size={20} /> Mail
                    </a>
                  </li>
                </ul>
              </div>
              <div className={styles.column}>
                <h3>LIENS UTILES</h3>
                <ul>
                  <li>
                    <Link href="/">Accueil</Link>
                  </li>
                  <li>
                    <a href="tel:+33123456789">Nous contacter</a>
                  </li>
                  <li>
                    <Link href="/mentions">Mentions Légales</Link>
                  </li>
                  <li>
                    <Link href="/rgpd">
                      RGPD - Politique de confidentialité
                    </Link>
                  </li>
                </ul>
              </div>
              <div className={styles.column}>
                <h3>CONTACT</h3>
                <ul>
                  <li id={styles.__copyright}>
                    Port de Cavalaire, 83240 Cavalaire-sur-Mer
                  </li>
                  <li id={styles.number_phone}>
                    <a href="tel:+33767210017">+33 (0) 7 67 21 00 17</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className={styles.__copyright}>
              <div onClick={handleIconClick}>
                <span className={styles.__copyright__img}>LOGO</span>
              </div>
              &#169; {currentYear} | <a href="#">Tako Dev</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
