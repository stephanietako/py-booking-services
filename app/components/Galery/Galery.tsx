"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./styles.module.scss";

const images = [
  "/assets/galery/gal11-ext.webp",
  "/assets/galery/gal9-ext.webp",
  "/assets/galery/gal10-ext.webp",
  "/assets/galery/gal6-ext.webp",
  "/assets/galery/gal1.webp",
  "/assets/galery/gal2.webp",
  "/assets/galery/gal3.webp",
  "/assets/galery/gal4.webp",
  "/assets/galery/gal5.webp",
  "/assets/galery/gal7.webp",
  "/assets/galery/gal3.webp",
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
        <h2>Galerie</h2>
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
