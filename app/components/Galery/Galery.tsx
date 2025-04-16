"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./styles.module.scss";

const images = [
  "/assets/images/boat-cote2.jpg",
  "/assets/images/vue-boat.webp",

  "/assets/images/vue-exterieur.webp",
  "/assets/galery/table-avant.webp",
  "/assets/images/interieur-capitaine.jpg",
  "/assets/galery/Cap-Camarat1-Plan-de-Cabine.jpg",
  "/assets/galery/Cap-Camarat2-Plan-de-Pont.jpg",
  "/assets/galery/Cap-Camarat3-Plan-de-Pont.jpg",
  "/assets/galery/gal6-ext.webp",
  "/assets/galery/gal9-ext.webp",
  "/assets/galery/gal10-ext.webp",
  "/assets/galery/gal11-ext.webp",
  "/assets/galery/gal12-ext.webp",
  "/assets/galery/gal1.webp",
  "/assets/images/table-jour-avant.jpg",
  "/assets/galery/gal13.webp",
  "/assets/galery/gal3.webp",
  "/assets/galery/gal4.webp",
  "/assets/galery/gal15.webp",
  "/assets/galery/gal5.webp",
  "/assets/galery/gal7.webp",
  "/assets/galery/gal2.webp",
];

const Galery = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);

  const zoomVariants = {
    hidden: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
  };

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, []);

  const handlePrevious = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, []);

  // Autoplay effect
  useEffect(() => {
    if (isPaused || zoomIndex !== null) return;

    const interval = setInterval(handleNext, 3000);
    return () => clearInterval(interval);
  }, [isPaused, zoomIndex, handleNext]);

  // Keyboard navigation when zoomed
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (zoomIndex === null) return;
      if (e.key === "Escape") setZoomIndex(null);
      if (e.key === "ArrowRight")
        setZoomIndex((prev) => (prev! + 1) % images.length);
      if (e.key === "ArrowLeft")
        setZoomIndex((prev) => (prev! === 0 ? images.length - 1 : prev! - 1));
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [zoomIndex]);

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.title}>
        <h2>Galerie</h2>
      </div>

      <div
        className={styles.imagesContainer}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {images.map((src, index) => {
          const isActive = index === activeIndex;
          const isPrevious =
            index === (activeIndex - 1 + images.length) % images.length;
          const isNext = index === (activeIndex + 1) % images.length;

          return (
            <motion.div
              key={index}
              className={styles.imageWrapper}
              onClick={() => isActive && setZoomIndex(index)}
              initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              animate={{
                opacity: isActive ? 1 : isPrevious || isNext ? 0.6 : 0.2,
                scale: isActive ? 1 : isPrevious || isNext ? 0.85 : 0.7,
                filter: isActive ? "blur(0px)" : "blur(10px)",
                x: isActive ? 0 : isPrevious ? -100 : isNext ? 100 : 0,
                zIndex: isActive ? 3 : isPrevious || isNext ? 2 : 1,
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Image
                src={src}
                alt={`Gallery image ${index + 1}`}
                className={styles.image}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
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

      {/* ZOOM OVERLAY */}
      {zoomIndex !== null && (
        <motion.div
          className={styles.zoomOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={zoomVariants} // Utilisation des variantes pour la transition
          onClick={() => setZoomIndex(null)}
          style={{ cursor: "zoom-out" }}
        >
          {/* <button
            className={styles.closeZoom}
            onClick={(e) => {
              e.stopPropagation();
              setZoomIndex(null);
            }}
          >
            ✕
          </button> */}

          <motion.div
            className={styles.zoomWrapper}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Image
              src={images[zoomIndex]}
              alt="Zoomed"
              className={styles.zoomedImage}
              width={1200}
              height={870}
              sizes="(max-width: 768px) 100vw, 1200px"
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
              priority
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Galery;
