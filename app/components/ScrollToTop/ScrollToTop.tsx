"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./styles.module.scss";
import scrollIcon from "@/public/assets/icon/ancre.png";

const isBrowser = (): boolean => typeof window !== "undefined";

function scrollToTop(): void {
  if (!isBrowser()) return;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const handleScroll = (): void => {
    setIsVisible(window.scrollY > 114);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <button
      className={`${styles.scrollToTopButton} ${isVisible ? styles.visible : ""}`}
      onClick={scrollToTop}
    >
      <Image src={scrollIcon} alt="Scroll to top" width={20} height={25} />
    </button>
  );
};

export default ScrollToTop;
