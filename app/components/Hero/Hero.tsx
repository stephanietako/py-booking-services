// import React from "react";
// import Image from "next/image";
// import backgroundImg from "@/public/assets/images/hero.webp"; // Importation de l'image de fond
// // Styles
// import styles from "./styles.module.scss";

// export const dynamic = "force-dynamic";

// const Hero: React.FC = () => {
//   return (
//     <div className={styles.heroWrapper}>
//       <Image
//         src={backgroundImg}
//         alt="Yachting Day location de bateau Cap Camarat 12.5 WA – modèle 2021 port de cavalaire-sur-mer et maintenance nautique"
//         className={styles.heroImage}
//         priority
//         fill
//         placeholder="blur"
//       />
//       <div className={styles.heroContent}>
//         <div className={styles.hero_container}>
//           <div className={styles.hero_bloc}>
//             <div className={styles.hero_text}>
//               <h1>Location De Bateau Cavalaire-Sur-Mer</h1>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Hero;
// components/Hero/Hero.tsx

// components/Hero/Hero.tsx
// components/Hero/Hero.tsx
"use client";

import React from "react";
import Image from "next/image";
import defaultHeroImg from "@/public/assets/images/hero.webp";
import styles from "./styles.module.scss";

interface HeroProps {
  mediaUrl?: string;
  mediaType?: "image" | "video";
}

const Hero: React.FC<HeroProps> = ({ mediaUrl, mediaType }) => {
  const finalMediaUrl = mediaUrl || defaultHeroImg.src;
  const finalMediaType = mediaType || "image";

  // Détermine la source de l'image pour le composant Image
  // Si c'est l'image par défaut (importée statiquement), utilise l'objet complet
  // Sinon, si c'est une URL externe (de Supabase), utilise juste l'URL et désactive le blur pour cette image
  const imageSrc = mediaUrl ? mediaUrl : defaultHeroImg; // Ceci permet de passer l'objet StaticImageData ou la string URL

  return (
    <div className={styles.heroWrapper}>
      {finalMediaType === "video" ? (
        <video
          src={finalMediaUrl}
          className={styles.heroImage}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          Votre navigateur ne supporte pas la lecture de vidéo.
        </video>
      ) : (
        <Image
          // Si imageSrc est un objet StaticImageData, Next.js utilisera automatiquement son blurDataURL
          // Si c'est une string (URL externe), nous devons ajuster le placeholder
          src={imageSrc}
          alt="Yachting Day location de bateau Cap Camarat 12.5 WA – modèle 2021 port de cavalaire-sur-mer et maintenance nautique"
          className={styles.heroImage}
          priority={true}
          fill
          // --- MODIFICATION ICI ---
          // Conditionne l'utilisation du placeholder='blur' et blurDataURL
          // Si l'image est ton image par défaut (importation statique), utilise le blur
          // Sinon (si c'est une URL externe de la DB), n'utilise pas le blur, car on n'a pas la blurDataURL.
          {...(imageSrc === defaultHeroImg
            ? { placeholder: "blur", blurDataURL: defaultHeroImg.blurDataURL }
            : {})}
        />
      )}
      <div className={styles.heroContent}>
        <div className={styles.hero_container}>
          <div className={styles.hero_bloc}>
            <div className={styles.hero_text}>
              <h1>Location De Bateau Cavalaire-Sur-Mer</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
