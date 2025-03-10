// import Image from "next/image";
// import styles from "./styles.module.scss";

// const Cruise = () => {
//   const excursions = [
//     {
//       title: "Les calanques de Cavalaire",
//       time: "5-10 min",
//       description:
//         "Nul besoin d’aller loin pour être bien : en sortant du port de Cavalaire vous pourrez jeter l’ancre au pied du massif des maures, dans des eaux translucides...",
//       photo: "/assets/Calanques-de-Cavalaire.jpg", // Exemple d'image à ajouter
//       width: 800,
//       height: 600,
//     },
//     {
//       title: "L’île de Port-Cros",
//       time: "20-25 min",
//       description:
//         "Fleurons du Parc national de Port-Cros, cette île est la plus sauvage de toutes, la faune et la flore y sont omniprésentes...",
//       photo: "/assets/Port-Cros1.webp", // Exemple d'image à ajouter
//       width: 800,
//       height: 600,
//     },
//     {
//       title: "L’île de Porquerolles",
//       time: "40-45 min",
//       description:
//         "Porquerolles est la plus grande des îles d’or. Classée parc national depuis 1971, cette île vous émerveillera par la splendeur de ses plages...",
//       photo: "/assets/Beach-Notre-Dame-Porquerolles.jpg",
//       width: 800,
//       height: 600,
//     },
//     {
//       title: "La baie de Gigaro et le Cap Lardier",
//       time: "10-15 min",
//       description:
//         "Naviguer 10 min pour rejoindre les merveilles du Cap Lardier, faisant partie du Parc National de Port-Cros...",
//       photo: "/assets/Port-Cros-Baie-de-Port-Man.jpg",
//       width: 800,
//       height: 600,
//     },
//     {
//       title: "L’Escalet",
//       time: "15-20 min",
//       description:
//         "Entre le Cap Taillat et le Cap Camarat, la baie de l’Escalet est sans doute un des plus beaux sites des environs...",
//       photo: "/assets/Plage-de-escalet-2.jpg",
//       width: 800,
//       height: 600,
//     },
//     {
//       title: "La Baie de Pampelonne",
//       time: "25-30 min",
//       description:
//         "5 km de plage de sable fin et ses eaux turquoise font de Pampelonne une plage d’exception sur le littoral du Var...",
//       photo: "/assets/Baie-de-Pampelonne.jpg", // Exemple d'image à ajouter
//       width: 800,
//       height: 600,
//     },
//     {
//       title: "St-Tropez",
//       time: "40-45 min",
//       description:
//         "En arrivant par la mer, Saint-Tropez se dévoile dans toute son élégance, entre son port mythique bordé de yachts...",
//       photo: "/assets/St-Tropez-2.jpg",
//       width: 800,
//       height: 600,
//     },
//     {
//       title: "La cité lacustre de Port-Grimaud",
//       time: "45-50 min",
//       description:
//         "Profitez de la manœuvrabilité exceptionnelle du bateau pour explorer les canaux de Port Grimaud, véritable perle de la Côte d'Azur...",
//       photo: "/assets/Port-Grimaud-2.jpg", // Exemple d'image à ajouter
//       width: 800,
//       height: 600,
//     },
//     {
//       title: "Le Massif et les Calanques de l’Esterel",
//       time: "40-45 min",
//       description:
//         "Les roches rouges de l’Estérel plongent dans une mer cristalline, créant un contraste saisissant. En bateau, on explore des criques sauvages...",
//       photo: "/assets/Baie-de-Pampelonne.jpg", // Exemple d'image à ajouter
//       width: 800,
//       height: 600,
//     },
//   ];

//   return (
//     <section className={styles.cruise}>
//       <h1>Nos Excursions</h1>
//       <div className={styles.excursions}>
//         {excursions.map((excursion, index) => (
//           <div key={index} className={styles.excursionCard}>
//             <div className={styles.excursionImage}>
//               <Image
//                 src={excursion.photo}
//                 alt={excursion.title}
//                 width={excursion.width}
//                 height={excursion.height}
//                 priority
//               />
//             </div>
//             <div className={styles.excursionContent}>
//               <h2 className={styles.excursionTitle}>{excursion.title}</h2>
//               <p className={styles.excursionTime}>{excursion.time}</p>
//               <p className={styles.excursionDescription}>
//                 {excursion.description}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default Cruise;
// "use client";
// import { useState } from "react";
// import Image from "next/image";
// import styles from "./styles.module.scss";

