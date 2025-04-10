"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./styles.module.scss";
import Modal from "../Modal/Modal";
import logo from "@/public/assets/logo/hippo.png";
import placeholder from "@/public/assets/images/placeholder.svg";

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
        "Nul besoin d’aller loin pour être bien : en sortant du port de Cavalaire vous pourrez jeter l’ancre au pied du massif des Maures, dans des eaux translucides où seuls les quelques privilégiés en bateau peuvent accéder. Les calanques de Cavalaire dévoilent un littoral préservé, où falaises dorées et pins maritimes bordent des eaux turquoise. Un véritable havre de paix idéal pour les amoureux de la Méditerranée.",
      photo: "/assets/images/calanques-cavalaire.webp",
      width: 800,
      height: 600,
    },
    {
      title: "L’île de Port-Cros",
      time: "20-25 min",
      description:
        "Fleuron du Parc national de Port-Cros, cette île est la plus sauvage de toutes, la faune et la flore y sont omniprésentes. Débarquez dans son petit village aux airs exotiques et laissez-vous séduire par les quelques délicieux restaurants de fruits de mer du port. Visitez le fort construit sous Richelieu en 1635 ou aventurez-vous sur les différents sentiers de l’île pour une randonnée d’exception et profitez du bateau pour admirer cette fabuleuse île sous tous ses angles.",
      photo: "/assets/images/port-cros.webp",
      width: 800,
      height: 600,
    },
    {
      title: "L’île de Porquerolles",
      time: "40-45 min",
      description:
        "Porquerolles est la plus grande des îles d’or. Classée parc national depuis 1971, cette île vous émerveillera par la splendeur de ses plages et de la nature environnante. Découvrez le village, profitez d’un déjeuner dans le calme d’une baie à bord du bateau, faites des excursions à pied ou à vélo ou partez visiter la Fondation Carmignac dédiée à l’art contemporain. Chacun y trouvera son compte pour une journée idyllique.",
      photo: "/assets/images/porquerolles-pLage-argent.webp",
      width: 800,
      height: 600,
    },
    {
      title: "La baie de Gigaro et le Cap Lardier",
      time: "10-15 min",
      description:
        "Naviguez 10 min pour rejoindre les merveilles du Cap Lardier, faisant partie, à l’instar du littoral de Cavalaire, du Parc National de Port-Cros. Des mouillages aux eaux turquoise vous attendent de part et d’autre du Cap Lardier. Appréciez le snorkeling ou débarquez sur la plage de la Bastide Blanche avec notre paddle board. Nombreuses seront les possibilités de vous émerveiller dans de tels endroits !",
      photo: "/assets/images/baie-de-gigaro.webp",
      width: 800,
      height: 600,
    },
    {
      title: "L’Escalet",
      time: "15-20 min",
      description:
        "Entre le Cap Taillat et le Cap Camarat, la baie de l’Escalet est sans doute l’un des plus beaux sites des environs. Vous serez facilement séduit par ses eaux aux airs de lagon polynésiens et par la beauté de la nature environnante.",
      photo: "/assets/images/plage-escalet.webp",
      width: 800,
      height: 600,
    },
    {
      title: "La Baie de Pampelonne",
      time: "25-30 min",
      description:
        "5 km de plage de sable fin et ses eaux turquoise font de Pampelonne une plage d’exception sur le littoral du Var et de la Côte d’Azur. Parsemée de plages-restaurants parmi les plus célèbres, voici l’endroit par excellence pour débarquer le temps d’un déjeuner et apprécier les premières saveurs de St-Tropez.",
      photo: "/assets/images/plage-pampelonne.webp",
      width: 800,
      height: 600,
    },
    {
      title: "Saint-Tropez",
      time: "40-45 min",
      description:
        "En arrivant par la mer, Saint-Tropez se dévoile dans toute son élégance, entre son port mythique bordé de yachts et ses façades colorées baignées de soleil. Depuis votre bateau, vous admirerez la citadelle dominant le village, avant d’accoster pour flâner dans ses ruelles pittoresques, découvrir son marché provençal ou savourer un verre en terrasse. Entre charme authentique et douceur de vivre, cette escale incontournable vous fera découvrir toute la magie de Saint-Tropez.",
      photo: "/assets/images/st-tropez.webp",
      width: 800,
      height: 600,
    },
    {
      title: "La cité lacustre de Port-Grimaud",
      time: "45-50 min",
      description:
        "Profitez de la manœuvrabilité exceptionnelle du bateau pour explorer les canaux de Port-Grimaud, véritable perle de la Côte d'Azur. En naviguant entre ses maisons colorées et ses ponts pittoresques, vous découvrirez cette cité lacustre unique sous le meilleur des points de vue. Une expérience inoubliable entre charme et sérénité.",
      photo: "/assets/images/port-grimaud.webp",
      width: 800,
      height: 600,
    },
    {
      title: "Le Massif et les Calanques de l’Esterel",
      time: "40-45 min",
      description:
        "Les roches rouges de l’Estérel plongent dans une mer cristalline, créant un contraste saisissant. En bateau, on explore des criques sauvages aux eaux limpides idéales pour apprécier une baignade. Plongez dans un décor volcanique spectaculaire, entre falaises abruptes et Méditerranée scintillante.",
      photo: "/assets/images/esterel.webp",
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
      <div className={styles.logo_title_wrapper}>
        <div className={styles.logo_container}>
          <Image
            src={logo || placeholder}
            alt="Yachting Day Logo"
            className={styles.logo}
            fill
            priority
          />
        </div>
        <h2 className={styles.title}>Nos Excursions</h2>
      </div>
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
