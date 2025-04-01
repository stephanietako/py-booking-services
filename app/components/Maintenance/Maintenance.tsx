import React from "react";
import Image from "next/image";
import logo from "@/public/assets/logo/hippo.png";
// Styles
import styles from "./styles.module.scss";
import { FaDownload } from "react-icons/fa";

const Maintenance = () => {
  return (
    <section className={styles.maintenanceContainer}>
      {/* Logo avec Next.js Image */}
      <div className={styles.logoContainer}>
        <Image
          src={logo}
          alt="Logo de l'entreprise"
          width={120}
          height={120}
          className={styles.logo}
          priority
        />
      </div>

      {/* Titre */}
      <h1 className={styles.title}>Maintenance navale</h1>

      {/* Contenu */}
      <p className={styles.subtitle}>Qu’en est-il ?</p>
      <p className={styles.text}>
        Un capitaine à moindre coût ! Offrez à votre bateau le bénéfice d’un
        capitaine et d’un entretien annuel sans avoir à vous soucier de la
        charge administrative d’un employé, tout en économisant les frais que
        cela génère.
      </p>

      <p className={styles.text}>
        <strong>Services proposés :</strong> Lavage de teck, restauration des
        inox, polish de gelcoat, nettoyage général intérieur et extérieur,
        organisation des intervenants extérieurs pour les travaux plus
        conséquents (mécanique, électricité/électronique, menuiserie, etc.).
      </p>

      <p className={styles.text}>
        <strong>Où ?</strong> Je me déplace sans frais additionnels dans les
        ports de St-Tropez, Port-Grimaud, Marine de Cogolin et Cavalaire, ainsi
        que dans les chantiers navals de ces mêmes communes. J&apos;interviens
        également à domicile pour les plus modestes embarcations.
      </p>

      <p className={styles.text}>
        <strong>Comment ?</strong> À votre convenance, contactez-moi par
        téléphone ou remplissez simplement le formulaire ci-dessous. Je prendrai
        contact avec vous afin d’organiser un rendez-vous dans les plus brefs
        délais.
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
    </section>
  );
};

export default Maintenance;
