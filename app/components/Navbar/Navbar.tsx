// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import styles from "./styles.module.scss";
// import { UserButton, useUser } from "@clerk/nextjs";
// import { addUserToDatabase } from "@/actions/actions";
// import logo from "@/public/assets/logo/logo-full.png";
// import Image from "next/image";

// const Navbar: React.FC = () => {
//   const { isLoaded, isSignedIn, user } = useUser();
//   const [menuOpen, setMenuOpen] = useState(false);

//   useEffect(() => {
//     if (user?.id && user.primaryEmailAddress?.emailAddress && user.firstName) {
//       addUserToDatabase(
//         user.primaryEmailAddress.emailAddress,
//         user.firstName,
//         user.imageUrl || "", // Ajout de l'image ici (assure-toi que `imageUrl` existe)
//         user.id
//       );
//     }
//   }, [user]);

//   const toggleMenu = () => setMenuOpen(!menuOpen);

//   if (!isLoaded) return null;

//   return (
//     <nav className={styles.navbar}>
//       <div className={styles.logo}>
//         <Link href="/">
//           <Image src={logo} alt="Logo" width={150} height={50} priority />
//         </Link>
//       </div>

//       <div className={styles.menuToggle} onClick={toggleMenu}>
//         ☰
//       </div>
//       <div className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
//         {isSignedIn ? (
//           <>
//             <>
//               <Link href="/my-bookings">
//                 <div className="btn">Mes réservations</div>
//               </Link>
//               <Link href="/dashboard">
//                 <div className="btn">Dashboard</div>
//               </Link>

//               <Link href="/admin/services">
//                 <div className="btn">Mes Services</div>
//               </Link>
//               <Link href="/admin">
//                 <div className="btn">ADMIN</div>
//               </Link>
//             </>
//             <UserButton />
//           </>
//         ) : (
//           <>
//             <Link href="/sign-in">Se connecter</Link>
//             <Link href="/sign-up">S&apos;inscrire</Link>
//           </>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import styles from "./styles.module.scss";
// import { UserButton, useUser } from "@clerk/nextjs";
// import { addUserToDatabase } from "@/actions/actions";

// const Navbar: React.FC = () => {
//   const { isLoaded, isSignedIn, user } = useUser();
//   const [menuOpen, setMenuOpen] = useState(false);

//   useEffect(() => {
//     if (user?.id && user.primaryEmailAddress?.emailAddress && user.firstName) {
//       addUserToDatabase(
//         user.primaryEmailAddress.emailAddress,
//         user.firstName,
//         user.imageUrl || "", // Ajout de l'image ici
//         user.id
//       );
//     }
//   }, [user]);

//   const toggleMenu = () => setMenuOpen(!menuOpen);

//   if (!isLoaded) return null;

//   return (
//     <nav className={styles.navbar}>
//       {/* Logo */}
//       <div className={styles.logo}>
//         <Link href="/">
//           <Image
//             src="/assets/logo/logo-full.png" // Assure-toi que le fichier est bien dans /public/assets/
//             alt="Logo"
//             width={150}
//             height={50}
//             priority
//           />
//         </Link>
//       </div>

//       {/* Menu Toggle pour mobile */}
//       <div className={styles.menuToggle} onClick={toggleMenu}>
//         ☰
//       </div>

//       {/* Liens de navigation */}
//       <div className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
//         {isSignedIn ? (
//           <>
//             <Link href="/my-bookings">Mes réservations</Link>
//             <Link href="/dashboard">Dashboard</Link>
//             <Link href="/admin/services">Mes Services</Link>
//             <Link href="/admin">ADMIN</Link>
//             <UserButton />
//           </>
//         ) : (
//           <div className={styles.authLinks}>
//             <Link href="/sign-in">Se connecter</Link>
//             <Link href="/sign-up">S&apos;inscrire</Link>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
// Styles
import styles from "./styles.module.scss";
import { UserButton, useUser } from "@clerk/nextjs";
import { addUserToDatabase, getRole } from "@/actions/actions";
import { getUserBookings, generateBookingToken } from "@/actions/bookings"; // Ajoute ces fonctions

const Navbar: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // ✅ Ajout de isClient
  // const { user, isSignedIn } = useUser();
  const [bookingToken, setBookingToken] = useState<string | null>(null);

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

  useEffect(() => {
    // Écoute du scroll pour changer l'état de la navbar
    const handleScroll = () => {
      if (window.scrollY > 50) {
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
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <Link href="/">
          <Image
            src="/assets/logo/logo-full.png"
            alt="Logo"
            width={250}
            height={150}
            priority
          />
        </Link>
      </div>

      {/* Menu Toggle pour mobile */}
      <div className={styles.menuToggle} onClick={toggleMenu}>
        ☰
      </div>

      {/* Liens de navigation */}
      <div className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
        {isSignedIn ? (
          <>
            {isSignedIn && (
              <Link href="/my-bookings" className="nav-link">
                Mes réservations
              </Link>
            )}

            <Link href="/dashboard">Dashboard</Link>
            {bookingToken && (
              <Link
                href={`/manage-booking?token=${bookingToken}`}
                className="nav-link"
              >
                Ma réservation
              </Link>
            )}

            {/* Affichage conditionnel pour les utilisateurs avec le rôle admin */}
            {userRole === "admin" && (
              <Link href="/admin/services">Mes Services</Link>
            )}
            {userRole === "admin" && <Link href="/admin">ADMIN</Link>}
            <UserButton />
          </>
        ) : (
          <div className={styles.authLinks}>
            <Link href="/sign-in">Se connecter</Link>
            <Link href="/sign-up">S&apos;inscrire</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
