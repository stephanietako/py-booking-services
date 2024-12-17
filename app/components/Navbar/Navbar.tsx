"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./styles.module.scss";
import { UserButton, useUser } from "@clerk/nextjs";
import { checkAndAddUser } from "@/actions/actions";

const Navbar: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      checkAndAddUser(user?.primaryEmailAddress?.emailAddress);
    }
  }, [user]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">
          <span>Logo</span>
        </Link>
      </div>
      <div className={styles.menuToggle} onClick={toggleMenu}>
        ☰
      </div>
      <div className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
        {isLoaded && isSignedIn ? (
          <>
            <Link href="/services">
              <div className="btn_secret">Mes Services</div>
            </Link>
            <Link href="/transactions">
              <div className="btn_secret">Mes Transactions</div>
            </Link>
            <Link href="/">
              <div className="btn_secret">Mon Tableau de bord</div>
            </Link>
            <Link href="/secret">
              <div className="btn_secret">Mon secret</div>
            </Link>
            <UserButton />
          </>
        ) : (
          <>
            <Link href="/sign-in">
              <button className={styles.navLink}>Se connecter</button>
            </Link>
            <Link href="/sign-up">
              <button className={styles.navLink}>S&apos;inscrire</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
