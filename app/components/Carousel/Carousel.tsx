"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./styles.module.scss";

interface CarouselProps {
  images: string[];
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
      {images.map((src, index) => (
        <div
          key={src}
          className={`${styles.slide} ${index === currentIndex ? styles.active : ""}`}
        >
          <Image
            src={src || "/placeholder.svg"}
            alt={`Slide ${index + 1}`}
            fill
            style={{ objectFit: "cover" }}
          />
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