// // Définir le type pour une excursion
// interface Excursion {
//   title: string;
//   time: string;
//   description: string;
//   photo: string;
//   width: number;
//   height: number;
// }

// const Cruise = () => {
//   // Déclare l'état selectedExcursion avec le type `Excursion | null`
//   const [selectedExcursion, setSelectedExcursion] = useState<Excursion | null>(
//     null
//   );

//   // Déclarer le tableau d'excursions avec le type Excursion[]
//   const excursions: Excursion[] = [
//     {
//       title: "Les calanques de Cavalaire",
//       time: "5-10 min",
//       description:
//         "Nul besoin d’aller loin pour être bien : en sortant du port de Cavalaire vous pourrez jeter l’ancre au pied du massif des maures, dans des eaux translucides...",
//       photo: "/assets/Calanques-de-Cavalaire.jpg",
//       width: 800,
//       height: 600,
//     },
//     {
//       title: "L’île de Port-Cros",
//       time: "20-25 min",
//       description:
//         "Fleurons du Parc national de Port-Cros, cette île est la plus sauvage de toutes, la faune et la flore y sont omniprésentes...",
//       photo: "/assets/Port-Cros1.webp",
//       width: 800,
//       height: 600,
//     },
//     {
//       title: "L’île de Porquerolles",
//       time: "40-45 min",
//       description:
//         "Porquerolles est la plus grande des îles d’or. Classée parc national depuis 1971, cette île vous émerveillera par la splendeur de ses plages...",
//       photo: "/assets/Beach-Notre-Dame-Porquerolles.jpg",
//       width: 800,
//       height: 600,
//     },
//     {
//       title: "La baie de Gigaro et le Cap Lardier",
//       time: "10-15 min",
//       description:
//         "Naviguer 10 min pour rejoindre les merveilles du Cap Lardier, faisant partie du Parc National de Port-Cros...",
//       photo: "/assets/Port-Cros-Baie-de-Port-Man.jpg",
//       width: 800,
//       height: 600,
//     },
//     {
//       title: "L’Escalet",
//       time: "15-20 min",
//       description:
//         "Entre le Cap Taillat et le Cap Camarat, la baie de l’Escalet est sans doute un des plus beaux sites des environs...",
//       photo: "/assets/Plage-de-escalet-2.jpg",
//       width: 800,
//       height: 600,
//     },
//     {
//       title: "La Baie de Pampelonne",
//       time: "25-30 min",
//       description:
//         "5 km de plage de sable fin et ses eaux turquoise font de Pampelonne une plage d’exception sur le littoral du Var...",
//       photo: "/assets/Baie-de-Pampelonne.jpg",
//       width: 800,
//       height: 600,
//     },
//     {
//       title: "St-Tropez",
//       time: "40-45 min",
//       description:
//         "En arrivant par la mer, Saint-Tropez se dévoile dans toute son élégance, entre son port mythique bordé de yachts...",
//       photo: "/assets/St-Tropez-2.jpg",
//       width: 800,
//       height: 600,
//     },
//     {
//       title: "La cité lacustre de Port-Grimaud",
//       time: "45-50 min",
//       description:
//         "Profitez de la manœuvrabilité exceptionnelle du bateau pour explorer les canaux de Port Grimaud, véritable perle de la Côte d'Azur...",
//       photo: "/assets/Port-Grimaud-2.jpg",
//       width: 800,
//       height: 600,
//     },
//     {
//       title: "Le Massif et les Calanques de l’Esterel",
//       time: "40-45 min",
//       description:
//         "Les roches rouges de l’Estérel plongent dans une mer cristalline, créant un contraste saisissant. En bateau, on explore des criques sauvages...",
//       photo: "/assets/Baie-de-Pampelonne.jpg",
//       width: 800,
//       height: 600,
//     },
//   ];

