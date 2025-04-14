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
  // const { user, isSignedIn } = useUser();
  const [bookingToken, setBookingToken] = useState<string | null>(null);
  const navbarElement = useRef<HTMLDivElement>(null);
  const navigationHeight = useRef(0);

  useEffect(() => {
    // This effect will only run after the navbar element has been rendered
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
      if (window.scrollY > 500) {
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
          // Prendre la dernière réservation active
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
    setIsClient(true); // ✅ On passe en mode client
  }, []);

  useEffect(() => {
    if (user?.id && user.primaryEmailAddress?.emailAddress && user.firstName) {
      addUserToDatabase(
        user.primaryEmailAddress.emailAddress,
        user.firstName,
        user.imageUrl || "", // Ajout de l'image ici
        user.id
      );
    }
  }, [user]);

  // Fonction pour récupérer le rôle de l'utilisateur
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user?.id) {
        const role = await getRole(user.id); // Récupère le rôle de l'utilisateur
        setUserRole(role?.role?.name || null); // Stocke le rôle dans l'état
      }
    };
    if (user?.id) fetchUserRole(); // Appel la fonction lorsque l'utilisateur est connecté
  }, [user]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // ✅ On s'assure que le composant est bien monté côté client avant d'afficher quoi que ce soit
  if (!isClient || !isLoaded) return null;
  //////////////////

  return (
    <nav
      ref={navbarElement}
      className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}
    >
      {/* Logo */}
      <div className={styles.logo_image}>
        <Link href="/">
          <Image
            src={logo}
            alt="Yachting Day Logo"
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
      {/* <div className={styles.heroButtons}>
        <Link href="/tarifs" className={styles.buttonHero}>
          Location
        </Link>
        <Link href="/entretien" className={styles.buttonHero}>
          Entretien
        </Link>
        <Link href="#footer" className={styles.buttonHero}>
          Contact
        </Link>
      </div> */}
      <div className={styles.primaryLinks}>
        <Link href="/tarifs" className={styles.navButton}>
          Location
        </Link>
        <Link href="/entretien" className={styles.navButton}>
          Entretien
        </Link>
        <Link href="#footer" className={styles.navButton}>
          Contact
        </Link>
      </div>

      {/* Burger */}
      <div className={styles.menuToggle} onClick={toggleMenu}>
        {menuOpen ? "✕" : "☰"}
      </div>

      {/* Overlay */}
      {menuOpen && <div className={styles.overlay} onClick={toggleMenu} />}

      {/* Menu */}
      {/* <div className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
        {isSignedIn ? (
          <>
            <Link href="/my-bookings" className="nav-link">
              Mes réservations
            </Link>
            <Link href="/dashboard">Tableau de bord</Link>

            {bookingToken && (
              <Link
                href={`/manage-booking?token=${bookingToken}`}
                className="nav-link"
              >
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
            <Link href="/sign-in">Se connecter</Link>
            <Link href="/sign-up">S&apos;inscrire</Link>
            <Link href="#footer">Contact</Link>
          </div>
        )}
      </div> */}
      {/* Menu */}
      <div className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
        {/* --- Mobile-only links visible dans le burger --- */}
        <div className={styles.mobileOnlyLinks}>
          <Link href="/tarifs" onClick={toggleMenu}>
            Location
          </Link>
          <Link href="/entretien" onClick={toggleMenu}>
            Entretien
          </Link>
          <Link href="#footer" onClick={toggleMenu}>
            Contact
          </Link>
        </div>

        {isSignedIn ? (
          <>
            <Link href="/my-bookings" className="nav-link">
              Mes réservations
            </Link>
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
            <Link href="/sign-in">Se connecter</Link>
            <Link href="/sign-up">S&apos;inscrire</Link>
            <Link href="#footer">Contact</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
