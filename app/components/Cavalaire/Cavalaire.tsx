// Cavalaire.tsx
import React from "react";
import Image from "next/image";
import Carousel from "../Carousel/Carousel";
import logo from "@/public/assets/logo/hippo.png";
import placeholder from "@/public/assets/images/placeholder.svg";
import calanque from "@/public/assets/images/cavalaire-calanque-cavalaire.webp";
import courtade from "@/public/assets/images/porquerolles-la-courtade.webp";
import pampelonne from "@/public/assets/images/ramatuelle-plage-pampelonne.webp";
import bonporteau from "@/public/assets/images/cavalaire-plage-bonporteau.webp";
import portelet from "@/public/assets/images/saint-tropez-le-portalet.webp";
import portcro from "@/public/assets/images/port-cro-baie-de-port-man.webp";
import image1 from "@/public/assets/images/plage-pampelonne.webp";

//Styles
import styles from "./styles.module.scss";

export const dynamic = "force-dynamic";

interface CavalaireProps {
  images: string[];
}

const Cavalaire: React.FC<CavalaireProps> = () => {
  return (
    <div className={styles.cavalaire}>
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
        <h2 className={styles.title}>les environs</h2>
      </div>
      <div className={styles.content_wrapper}>
        <div className={styles.content}>
          <div className={styles.text_container}>
            <p>Bienvenue dans la baie de Cavalaire !</p>
            <p>
              Voisine du golf de Saint-Tropez, entre mer et collines, en face
              des îles d’or, la commune de Cavalaire a de nombreux avantages
              pour vous séduire !
            </p>

            <p>
              À proximité immédiate de tous les plus fameux mouillages des
              environs dont la réputation n’est plus à faire, le port de
              Cavalaire est le point de départ idéal pour toutes vos excursions.
            </p>

            <p>
              Gigaro, Le cap Lardier et ses merveilles ou la baie de la Baside
              blanche sont à environ 15 min de navigation. Juste après, le
              littoral de Ramatuelle vous séduira avec les très fameuses baies
              de l’Escalet et de Pampelonne. Enfin, il vous faudra environ 40
              min pour rejoindre le port de St Tropez. La baie de Cavalaire ne
              connaît pas l’agitation permanente du golf de St Tropez durant la
              haute saison, la navigation y est donc bien plus agréable et
              l’accès aux principaux points d’intérêt cités ci-dessus est plus
              direct.
            </p>

            <p>
              Enfin, le port de Cavalaire est à quelques 20 min de navigation de
              l’île de Port-Cros et environ 45 min pour l’île de Porquerolles
              quand il vous en faudra plus du double au départ du golf de
              St-Tropez. N’hésitez donc pas s’il vous prend l’envie d‘une
              traversée !
            </p>
          </div>

          <div className={styles.main_image}>
            <Image
              src={image1}
              alt="Cap Camarat 12.5 Wa"
              className={styles.__image}
              width={400}
              height={350}
              priority
            />
          </div>
        </div>
      </div>

      <div className={styles.carousel_container}>
        <div className={styles.carousel_container}>
          <div className={styles.carousel_container}>
            <Carousel
              images={[
                {
                  src: calanque,
                  title: "Cavalaire Calanque de Cavalaire",
                },
                {
                  src: courtade,
                  title: "Porquerolles La Courtade",
                },
                {
                  src: pampelonne,
                  title: "Ramatuelle Plage de Pampelonne",
                },
                {
                  src: bonporteau,
                  title: "Cavalaire Plage Ponporteau",
                },
                {
                  src: portelet,
                  title: "Saint-Tropez Le Portelet",
                },
                {
                  src: portcro,
                  title: "Port-Cro Baie de Port-Man",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cavalaire;
