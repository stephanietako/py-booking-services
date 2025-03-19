// "use client";

// import { useState } from "react";
// import logo from "@/public/assets/logo/hippo.png";
// import placeholder from "@/public/assets/placeholder.svg";
// import Image from "next/image";
// // Styles
// import styles from "./styles.module.scss";

// export const dynamic = "force-dynamic";

// const pricing = [
//   { period: "16 octobre - 31 mai", price: 1500 },
//   { period: "1er juin - 07 juillet & 1er septembre - 15 octobre", price: 1700 },
//   { period: "08 juillet - 31 août", price: 1900 },
// ];

// const options = [
//   "6 Paires de masques et tubas adultes & 2 enfants",
//   "1 paddle board",
//   "1 Serviette de bain/pers.",
//   "Literie et serviettes de douche",
//   "Eau en bouteille",
// ];

// const extras = [
//   "Vins, champagnes et boissons spéciales (contactez-nous)",
//   "Hôtesse : 200€/jour (sous réserve de disponibilité)",
//   "Location Paddle board supplémentaires : 50€/jour",
// ];

// const TarifsDisponibilites = () => {
//   const [selectedPlan, setSelectedPlan] = useState("simplicite");

//   return (
//     <>
//       <div className={styles.logo_title_wrapper}>
//         {/* Logo */}
//         <div className={styles.logo_container}>
//           <Image
//             src={logo || placeholder}
//             alt="Yachting Day Logo"
//             className={styles.logo}
//           />
//         </div>
//         <h1 className={styles.title}>Découvrez nos offres de location</h1>
//       </div>
//       <div className={styles.card_tarifs_container}>
//         <div className={styles.card}>
//           <h2>Tarifs et Disponibilités</h2>
//           <div className={styles.pricingList}>
//             {pricing.map((item, index) => (
//               <div key={index} className={styles.pricingItem}>
//                 <span>{item.period}</span>
//                 <span className={styles.bold}>{item.price}€/jour</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className={styles.card}>
//           <h2>Formules de Location</h2>
//           <div className={styles.buttonGroup}>
//             <button
//               className={
//                 selectedPlan === "simplicite"
//                   ? styles.activeButton
//                   : styles.button
//               }
//               onClick={() => setSelectedPlan("simplicite")}
//             >
//               Simplicité
//             </button>
//             <button
//               className={
//                 selectedPlan === "premium" ? styles.activeButton : styles.button
//               }
//               onClick={() => setSelectedPlan("premium")}
//             >
//               Premium
//             </button>
//           </div>
//           <p>
//             {selectedPlan === "simplicite"
//               ? "Eau inclus. Profitez du bateau avec un capitaine, possibilité de manger à bord ou dans un restaurant de votre choix."
//               : "Apéritif et repas à bord, 1 bouteille de Rosé, Eau et Soda à volonté. Contactez-nous pour plus de renseignements."}
//           </p>
//         </div>

//         <div className={styles.card}>
//           <h2>Inclus dans votre location</h2>
//           <ul className={styles.list}>
//             {options.map((item, index) => (
//               <li key={index}>{item}</li>
//             ))}
//           </ul>
//         </div>

//         <div className={styles.card}>
//           <h2>En Options</h2>
//           <ul className={styles.list}>
//             {extras.map((item, index) => (
//               <li key={index}>{item}</li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </>
//   );
// };

// export default TarifsDisponibilites;

"use client";

import React, { useState } from "react";
import Calendar from "../Calendar/Calendar";
import { Day } from "@prisma/client";
import Modal from "../Modal/Modal";
import Image from "next/image";
import logo from "@/public/assets/logo/hippo.png";
import placeholder from "@/public/assets/placeholder.svg";
import styles from "./styles.module.scss";

interface TarifsDisponibilitesProps {
  days: Day[];
  closedDays: string[];
}

const pricing = [
  { period: "16 octobre - 31 mai", price: 1500 },
  { period: "1er juin - 07 juillet & 1er septembre - 15 octobre", price: 1700 },
  { period: "08 juillet - 31 août", price: 1900 },
];

const options = [
  "6 Paires de masques et tubas adultes & 2 enfants",
  "1 paddle board",
  "1 Serviette de bain/pers.",
  "Literie et serviettes de douche",
  "Eau en bouteille",
];

const extras = [
  "Vins, champagnes et boissons spéciales (contactez-nous)",
  "Hôtesse : 200€/jour (sous réserve de disponibilité)",
  "Location Paddle board supplémentaires : 50€/jour",
];

const TarifsDisponibilites: React.FC<TarifsDisponibilitesProps> = ({
  days,
  closedDays,
}) => {
  const [selectedPlan, setSelectedPlan] = useState("simplicite");
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const toggleCalendarVisibility = () => {
    setIsCalendarVisible(!isCalendarVisible); // Cette logique est identique à Hero
  };

  return (
    <>
      <div className={styles.logo_title_wrapper}>
        <div className={styles.logo_container}>
          <Image
            src={logo || placeholder}
            alt="Yachting Day Logo"
            className={styles.logo}
          />
        </div>
        <h1 className={styles.title}>Découvrez nos offres de location</h1>
      </div>

      <div className={styles.card_tarifs_container}>
        <div className={styles.card}>
          <h2>Tarifs & Disponibilités</h2>
          <div className={styles.pricingList}>
            {pricing.map((item, index) => (
              <div key={index} className={styles.pricingItem}>
                <span>{item.period}</span>
                <span className={styles.bold}>{item.price}€/jour</span>
              </div>
            ))}
          </div>

          {/* Le bouton pour afficher ou cacher le calendrier */}
          <button
            className={styles.calendarBtn}
            onClick={toggleCalendarVisibility}
            aria-label={
              isCalendarVisible ? "Cacher le calendrier" : "Voir le calendrier"
            }
          >
            {isCalendarVisible ? "Cacher le calendrier" : "Voir le calendrier"}
          </button>
        </div>

        <div className={styles.card}>
          <h2>Formules de Location</h2>
          <div className={styles.buttonGroup}>
            <button
              className={
                selectedPlan === "simplicite"
                  ? styles.activeButton
                  : styles.button
              }
              onClick={() => setSelectedPlan("simplicite")}
            >
              Simplicité
            </button>
            <button
              className={
                selectedPlan === "premium" ? styles.activeButton : styles.button
              }
              onClick={() => setSelectedPlan("premium")}
            >
              Premium
            </button>
          </div>
          <p>
            {selectedPlan === "simplicite"
              ? "Eau inclus. Profitez du bateau avec un capitaine, possibilité de manger à bord ou dans un restaurant de votre choix."
              : "Apéritif et repas à bord, 1 bouteille de Rosé, Eau et Soda à volonté. Contactez-nous pour plus de renseignements."}
          </p>
        </div>

        <div className={styles.card}>
          <h2>Inclus dans votre location</h2>
          <ul className={styles.list}>
            {options.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className={styles.card}>
          <h2>En Options</h2>
          <ul className={styles.list}>
            {extras.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal pour afficher le calendrier */}
      <Modal
        isOpen={isCalendarVisible} // Affiche ou cache le modal basé sur l'état
        onClose={toggleCalendarVisibility} // Ferme le modal en basculant l'état
        title="Choisissez une date"
      >
        <p>Réservez votre bateau dès maintenant !</p>
        <Calendar
          days={days}
          closedDays={Array.isArray(closedDays) ? closedDays : []}
        />
      </Modal>
    </>
  );
};

export default TarifsDisponibilites;
