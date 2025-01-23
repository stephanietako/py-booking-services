"use client";
import { useState } from "react";
import Calendar from "./components/Calendar/Calendar";
import Image from "next/image";
import styles from "./page.module.css";
import Navbar from "./components/Navbar/Navbar";

import { ServiceHours } from "@/type"; // Assure-toi d'utiliser le bon type Service

interface HomeProps {
  days: ServiceHours[]; // Utilisation de ServiceHours
  closedDays: string[]; // Jours fermés sous forme de chaînes ISO
}
const Home: React.FC<HomeProps> = ({ days, closedDays }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string>(""); // Affichage des erreurs

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <main className={styles.main}>
          <h1>HELLO WORLD BOOKING APP</h1>
          <h2>Starting project</h2>
          <br />
          <h1>Nos Services</h1>
          <br />
          {/* Affichage des services */}
          {error && <p className="error">{error}</p>}{" "}
          {/* Affichage de l'erreur */}
          <h2>SÉLÉCTIONNEZ UNE DATE</h2>
          <Calendar days={days} closedDays={closedDays} />
        </main>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/file.svg"
              alt="File icon"
              width={16}
              height={16}
            />
            Learn
          </a>
          <a
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/window.svg"
              alt="Window icon"
              width={16}
              height={16}
            />
            Examples
          </a>
          <a
            href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />
            Go to nextjs.org →
          </a>
        </footer>
      </div>
    </>
  );
};

export default Home;
