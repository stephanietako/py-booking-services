// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import styles from "./styles.module.scss";
// import { UserButton, useUser } from "@clerk/nextjs";
// import { getRole } from "@/actions/actions";
// import { getUserBookings } from "@/actions/bookings";
// import logo from "@/public/assets/logo/logo-new.png";

// const Navbar: React.FC = () => {
//   const { isLoaded, isSignedIn, user } = useUser();
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [userRole, setUserRole] = useState<string | null>(null);
//   const [isClient, setIsClient] = useState(false);
//   const [hasBooking, setHasBooking] = useState(false);
//   const navbarElement = useRef<HTMLDivElement>(null);
//   const navigationHeight = useRef(0);
//   const hasSyncedUserRef = useRef(false);

//   useEffect(() => {
//     if (navbarElement.current) {
//       navigationHeight.current = navbarElement.current.offsetHeight;
//       navbarElement.current.style.setProperty(
//         "--scroll-padding",
//         navigationHeight.current.toString()
//       );
//     }
//   }, []);

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 400);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   useEffect(() => {
//     if (!user || !isSignedIn || hasSyncedUserRef.current) return;

//     const syncUser = async () => {
//       try {
//         const res = await fetch("/api/add-user", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             email: user.emailAddresses[0]?.emailAddress || "",
//             name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
//             image: user.imageUrl || "",
//             clerkUserId: user.id,
//             phoneNumber: user.phoneNumbers?.[0]?.phoneNumber || "",
//           }),
//         });

//         if (res.status === 409) {
//           console.log("L'utilisateur existe déjà.");
//           hasSyncedUserRef.current = true; // on considère que le user est déjà syncé, donc stop les appels répétés
//           return;
//         }

//         const data = await res.json();

//         if (res.ok) {
//           console.log("Utilisateur ajouté côté serveur:", data.user);
//           hasSyncedUserRef.current = true;
//         } else {
//           console.error("Erreur API:", data.error);
//         }
//       } catch (err) {
//         console.error("Erreur fetch API:", err);
//       }
//     };

//     syncUser();
//   }, [user, isSignedIn]);

//   useEffect(() => {
//     const fetchBookings = async () => {
//       if (!user || !isSignedIn) return setHasBooking(false);
//       try {
//         const bookings = await getUserBookings(user.id);
//         setHasBooking(bookings && bookings.length > 0);
//       } catch (err) {
//         console.error("Erreur de récupération des réservations :", err);
//         setHasBooking(false);
//       }
//     };
//     fetchBookings();
//   }, [user, isSignedIn]);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   useEffect(() => {
//     const fetchUserRole = async () => {
//       if (user?.id) {
//         const role = await getRole(user.id);
//         setUserRole(role?.name || null);
//       }
//     };
//     if (user?.id) fetchUserRole();
//   }, [user]);

//   const toggleMenu = () => setMenuOpen(!menuOpen);

//   if (!isClient || !isLoaded) return null;

//   return (
//     <nav
//       ref={navbarElement}
//       className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}
//     >
//       <div className={styles.logo_image}>
//         <Link href="/">
//           <Image
//             src={logo}
//             alt="Yachting Day location de bateau Cap Camarat 12.5 WA"
//             className={styles.logo}
//             width={200}
//             height={150}
//             priority
//             style={{
//               objectFit: "cover",
//               width: "100%",
//               height: "100%",
//               cursor: "pointer",
//             }}
//           />
//         </Link>
//       </div>

//       {/* Liens desktop haut de page */}
//       <div className={styles.primaryLinks}>
//         <Link href="/location" className={styles.navButton}>
//           Location <span className="shimmer" />
//         </Link>
//         <Link href="/entretien" className={styles.navButton}>
//           Entretien <span className="shimmer" />
//         </Link>
//         <Link href="#footer" className={styles.navButton}>
//           Contact <span className="shimmer" />
//         </Link>
//       </div>

//       {/* Toggle burger menu */}
//       <div className={styles.menuToggle} onClick={toggleMenu}>
//         {menuOpen ? "✕" : "☰"}
//       </div>

//       {menuOpen && <div className={styles.overlay} onClick={toggleMenu} />}

//       <div className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
//         {/* Mobile dropdown: Location avec sous-menu */}
//         <div className={styles.mobileOnlyLinks}>
//           <details className={styles.mobileDropdown}>
//             <summary>
//               <Link href="/location" onClick={toggleMenu}>
//                 Location
//               </Link>
//             </summary>
//             <div className={styles.dropdownLinks}>
//               <Link href="/boat" onClick={toggleMenu}>
//                 Le bateau
//               </Link>
//               <Link href="/environs" onClick={toggleMenu}>
//                 Les environs
//               </Link>
//               <Link href="/excursions" onClick={toggleMenu}>
//                 Nos excursions
//               </Link>
//             </div>
//           </details>
//         </div>

//         {/* Liens publics visibles tout le temps */}
//         <div className={styles.publicLinks}>
//           <Link href="/" onClick={toggleMenu}>
//             Accueil
//           </Link>
//           <Link
//             href="/about"
//             onClick={toggleMenu}
//             className={styles.buttonHero}
//           >
//             Qui sommes-nous
//           </Link>
//           <Link
//             href="/galerie"
//             onClick={toggleMenu}
//             className={styles.buttonHero}
//           >
//             Galerie
//           </Link>
//           <Link href="#footer" onClick={toggleMenu}>
//             Contact
//           </Link>
//         </div>

//         {/* Liens selon connexion */}
//         {isSignedIn ? (
//           <>
//             <Link href="/users/dashboard/profile" onClick={toggleMenu}>
//               Tableau de bord
//             </Link>
//             {hasBooking && (
//               <Link href="/dashboard/my-bookings" onClick={toggleMenu}>
//                 Mes réservations
//               </Link>
//             )}

//             {/* MENU ADMIN */}
//             {userRole === "admin" && (
//               <details className={styles.mobileDropdown}>
//                 <summary>Admin</summary>
//                 <div className={styles.dropdownLinks}>
//                   <Link href="/admin/dashboard" onClick={toggleMenu}>
//                     Dashboard
//                   </Link>
//                   <Link href="/admin/dashboard/bookings" onClick={toggleMenu}>
//                     Réservations
//                   </Link>
//                   <Link href="/admin/dashboard/opening" onClick={toggleMenu}>
//                     Ouverture
//                   </Link>
//                 </div>
//               </details>
//             )}

//             <UserButton />
//           </>
//         ) : (
//           <div className={styles.authLinks}>
//             <Link href="/sign-in" onClick={toggleMenu}>
//               Se connecter
//             </Link>
//             <Link href="/sign-up" onClick={toggleMenu}>
//               S’inscrire
//             </Link>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import styles from "./styles.module.scss";
// import { UserButton, useUser } from "@clerk/nextjs";
// import { getRole } from "@/actions/actions";
// import { getUserBookings } from "@/actions/bookings";
// import logo from "@/public/assets/logo/logo-new.png";

// const Navbar: React.FC = () => {
//   const { isLoaded, isSignedIn, user } = useUser();
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [userRole, setUserRole] = useState<string | null>(null);
//   const [isClient, setIsClient] = useState(false);
//   const [hasBooking, setHasBooking] = useState(false);
//   const navbarElement = useRef<HTMLDivElement>(null);
//   const navigationHeight = useRef(0);
//   //const hasSyncedUserRef = useRef(false);
//   //const syncInProgressRef = useRef(false); // ✅ Nouveau: éviter les requêtes simultanées

//   useEffect(() => {
//     if (navbarElement.current) {
//       navigationHeight.current = navbarElement.current.offsetHeight;
//       navbarElement.current.style.setProperty(
//         "--scroll-padding",
//         navigationHeight.current.toString()
//       );
//     }
//   }, []);

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 400);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const hasSyncedUserSession = new Set<string>(); // mémoire RAM (non-persistée)

//   useEffect(() => {
//     if (!isLoaded || !user || !isSignedIn) return;

//     const syncUser = async () => {
//       const userId = user.id;
//       const syncKey = `user-synced-${userId}`;

//       // 🔐 Attente pour laisser le temps à localStorage de se stabiliser (utile après sign-in)
//       await new Promise((r) => setTimeout(r, 100));

//       if (localStorage.getItem(syncKey) === "true") {
//         console.log("🛑 localStorage dit déjà synchronisé");
//         return;
//       }

//       if (hasSyncedUserSession.has(userId)) {
//         console.log("🧠 utilisateur déjà synchronisé en RAM");
//         return;
//       }

//       try {
//         console.log("🔄 Lancement de la synchronisation utilisateur...");
//         const res = await fetch("/api/add-user", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             email: user.emailAddresses[0]?.emailAddress || "",
//             name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
//             image: user.imageUrl || "",
//             clerkUserId: user.id,
//             phoneNumber: user.phoneNumbers?.[0]?.phoneNumber || "",
//           }),
//         });

//         if (res.ok) {
//           console.log("✅ Utilisateur synchronisé !");
//           localStorage.setItem(syncKey, "true");
//           hasSyncedUserSession.add(userId); // 🔐 verrou en mémoire
//         } else {
//           console.warn("⚠️ Erreur API:", res.status);
//         }
//       } catch (err) {
//         console.error("❌ Échec de synchronisation:", err);
//       }
//     };

//     syncUser();
//   }, [isLoaded, user, isSignedIn]);

//   useEffect(() => {
//     const fetchBookings = async () => {
//       if (!user || !isSignedIn) return setHasBooking(false);
//       try {
//         const bookings = await getUserBookings(user.id);
//         setHasBooking(bookings && bookings.length > 0);
//       } catch (err) {
//         console.error("Erreur de récupération des réservations :", err);
//         setHasBooking(false);
//       }
//     };
//     fetchBookings();
//   }, [user, isSignedIn]);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   useEffect(() => {
//     const fetchUserRole = async () => {
//       if (user?.id) {
//         const role = await getRole(user.id);
//         setUserRole(role?.name || null);
//       }
//     };
//     if (user?.id) fetchUserRole();
//   }, [user]);

//   const toggleMenu = () => setMenuOpen(!menuOpen);

//   if (!isClient || !isLoaded) return null;

//   return (
//     <nav
//       ref={navbarElement}
//       className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}
//     >
//       <div className={styles.logo_image}>
//         <Link href="/">
//           <Image
//             src={logo}
//             alt="Yachting Day location de bateau Cap Camarat 12.5 WA"
//             className={styles.logo}
//             width={200}
//             height={150}
//             priority
//             style={{
//               objectFit: "cover",
//               width: "100%",
//               height: "100%",
//               cursor: "pointer",
//             }}
//           />
//         </Link>
//       </div>

//       {/* Liens desktop haut de page */}
//       <div className={styles.primaryLinks}>
//         <Link href="/location" className={styles.navButton}>
//           Location <span className="shimmer" />
//         </Link>
//         <Link href="/entretien" className={styles.navButton}>
//           Entretien <span className="shimmer" />
//         </Link>
//         <Link href="#footer" className={styles.navButton}>
//           Contact <span className="shimmer" />
//         </Link>
//       </div>

//       {/* Toggle burger menu */}
//       <div className={styles.menuToggle} onClick={toggleMenu}>
//         {menuOpen ? "✕" : "☰"}
//       </div>

//       {menuOpen && <div className={styles.overlay} onClick={toggleMenu} />}

//       <div className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
//         {/* Mobile dropdown: Location avec sous-menu */}
//         <div className={styles.mobileOnlyLinks}>
//           <details className={styles.mobileDropdown}>
//             <summary>
//               <Link href="/location" onClick={toggleMenu}>
//                 Location
//               </Link>
//             </summary>
//             <div className={styles.dropdownLinks}>
//               <Link href="/boat" onClick={toggleMenu}>
//                 Le bateau
//               </Link>
//               <Link href="/environs" onClick={toggleMenu}>
//                 Les environs
//               </Link>
//               <Link href="/excursions" onClick={toggleMenu}>
//                 Nos excursions
//               </Link>
//             </div>
//           </details>
//         </div>

//         {/* Liens publics visibles tout le temps */}
//         <div className={styles.publicLinks}>
//           <Link href="/" onClick={toggleMenu}>
//             Accueil
//           </Link>
//           <Link
//             href="/about"
//             onClick={toggleMenu}
//             className={styles.buttonHero}
//           >
//             Qui sommes-nous
//           </Link>
//           <Link
//             href="/galerie"
//             onClick={toggleMenu}
//             className={styles.buttonHero}
//           >
//             Galerie
//           </Link>
//           <Link href="#footer" onClick={toggleMenu}>
//             Contact
//           </Link>
//         </div>

//         {/* Liens selon connexion */}
//         {isSignedIn ? (
//           <>
//             <Link href="/users/dashboard/profile" onClick={toggleMenu}>
//               Tableau de bord
//             </Link>
//             {hasBooking && (
//               <Link href="/dashboard/my-bookings" onClick={toggleMenu}>
//                 Mes réservations
//               </Link>
//             )}

//             {/* MENU ADMIN */}
//             {userRole === "admin" && (
//               <details className={styles.mobileDropdown}>
//                 <summary>Admin</summary>
//                 <div className={styles.dropdownLinks}>
//                   <Link href="/admin/dashboard" onClick={toggleMenu}>
//                     Dashboard
//                   </Link>
//                   <Link href="/admin/dashboard/bookings" onClick={toggleMenu}>
//                     Réservations
//                   </Link>
//                   <Link href="/admin/dashboard/opening" onClick={toggleMenu}>
//                     Ouverture
//                   </Link>
//                 </div>
//               </details>
//             )}

//             <UserButton />
//           </>
//         ) : (
//           <div className={styles.authLinks}>
//             <Link href="/sign-in" onClick={toggleMenu}>
//               Se connecter
//             </Link>
//             <Link href="/sign-up" onClick={toggleMenu}>
//               S&apos;inscrire
//             </Link>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./styles.module.scss";
import { UserButton, useUser } from "@clerk/nextjs";
import { getRole } from "@/actions/actions";
import { getUserBookings } from "@/actions/bookings";
import logo from "@/public/assets/logo/logo-new.png";

const Navbar: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [hasBooking, setHasBooking] = useState(false);
  const navbarElement = useRef<HTMLDivElement>(null);
  const navigationHeight = useRef(0);

  useEffect(() => {
    if (navbarElement.current) {
      navigationHeight.current = navbarElement.current.offsetHeight;
      navbarElement.current.style.setProperty(
        "--scroll-padding",
        navigationHeight.current.toString()
      );
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || !isSignedIn) return setHasBooking(false);
      try {
        const bookings = await getUserBookings(user.id);
        setHasBooking(bookings && bookings.length > 0);
      } catch (err) {
        console.error("Erreur de récupération des réservations :", err);
        setHasBooking(false);
      }
    };
    fetchBookings();
  }, [user, isSignedIn]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user?.id) {
        const role = await getRole(user.id);
        setUserRole(role?.name || null);
      }
    };
    if (user?.id) fetchUserRole();
  }, [user]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  if (!isClient || !isLoaded) return null;

  return (
    <nav
      ref={navbarElement}
      className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}
    >
      <div className={styles.logo_image}>
        <Link href="/">
          <Image
            src={logo}
            alt="Yachting Day location de bateau Cap Camarat 12.5 WA"
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

      {/* Liens desktop haut de page */}
      <div className={styles.primaryLinks}>
        <Link href="/location" className={styles.navButton}>
          Location <span className="shimmer" />
        </Link>
        <Link href="/entretien" className={styles.navButton}>
          Entretien <span className="shimmer" />
        </Link>
        <Link href="#footer" className={styles.navButton}>
          Contact <span className="shimmer" />
        </Link>
      </div>

      {/* Toggle burger menu */}
      <div className={styles.menuToggle} onClick={toggleMenu}>
        {menuOpen ? "✕" : "☰"}
      </div>

      {menuOpen && <div className={styles.overlay} onClick={toggleMenu} />}

      <div className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
        {/* Mobile dropdown: Location avec sous-menu */}
        <div className={styles.mobileOnlyLinks}>
          <details className={styles.mobileDropdown}>
            <summary>
              <Link href="/location" onClick={toggleMenu}>
                Location
              </Link>
            </summary>
            <div className={styles.dropdownLinks}>
              <Link href="/boat" onClick={toggleMenu}>
                Le bateau
              </Link>
              <Link href="/environs" onClick={toggleMenu}>
                Les environs
              </Link>
              <Link href="/excursions" onClick={toggleMenu}>
                Nos excursions
              </Link>
            </div>
          </details>
        </div>

        {/* Liens publics visibles tout le temps */}
        <div className={styles.publicLinks}>
          <Link href="/" onClick={toggleMenu}>
            Accueil
          </Link>
          <Link
            href="/about"
            onClick={toggleMenu}
            className={styles.buttonHero}
          >
            Qui sommes-nous
          </Link>
          <Link
            href="/galerie"
            onClick={toggleMenu}
            className={styles.buttonHero}
          >
            Galerie
          </Link>
          <Link href="#footer" onClick={toggleMenu}>
            Contact
          </Link>
        </div>

        {/* Liens selon connexion */}
        {isSignedIn ? (
          <>
            <Link href="/users/dashboard/profile" onClick={toggleMenu}>
              Tableau de bord
            </Link>
            {hasBooking && (
              <Link href="/dashboard/my-bookings" onClick={toggleMenu}>
                Mes réservations
              </Link>
            )}

            {/* MENU ADMIN */}
            {userRole === "admin" && (
              <details className={styles.mobileDropdown}>
                <summary>Admin</summary>
                <div className={styles.dropdownLinks}>
                  <Link href="/admin/dashboard" onClick={toggleMenu}>
                    Dashboard
                  </Link>
                  <Link href="/admin/dashboard/bookings" onClick={toggleMenu}>
                    Réservations
                  </Link>
                  <Link href="/admin/dashboard/opening" onClick={toggleMenu}>
                    Ouverture
                  </Link>
                </div>
              </details>
            )}

            <UserButton />
          </>
        ) : (
          <div className={styles.authLinks}>
            <Link href="/sign-in" onClick={toggleMenu}>
              Se connecter
            </Link>
            <Link href="/sign-up" onClick={toggleMenu}>
              S&apos;inscrire
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
