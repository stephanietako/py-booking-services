"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
// Styles
import styles from "./styles.module.scss";
import { UserButton, useUser } from "@clerk/nextjs";
import { addUserToDatabase, getRole } from "@/actions/actions";
import { getUserBookings, generateBookingToken } from "@/actions/bookings";
import logo from "@/public/assets/logo/logo-new.png";

const Navbar: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [bookingToken, setBookingToken] = useState<string | null>(null);
  const navbarElement = useRef<HTMLDivElement>(null);
  const navigationHeight = useRef(0);

  useEffect(() => {
    if (navbarElement.current) {
      navigationHeight.current = navbarElement.current.offsetHeight;
      console.info("Navbar height:", navbarElement.current.offsetHeight);
      navbarElement.current.style.setProperty(
        "--scroll-padding",
        navigationHeight.current.toString()
      );
    }
  }, []);

  // Écoute du scroll pour changer l'état de la navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Récupérer le token de réservation de l'utilisateur
  useEffect(() => {
    const fetchBooking = async () => {
      if (!user || !isSignedIn) return;

      try {
        const bookings = await getUserBookings(user.id);
        if (bookings.length > 0) {
          const latestBooking = bookings[0];
          const token = await generateBookingToken(latestBooking.id, user.id);
          setBookingToken(token);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de la réservation :",
          error
        );
      }
    };

    fetchBooking();
  }, [user, isSignedIn]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (user?.id && user.primaryEmailAddress?.emailAddress && user.firstName) {
      addUserToDatabase(
        user.primaryEmailAddress.emailAddress,
        user.firstName,
        user.imageUrl || "",
        user.id
      );
    }
  }, [user]);

  // Fonction pour récupérer le rôle de l'utilisateur
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user?.id) {
        const role = await getRole(user.id);
        setUserRole(role?.role?.name || null);
      }
    };
    if (user?.id) fetchUserRole();
  }, [user]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  if (!isClient || !isLoaded) return null;
  //////////////////

  return (
    <nav
      ref={navbarElement}
      className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}
    >
      <div className={styles.logo_image}>
        <Link href="/">
          <Image
            src={logo}
            alt="Yachting Day location de bateau Cap Camarat 12.5 WA – modèle 2021 port de cavalaire-sur-mer et maintenance nautique"
            className={styles.logo}
            width={200}
            height={150}
            priority
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
              cursor: "pointer",
            }}
          />
        </Link>
      </div>

      <div className={styles.primaryLinks}>
        <Link href="/location" className={styles.navButton}>
          Location
          <span className="shimmer"></span>
        </Link>
        <Link href="/entretien" className={styles.navButton}>
          Entretien
          <span className="shimmer"></span>
        </Link>
        <Link href="#footer" className={styles.navButton}>
          Contact
          <span className="shimmer"></span>
        </Link>
      </div>

      {/* Burger */}
      <div className={styles.menuToggle} onClick={toggleMenu}>
        {menuOpen ? "✕" : "☰"}
      </div>

      {/* Overlay */}
      {menuOpen && <div className={styles.overlay} onClick={toggleMenu} />}

      <div className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
        {/* --- Mobile-only links visible dans le burger --- */}
        {/* <div className={styles.mobileOnlyLinks}>
          <Link href="/location" onClick={toggleMenu}>
            Location
          </Link>
          <Link href="/entretien" onClick={toggleMenu}>
            Entretien
          </Link>
          <Link href="#footer" onClick={toggleMenu}>
            Contact
          </Link>
        </div> */}
        <div className={styles.mobileOnlyLinks}>
          <details className={styles.mobileDropdown}>
            <summary>Location</summary>
            <div className={styles.dropdownLinks}>
              <Link href="/location#excursions" onClick={toggleMenu}>
                Nos excursions
              </Link>
              <Link href="/location#bateau" onClick={toggleMenu}>
                Le bateau
              </Link>
              <Link href="/location#environs" onClick={toggleMenu}>
                Les environs
              </Link>
            </div>
          </details>

          <Link href="/entretien" onClick={toggleMenu}>
            Entretien
          </Link>
          <Link href="#footer" onClick={toggleMenu}>
            Contact
          </Link>
        </div>

        {isSignedIn ? (
          <>
            <Link href="/dashboard">Tableau de bord</Link>
            {bookingToken && (
              <Link href={`/manage-booking?token=${bookingToken}`}>
                Ma réservation
              </Link>
            )}
            {userRole === "admin" && (
              <Link href="/admin/services">Mes Services</Link>
            )}
            {userRole === "admin" && <Link href="/admin">ADMIN</Link>}
            <UserButton />
          </>
        ) : (
          <div className={styles.authLinks}>
            <Link href="/">Accueil</Link>
            <Link href="/about" className={styles.buttonHero}>
              Qui sommes-nous
            </Link>
            <Link href="/galerie" className={styles.buttonHero}>
              Galerie
            </Link>
            {/* <Link href="/sign-in">Se connecter</Link>
            <Link href="/sign-up">S&apos;inscrire</Link> */}
            <Link href="#footer">Contact</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
