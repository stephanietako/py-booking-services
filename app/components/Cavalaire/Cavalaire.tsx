// Cavalaire.tsx
import React from "react";
import Carousel from "../Carousel/Carousel"; // Assurez-vous que le chemin est correct
import styles from "./styles.module.scss";

interface CavalaireProps {
  images: string[];
}

const Cavalaire: React.FC<CavalaireProps> = ({ images }) => {
  return (
    <section className={styles.cavalaireSection}>
      <div className={styles.text}>
        <h2 className={styles.title}>Les environs</h2>

        <p>
          Bienvenue dans la baie de Cavalaire ! Voisine du golf de St Tropez,
          entre mer et collines, en face des îles d’or, la commune de Cavalaire
          a de nombreux avantages pour vous séduire !
        </p>

        <p>
          À proximité immédiate de tous les plus fameux mouillages des environs
          dont la réputation n’est plus à faire, le port de Cavalaire est le
          point de départ idéal pour toutes vos excursions.
        </p>

        <p>
          Gigaro, Le cap Lardier et ses merveilles ou la baie de la Baside
          blanche sont à environ 15 min de navigation. Juste après, le littoral
          de Ramatuelle vous séduira avec les très fameuses baies de l’Escalet
          et de Pampelonne.
        </p>

        <p>
          Enfin, il vous faudra environ 40 min pour rejoindre le port de St
          Tropez. La baie de Cavalaire ne connaît pas l’agitation permanente du
          golf de St Tropez durant la haute saison, la navigation y est donc
          bien plus agréable et l’accès aux principaux points d’intérêt cités
          ci-dessus est plus direct.
        </p>

        <p>
          Enfin, le port de Cavalaire est à quelques 20 min de navigation de
          l’île de Port-Cros et environ 45 min pour l’île de Porquerolles quand
          il vous en faudra plus du double au départ du golf de St-Tropez.
          N’hésitez donc pas s’il vous prend l’envie d‘une traversée !
        </p>

        <Carousel images={images} />
      </div>
    </section>
  );
};

export default Cavalaire;
