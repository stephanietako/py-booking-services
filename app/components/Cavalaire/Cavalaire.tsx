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
import gigaro from "@/public/assets/images/baie-gigaro.jpg";
import dattier from "@/public/assets/images/calanque-dattier.jpg";
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
            alt="Yachting Day location de bateau port de cavalaire-sur-mer et maintenance nautique"
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
              Voisine du célèbre golfe de Saint-Tropez, nichée entre mer et
              collines et faisant face aux majestueuses Îles d’Or, la commune de
              Cavalaire a de nombreux avantages pour vous séduire.
            </p>

            <p>
              Idéalement situé à proximité des plus beaux mouillages de la
              région, dont la réputation n’est plus à faire, le port de
              Cavalaire est le point de départ idéale pour toutes vos
              excursions.
            </p>

            <p>
              Partez explorer, d’un côté, Saint-Tropez, Pampelonne, la baie de
              l’Escalet aux eaux cristallines, le cap Lardier et ses paysages
              préservés, ou encore la baie sauvage de la Bastide Blanche. De
              l’autre, découvrez les calanques secrètes de Cavalaire et du
              Rayol, les sublimes Îles d’Or ou le Cap Bénat et ses panoramas
              grandioses. Malgré sa situation privilégiée, la baie de Cavalaire
              conserve une quiétude rare, même en haute saison. Loin de
              l’effervescence du golfe de Saint-Tropez, la navigation y est
              généralement plus paisible. N’hésitez donc plus s’il vous prend
              l’envie d’une traversée !
            </p>
          </div>

          <div className={styles.main_image}>
            <Image
              src={image1}
              alt="Cap Camarat 12.5 Wa"
              className={styles.__image}
              width={610}
              height={510}
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
                  src: dattier,
                  title: "Cavalaire Calanque du Dattier",
                },
                {
                  src: gigaro,
                  title: "Baie de Gigaro",
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
