"use client";
import { useState, useEffect } from "react";
import Calendar from "./components/Calendar/Calendar";
import Image from "next/image";
import styles from "./page.module.css";
import Navbar from "./components/Navbar/Navbar";
import ServiceItem from "./components/ServiceItem/ServiceItem";
import { Service } from "@/type"; // Assure-toi d'utiliser le bon type Service
import Link from "next/link";
import { DateTime } from "@/type";
import Spinner from "./components/Spinner/Spinner";
import { getAllServices } from "@/actions/actions";

export default function Home() {
  // Correction du typage des services en utilisant Service et non ServiceType
  const [services, setServices] = useState<Service[]>([]);
  const [date, setDate] = useState<DateTime>({
    justDate: null,
    dateTime: null,
  });
  const [error, setError] = useState<string>(""); // Affichage des erreurs
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Récupération des services au chargement
  useEffect(() => {
    const fetchAllServices = async () => {
      setIsLoading(true); // On met le loading à true avant la récupération des services
      try {
        const data = await getAllServices();
        setServices(data);
      } catch (error) {
        console.error("Erreur lors du chargement des services:", error);
        setError("Impossible de charger les services.");
      } finally {
        setIsLoading(false); // On arrête le loading
      }
    };
    fetchAllServices();
  }, []);

  // Pour gérer le rendu côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

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
          <div>
            <h2>SÉLÉCTIONNEZ UNE DATE</h2>
            {/* Affichage conditionnel du Calendrier si la date n'est pas définie */}
            {isClient && !date.dateTime && (
              <Calendar setDate={setDate} date={date} />
            )}

            {/* Si la date est définie et qu'on n'est pas en train de charger */}
            {isClient && date.dateTime && !isLoading ? (
              <ul className={styles.list_services}>
                {services.map((service) => (
                  <Link key={service.id} href={`/manage/${service.id}`}>
                    <ServiceItem
                      service={service}
                      enableHover={1}
                    ></ServiceItem>
                  </Link>
                ))}
              </ul>
            ) : isLoading ? (
              <div className="spinner_container">
                <Spinner /> {/* Affichage du spinner pendant le chargement */}
              </div>
            ) : (
              <div>Veuillez sélectionner une date pour voir les services</div>
            )}
          </div>
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
}

// "use client";
// import { useState } from "react";
// import Calendar from "./components/Calendar/Calendar";

// import Image from "next/image";
// //import { currentUser } from "@clerk/nextjs/server";
// import Services from "./components/Services/Services";
// import styles from "./page.module.css";
// import Navbar from "./components/Navbar/Navbar";
// import ServiceItem from "./components/ServiceItem/ServiceItem";
// import services from "./data";
// import Link from "next/link";
// import { DateTime } from "@/type";
// import Spinner from "./components/Spinner/Spinner";

// export default function Home() {
//   const [date, setDate] = useState<DateTime>({
//     justDate: null,
//     dateTime: null,
//   });

//   return (
//     <>
//       <Navbar />
//       <div className={styles.page}>
//         <main className={styles.main}>
//           <h1>HELLO WORLD BOOKING APP</h1>
//           <h2>Starting project</h2>
//           <br />
//           <ul className={styles.list_services}>
//             {services.map((service) => (
//               <Link key={service.id} href={`/manage/${service.id}`}>
//                 <ServiceItem service={service} enableHover={1}></ServiceItem>
//               </Link>
//             ))}
//           </ul>
//           <br />
//           <div>
//             {!date.dateTime && <Calendar setDate={setDate} date={date} />}
//             {date.dateTime && false ? (
//               <Services />
//             ) : (
//               <div className="spinner_container">
//                 <Spinner />
//               </div>
//             )}
//           </div>
//         </main>

//         {/* FOOTER */}
//         <footer className={styles.footer}>
//           <a
//             href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               aria-hidden
//               src="/file.svg"
//               alt="File icon"
//               width={16}
//               height={16}
//             />
//             Learn
//           </a>
//           <a
//             href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               aria-hidden
//               src="/window.svg"
//               alt="Window icon"
//               width={16}
//               height={16}
//             />
//             Examples
//           </a>
//           <a
//             href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               aria-hidden
//               src="/globe.svg"
//               alt="Globe icon"
//               width={16}
//               height={16}
//             />
//             Go to nextjs.org →
//           </a>
//         </footer>
//       </div>
//     </>
//   );
// }

// import Image from "next/image";
// import { currentUser } from "@clerk/nextjs/server";
// import Services from "./components/Services/Services";
// import styles from "./page.module.css";
// import Navbar from "./components/Navbar/Navbar";

// export default async function Home() {
//   const user = await currentUser();
//   const firstName = user?.firstName;
//   const id = user?.id;

//   const welcomeSuffix = firstName ? `, ${firstName} ${id}` : ``;
//   return (
//     <>
//       <Navbar />
//       <div className={styles.page}>
//         <main className={styles.main}>
//           <h1>HELLO WORLD BOOKING APP</h1>
//           <h2>Starting project</h2>
//           <br />
//           <div>Welcome {welcomeSuffix}</div>
//           <br />
//           <div>
//             <h1>Nos Services</h1>
//             <Services />
//           </div>
//         </main>
//       </div>
//     </>
//   );
// }
