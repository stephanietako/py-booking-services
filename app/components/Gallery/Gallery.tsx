// "use client";

// import React from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import styles from "./styles.module.scss";

// const images = [
//   "/assets/gallery/gal9-ext.webp",
//   "/assets/gallery/gal10-ext.webp",
//   "/assets/gallery/gal11-ext.webp",
//   "/assets/gallery/gal12-ext.webp",
//   "/assets/gallery/gal6-ext.webp",
//   "/assets/gallery/gal1.webp",
//   "/assets/gallery/gal2.webp",
//   "/assets/gallery/gal3.webp",
//   "/assets/gallery/gal4.webp",
//   "/assets/gallery/gal5.webp",
//   "/assets/gallery/gal7.webp",
//   "/assets/gallery/gal8.webp",
//   "/assets/gallery/gal3.webp",
//   "/assets/gallery/gal4.webp",
//   "/assets/gallery/gal5.webp",
// ];

// const Gallery = () => {
//   return (
//     <div className={styles.gallery}>
//       <AnimatePresence>
//         {images.map((src, index) => (
//           <motion.div
//             key={index}
//             className={styles.imageContainer}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.9 }}
//           >
//             <Image
//               src={src}
//               alt={`Gallery image ${index + 1}`}
//               layout="responsive"
//               width={400}
//               height={250}
//             />
//           </motion.div>
//         ))}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default Gallery;
// "use client";

// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import Image from "next/image";
// import styles from "./styles.module.scss";

// const images = [
//   "/assets/gallery/gal9-ext.webp",
//   "/assets/gallery/gal10-ext.webp",
//   "/assets/gallery/gal11-ext.webp",
//   "/assets/gallery/gal12-ext.webp",
//   "/assets/gallery/gal6-ext.webp",
// ];

// const Gallery = () => {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [direction, setDirection] = useState(1);

//   // 👉 Fonction pour aller à l'image suivante
//   const handleNext = () => {
//     setDirection(1);
//     setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
//   };

//   // 👉 Fonction pour aller à l'image précédente
//   const handlePrevious = () => {
//     setDirection(-1);
//     setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
//   };

//   // 🎬 Effet autoplay (toutes les 3s)
//   useEffect(() => {
//     const interval = setInterval(handleNext, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   // ✨ Variantes Framer Motion
//   const imageVariants = {
//     enter: (direction: number) => ({
//       x: direction > 0 ? 120 : -120, // ⬅️ Réduction du mouvement pour un effet plus doux
//       opacity: 0,
//       filter: "blur(10px)", // Ajout d'un léger flou pour un effet smooth
//     }),
//     center: {
//       x: 0,
//       opacity: 1,
//       filter: "blur(0px)", // L’image devient nette progressivement
//       transition: {
//         duration: 0.8, // ⏳ Augmentation de la durée pour plus de fluidité
//         type: "spring", // 🏀 Effet élastique plus naturel
//         stiffness: 100, // Moins rigide
//         damping: 15, // Plus amorti
//       },
//     },
//     exit: (direction: number) => ({
//       x: direction > 0 ? -120 : 120,
//       opacity: 0,
//       filter: "blur(10px)",
//     }),
//   };

//   return (
//     <div className={styles.carouselContainer}>
//       <div className={styles.imagesContainer}>
//         <motion.div
//           key={activeIndex}
//           className={styles.imageWrapper}
//           custom={direction}
//           initial="enter"
//           animate="center"
//           exit="exit"
//           variants={imageVariants}
//         >
//           <Image
//             src={images[activeIndex]}
//             alt={`Gallery image ${activeIndex + 1}`}
//             fill
//             objectFit="cover"
//             className={styles.image}
//           />
//         </motion.div>

//         {/* Controls */}
//         <div className={styles.controls}>
//           <button onClick={handlePrevious} className={styles.previous}>
//             ⬅️
//           </button>
//           <button onClick={handleNext} className={styles.next}>
//             ➡️
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Gallery;
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./styles.module.scss";

const images = [
  "/assets/gallery/gal11-ext.webp",
  "/assets/gallery/gal9-ext.webp",
  "/assets/gallery/gal10-ext.webp",
  "/assets/gallery/gal6-ext.webp",
  "/assets/gallery/gal1.webp",
  "/assets/gallery/gal2.webp",
  "/assets/gallery/gal3.webp",
  "/assets/gallery/gal4.webp",
  "/assets/gallery/gal5.webp",
  "/assets/gallery/gal7.webp",
  "/assets/gallery/gal3.webp",
];

const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [transitionDirection, setTransitionDirection] = useState("next");

  const handleNext = () => {
    setTransitionDirection("next");
    setActiveIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevious = () => {
    setTransitionDirection("previous");
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Autoplay effect
  useEffect(() => {
    const interval = setInterval(handleNext, 3000); // Change slide every 3 seconds
    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.title}>
        <h3>Galerie</h3>
      </div>
      <div className={styles.imagesContainer}>
        {images.map((src, index) => {
          const isActive = index === activeIndex;
          const isPrevious =
            index === (activeIndex - 1 + images.length) % images.length;
          const isNext = index === (activeIndex + 1) % images.length;

          return (
            <motion.div
              key={index}
              className={styles.imageWrapper}
              initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              animate={{
                opacity: isActive ? 1 : isPrevious || isNext ? 0.5 : 0.2,
                scale: isActive ? 1 : isPrevious || isNext ? 0.85 : 0.7,
                filter: isActive ? "blur(0px)" : "blur(10px)",
                zIndex: isActive ? 3 : isPrevious || isNext ? 2 : 1,
                x: isActive ? 0 : isPrevious ? -100 : isNext ? 100 : 0,
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Image
                src={src}
                alt={`Gallery image ${index + 1}`}
                className={styles.image}
                fill
              />
            </motion.div>
          );
        })}
        <div className={styles.controls}>
          <button onClick={handlePrevious} className={styles.previous}>
            <Image
              src="/assets/icon/previous.png"
              alt="previous icon"
              width={24}
              height={24}
            />
          </button>
          <button onClick={handleNext} className={styles.next}>
            <Image
              src="/assets/icon/next.png"
              alt="next icon"
              width={24}
              height={24}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Carousel;
