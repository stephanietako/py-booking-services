"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./styles.module.scss";
import { UserButton, useUser } from "@clerk/nextjs";
import { addUserToDatabase } from "@/actions/actions";

const Navbar: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.id && user.primaryEmailAddress?.emailAddress && user.firstName) {
      addUserToDatabase(
        user.primaryEmailAddress.emailAddress,
        user.firstName,
        user.imageUrl || "", // Ajout de l'image ici (assure-toi que `imageUrl` existe)
        user.id
      );
    }
  }, [user]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  if (!isLoaded) return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">Logo</Link>
      </div>
      <div className={styles.menuToggle} onClick={toggleMenu}>
        ☰
      </div>
      <div className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
        {isSignedIn ? (
          <>
            <Link href="/dashboard">
              <div className="btn_secret">Mon Tableau de bord</div>
            </Link>
            <>
              <Link href="/services">
                <div className="btn_secret">Mes Services</div>
              </Link>
              <Link href="/transactions">
                <div className="btn_secret">Mes Transactions</div>
              </Link>
              <Link href="/dashboardUser">
                <div className="btn_secret">Dashboard</div>
              </Link>
              <Link href="/admin">
                <div className="btn_secret">ADMIN</div>
              </Link>
            </>
            <UserButton />
          </>
        ) : (
          <>
            <Link href="/sign-in">Se connecter</Link>
            <Link href="/sign-up">S&apos;inscrire</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
