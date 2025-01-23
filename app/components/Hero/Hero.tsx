"use client";
import React, { useEffect, useState } from "react";
// Importation du composant Image de Next.js
import Image from "next/image";

const Hero = () => {
  const [isMobile, setIsMobile] = useState(false);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  useEffect(() => {
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="hero" id="hero">
      <div className="hero_container">
        {isMobile ? (
          <Image
            src="/assets/photo1.jpg"
            alt="GIF alternative"
            sizes="(max-width: 800px) 100vw, 1200px 70vw  1200px 50vw"
            width={800}
            height={700}
            unoptimized
            className="img_hero"
          />
        ) : (
          <video
            id="video"
            playsInline
            loop
            muted
            autoPlay
            src="/videos/video-test.mp4"
          />
        )}
      </div>
    </div>
  );
};

export default Hero;
