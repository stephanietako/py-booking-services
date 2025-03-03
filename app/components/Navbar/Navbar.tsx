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
            {/* // nombre, total et services atteints */}
            {/* <Link href="/dashboardTest">
              <div className="btn">Mon Tableau de bord</div>
            </Link> */}
            <>
              <Link href="/my-bookings">
                <div className="btn">Mes réservations</div>
              </Link>
              <Link href="/dashboard">
                <div className="btn">Dashboard</div>
              </Link>
              {/* //transactions des 30derniers jours par exemple */}
              {/* <Link href="/transactions">
                <div className="btn">Mes Transactions</div>
              </Link> */}

              <Link href="/admin/services">
                <div className="btn">Mes Services</div>
              </Link>
              <Link href="/admin">
                <div className="btn">ADMIN</div>
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
