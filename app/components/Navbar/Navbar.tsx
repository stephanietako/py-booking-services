// "use client";
// import React, { useEffect, useState } from "react";
// import Link from "next/link";
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
//         <Link href="/">Logo</Link>
//       </div>
//       <div className={styles.menuToggle} onClick={toggleMenu}>
//         ☰
//       </div>
//       <div className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
//         {isSignedIn ? (
//           <>
//             <Link href="/dashboardPage">
//               <div className="btn">Dashboard Page</div>
//             </Link>
//             <Link href="/services">
//               <div className="btn">Mes Services</div>
//             </Link>
//             <Link href="/accountUser">
//               <div className="btn">Compte utilisateur</div>
//             </Link>
//             {/* <Link href="/accountUser/transactions">
//               <div className="btn">Transactions</div>
//             </Link> */}
//             <Link href="/dashboard">
//               <div className="btn">Dashboard</div>
//             </Link>
//             <Link href="/admin">
//               <div className="btn">ADMIN</div>
//             </Link>

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
// import dynamic from "next/dynamic"; // Import dynamique pour désactiver le SSR
// import styles from "./styles.module.scss";
// import { useUser } from "@clerk/nextjs";
// import { addUserToDatabase } from "@/actions/actions";

// // Désactiver le SSR pour UserButton pour éviter des erreurs d'hydratation
// const UserButton = dynamic(
//   () => import("@clerk/nextjs").then((mod) => mod.UserButton),
//   { ssr: false }
// );

// const Navbar: React.FC = () => {
//   const { isLoaded, isSignedIn, user } = useUser();
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [isClient, setIsClient] = useState(false); // Empêcher le SSR

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

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

//   if (!isLoaded || !isClient) return null; // Empêcher le rendu SSR

//   return (
//     <nav className={styles.navbar}>
//       <div className={styles.logo}>
//         <Link href="/">Logo</Link>
//       </div>
//       <div className={styles.menuToggle} onClick={toggleMenu}>
//         ☰
//       </div>
//       <div className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
//         {isSignedIn ? (
//           <>
//             {/* <Link href="/dashboardPage">
//               <div className="btn">Dashboard Page</div>
//             </Link> */}

//             <Link href="/services">
//               <div className="btn">Mes Services</div>
//             </Link>
//             <Link href="/dashboardUser">
//               <div className="btn">DashboardUser</div>
//             </Link>
//             {/* //transactions par periodes et par utilisateur */}
//             <Link href="/transactions">
//               <div className="btn">Mes Transactions</div>
//             </Link>
//             {/* c'est le tableau de bord */}
//             <Link href="/dashboardAccount">
//               <div className="btn">Dashboard Account</div>
//             </Link>
//             {/* c'est le tableau de bord admin gestion horaires jours et creations et modifications des services  */}
//             <Link href="/admin">
//               <div className="btn">ADMIN</div>
//             </Link>
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
              <div className="btn">Mon Tableau de bord</div>
            </Link>
            <>
              <Link href="/transactions">
                <div className="btn">Mes Transactions</div>
              </Link>
              <Link href="/dashboardAdmin">
                <div className="btn">DashboardADMIN</div>
              </Link>
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