//   // Fonction pour gérer le clic sur une carte
//   const handleCardClick = (excursion: Excursion) => {
//     setSelectedExcursion(excursion);
//   };

//   return (
//     <section className={styles.cruise}>
//       <h1 className={styles.title}>Nos Excursions</h1>

//       <div className={styles.excursions}>
//         {excursions.map((excursion, index) => (
//           <div
//             key={index}
//             className={styles.excursionCard}
//             onClick={() => handleCardClick(excursion)}
//           >
//             <div className={styles.excursionImage}>
//               <Image
//                 src={excursion.photo}
//                 alt={excursion.title}
//                 width={excursion.width}
//                 height={excursion.height}
//                 priority
//               />
//             </div>
//             <div className={styles.excursionContent}>
//               <h2 className={styles.excursionTitle}>{excursion.title}</h2>
//               <p className={styles.excursionTime}>{excursion.time}</p>
//               <p className={styles.excursionDescription}>
//                 {excursion.description.slice(0, 100)}...
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {selectedExcursion && (
//         <div className={styles.modal}>
//           <div className={styles.modalContent}>
//             <h2>{selectedExcursion.title}</h2>
//             <Image
//               src={selectedExcursion.photo}
//               alt={selectedExcursion.title}
//               width={selectedExcursion.width}
//               height={selectedExcursion.height}
//               priority
//             />
//             <p>
//               <strong>Durée :</strong> {selectedExcursion.time}
//             </p>
//             <p>
//               <strong>Description :</strong> {selectedExcursion.description}
//             </p>
//             <button onClick={() => setSelectedExcursion(null)}>Fermer</button>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// };

// export default Cruise;
"use client";
import { useState } from "react";
import Image from "next/image";
import styles from "./styles.module.scss";
import Modal from "../Modal/Modal";

export const dynamic = "force-dynamic";

interface Excursion {
  title: string;
  time: string;
  description: string;
  photo: string;
  width: number;
  height: number;
}

const Cruise = () => {
  const [selectedExcursion, setSelectedExcursion] = useState<Excursion | null>(
    null
  );

  const excursions: Excursion[] = [
    {
      title: "Les calanques de Cavalaire",
      time: "5-10 min",
      description:
        "Nul besoin d’aller loin pour être bien : en sortant du port de Cavalaire vous pourrez jeter l’ancre au pied du massif des maures, dans des eaux translucides ou seul les quelques privilégié en bateau peuvent accéder. Les calanques de Cavalaire dévoilent un littoral préservé, où falaises dorées et pins maritimes bordent des eaux turquoise. Un véritable havre de paix idéale pour les amoureux de la Méditerranée.",
      photo: "/assets/Calanques-de-Cavalaire.jpg",
      width: 800,
      height: 600,
    },
    {
      title: "L’île de Port-Cros",
      time: "20-25 min",
      description:
        "Fleurons du Parc national de Port-Cros, cette île est la plus sauvage de toutes, la faune et la flore y sont omniprésentes. Débarquez dans son petit village aux airs exotiques et laissez-vous séduire avec les quelques délicieux restaurant de fruits de mer du port. Visitez le fort construit sous Richelieu en 1635 ou aventurez-vous sur les différents sentiers de l’île pour une randonnée d’exception et profitez du bateau pour admirer cette fabuleuse île sous tous ces angles.",
      photo: "/assets/Port-Cros1.webp",
      width: 800,
      height: 600,
    },
    {
      title: "L’île de Porquerolles",
      time: "40-45 min",
      description:
        "Porquerolles est la plus grande des îles d’or. Classée parc national depuis 1971, cette île vous émerveillera par la splendeur de ses plages et de la nature environnante. Découvrez le village, profitez d’un déjeuner dans le calme d’une baie à bord du bateau, faites des excursions à pied ou à vélo ou partez visiter la fondation Carmignac dédiée à l’art contemporain, chacun y trouvera son compte pour une journée idyllique.",
      photo: "/assets/Beach-Notre-Dame-Porquerolles.jpg",
      width: 800,
      height: 600,
    },
    {
      title: "L’île de Port-Cros",
      time: "20-25 min",
      description:
        "Fleurons du Parc national de Port-Cros, cette île est la plus sauvage de toutes, la faune et la flore y sont omniprésentes...",
      photo: "/assets/Port-Cros1.webp",
      width: 800,
      height: 600,
    },
    {
      title: "L’île de Porquerolles",
      time: "40-45 min",
      description:
        "Porquerolles est la plus grande des îles d’or. Classée parc national depuis 1971, cette île vous émerveillera par la splendeur de ses plages...",
      photo: "/assets/Beach-Notre-Dame-Porquerolles.jpg",
      width: 800,
      height: 600,
    },
    {
      title: "La baie de Gigaro et le Cap Lardier",
      time: "10-15 min",
      description:
        "Naviguer 10 min pour rejoindre les merveilles du Cap Lardier, faisant partie du Parc National de Port-Cros...",
      photo: "/assets/Port-Cros-Baie-de-Port-Man.jpg",
      width: 800,
      height: 600,
    },
    {
      title: "L’Escalet",
      time: "15-20 min",
      description:
        "Entre le Cap Taillat et le Cap Camarat, la baie de l’Escalet est sans doute un des plus beaux sites des environs...",
      photo: "/assets/Plage-de-escalet-2.jpg",
      width: 800,
      height: 600,
    },
    {
      title: "La Baie de Pampelonne",
      time: "25-30 min",
      description:
        "5 km de plage de sable fin et ses eaux turquoise font de Pampelonne une plage d’exception sur le littoral du Var...",
      photo: "/assets/Baie-de-Pampelonne.jpg",
      width: 800,
      height: 600,
    },
    {
      title: "St-Tropez",
      time: "40-45 min",
      description:
        "En arrivant par la mer, Saint-Tropez se dévoile dans toute son élégance, entre son port mythique bordé de yachts...",
      photo: "/assets/St-Tropez-2.jpg",
      width: 800,
      height: 600,
    },
    {
      title: "La cité lacustre de Port-Grimaud",
      time: "45-50 min",
      description:
        "Profitez de la manœuvrabilité exceptionnelle du bateau pour explorer les canaux de Port Grimaud, véritable perle de la Côte d'Azur...",
      photo: "/assets/Port-Grimaud-2.jpg",
      width: 800,
      height: 600,
    },
    {
      title: "Le Massif et les Calanques de l’Esterel",
      time: "40-45 min",
      description:
        "Les roches rouges de l’Estérel plongent dans une mer cristalline, créant un contraste saisissant. En bateau, on explore des criques sauvages...",
      photo: "/assets/Baie-de-Pampelonne.jpg",
      width: 800,
      height: 600,
    },
  ];

  const handleCardClick = (excursion: Excursion) => {
    setSelectedExcursion(excursion);
  };

  const handleCloseModal = () => {
    setSelectedExcursion(null);
  };

  return (
    <section className={styles.cruise}>
      <h1 className={styles.title}>Nos Excursions</h1>

      <div className={styles.excursions}>
        {excursions.map((excursion, index) => (
          <div
            key={index}
            className={styles.excursionCard}
            onClick={() => handleCardClick(excursion)}
          >
            <div className={styles.excursionImage}>
              <Image
                src={excursion.photo}
                alt={excursion.title}
                width={excursion.width}
                height={excursion.height}
                priority
              />
            </div>
            <div className={styles.excursionContent}>
              <h2 className={styles.excursionTitle}>{excursion.title}</h2>
              <p className={styles.excursionTime}>{excursion.time}</p>
              <p className={styles.excursionDescription}>
                {excursion.description.slice(0, 100)}...
              </p>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={selectedExcursion !== null}
        onClose={handleCloseModal}
        title={selectedExcursion?.title || ""}
      >
        {selectedExcursion && (
          <div className={styles.modalContent}>
            {/* Image redimensionnée */}
            <div className={styles.modalImage}>
              <Image
                className={styles.__image}
                src={selectedExcursion.photo}
                alt={selectedExcursion.title}
                width={700}
                height={350}
                priority
              />
            </div>
            <p>
              <strong>Temps de navigation :</strong> {selectedExcursion.time}
            </p>
            <p>
              <strong>Description :</strong> {selectedExcursion.description}
            </p>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default Cruise;
