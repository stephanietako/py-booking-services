import React from "react";
import Image from "next/image";
import logo from "@/public/assets/logo/hippo.png";
import boat from "@/public/assets/images/boat-cote1.jpg";
// Styles
import styles from "./styles.module.scss";
import { FaDownload } from "react-icons/fa";
import Link from "next/link";

const Maintenance = () => {
  return (
    <section className={styles.maintenanceContainer}>
      <div className={styles.boatContainer}>
        <Image
          src={boat}
          alt="Logo de l'entreprise"
          width={450}
          height={250}
          className={styles.boat}
          priority
        />
      </div>
      {/* Logo avec Next.js Image */}
      <div className={styles.logo_title_wrapper}>
        <div className={styles.logo_container}>
          <Image
            src={logo}
            alt="Yachting Day Logo"
            className={styles.logo}
            fill
            priority
          />
        </div>
        <h2 className={styles.title}>Maintenance navale</h2>
      </div>

      {/* Contenu */}
      <p className={styles.subtitle}>
        <strong>Qu’en est-il ?</strong>
      </p>
      <p className={styles.text}>
        Offrez à votre bateau le bénéfice d’un capitaine et d’un entretien
        annuelle sans avoir à se soucier de la charge administrative d’un
        employé tout en économisant les frais que cela génère, voilà ce que je
        peux vous offrir !
      </p>

      <p className={styles.text}>
        Lavage de teck, restauration des inox, polish de gelcoat, nettoyage
        générale intérieur et extérieur, organisation des intervenants extérieur
        pour les travaux plus conséquents (mécanique, électrique/électronique,
        menuiserie, etc…), offrez à votre bateau la perfection.
      </p>
      <p className={styles.subtitle}>
        <strong>Où ?</strong>
      </p>
      <p className={styles.text}>
        Je me déplace sans frais additionnel dans les ports de St-Tropez,
        Port-Grimaud, Marine de Cogolin et Cavalaire ainsi que dans les
        chantiers navals des 4 mêmes communes ou à domicile pour les plus
        modestes embarcations.
      </p>
      <p className={styles.subtitle}>
        <strong>Comment ?</strong>
      </p>
      <p className={styles.text}>
        A votre préférence, joignez-moi par téléphone ou remplissez simplement
        le formulaire ci-dessous et je prendrais contact avec vous pour
        organiser un rendez-vous au plus vite.
      </p>

      {/* Bouton d'Action */}
      <div className={styles.ctaButtonContainer}>
        <a
          href="/assets/pdf/formulaire-maintenance.pdf"
          className={styles.ctaButton}
          target="_blank"
          rel="noopener noreferrer"
        >
          Faire une demande d’entretien <FaDownload />
        </a>
      </div>
      <div className={styles.heroButtons}>
        <p>Cliquez ci-dessous pour plus d&apos;information.</p>
        <div className={styles.heroButtons__container}>
          {/* <Link href="/about" className={styles.buttonHero}>
            Qui sommes-nous
          </Link> */}
          <Link href="/tarifs" className={styles.buttonHero}>
            Location
          </Link>
          {/* <Link href="#footer" className={styles.buttonHero}>
            Contact
          </Link> */}
        </div>
      </div>
    </section>
  );
};

export default Maintenance;
