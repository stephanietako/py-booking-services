"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
// Styles
import styles from "./styles.module.scss";

interface CarouselImage {
  src: StaticImageData;
  title: string;
}

interface CarouselProps {
  images: CarouselImage[];
}

const Carousel: React.FC<CarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className={styles.carousel}>
      {images.map((image, index) => (
        <div
          key={`${image.title}-${index}`}
          className={`${styles.slide} ${index === currentIndex ? styles.active : ""}`}
        >
          <Image
            src={image.src}
            alt={`Excursions en mer avec Cap Camarat 12.5 WA – modèle 2021 : ${image.title}, en location avec skipper au port de Cavalaire-sur-Mer`}
            style={{
              objectFit: "cover",
              objectPosition: "top",
              width: "100%",
              height: "100%",
            }}
          />
          <div className={styles.caption}>
            <h2>{image.title}</h2>
          </div>
        </div>
      ))}

      <div className={styles.indicators}>
        {images.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${index === currentIndex ? styles.active : ""}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
