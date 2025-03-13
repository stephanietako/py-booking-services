// "use client";

// import {
//   getLastServices,
//   getReachedServices,
//   getTotalOptionAmount,
//   getTotalOptionCount,
// } from "@/actions/actions";
// import { useUser } from "@clerk/nextjs";
// import React, { useState, useEffect } from "react";
// import { FaMoneyCheckAlt } from "react-icons/fa";
// import { MdOutlineDone } from "react-icons/md";
// import { FaSailboat } from "react-icons/fa6";
// import Link from "next/link";
// import ServiceItem from "../ServiceItem/ServiceItem";
// import { Service } from "@/types";
// // Styles
// import styles from "./styles.module.scss";

// const DashboardUser = () => {
//   const { user } = useUser();
//   const [totalAmount, setTotalAmount] = useState<number | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [totalCount, setTotalCount] = useState<number | null>(null);
//   const [reachedServicesRatio, setReachedServicesRatio] = useState<
//     string | null
//   >(null);
//   const [services, setService] = useState<Service[]>([]);
//   const [fetchError, setFetchError] = useState<string | null>(null);

//   const fetchData = async () => {
//     setIsLoading(true);
//     try {
//       const userId = user?.id as string; // Utilisation de user.id ici
//       if (userId) {
//         const amount = await getTotalOptionAmount(userId, "last30"); // Passage du bon identifiant
//         const count = await getTotalOptionCount(userId, "last30");
//         const reachedServices = await getReachedServices(userId);
//         const lastServices = await getLastServices(userId);
//         setTotalAmount(amount);
//         setTotalCount(count);
//         setReachedServicesRatio(JSON.stringify(reachedServices));
//         setService(lastServices);
//         setIsLoading(false);
//       }
//     } catch (error) {
//       console.error("Erreur lors de la récupération des données", error);
//       setFetchError("Impossible de récupérer les données.");
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user]);

//   return (
//     <section>
//       {isLoading ? (
//         <div className="loading">
//           <span>Loading ...</span>
//         </div>
//       ) : fetchError ? (
//         <p style={{ color: "red" }}>{fetchError}</p>
//       ) : (
//         <div className={styles.dashboard_container}>
//           <h2>Options !!!</h2>

//           <div className={styles.dashboard_container__box}>
//             <div className={styles.__box}>
//               <span id="total_transactions">Total des options</span>
//               <span className={styles.item} id={styles.box_total_amount}>
//                 {totalAmount != null ? `${totalAmount}€` : "N/A"}
//               </span>
//             </div>
//             <FaMoneyCheckAlt />
//           </div>

//           <div className={styles.dashboard_container__box}>
//             <div className={styles.__box}>
//               <span id={styles.total_transactions}>Nombre de Options</span>
//               <span className={styles.item} id={styles.total_transactions}>
//                 {totalCount != null ? `${totalCount}` : "N/A"}
//               </span>
//             </div>
//             <MdOutlineDone />
//           </div>

//           <div className={styles.dashboard_container__box}>
//             <div className={styles.__box}>
//               <span id={styles.total_transactions}>Services atteints</span>
//               <span className={styles.item} id={styles.box_total_amount}>
//                 {reachedServicesRatio || "N/A"}
//               </span>
//             </div>
//             <FaSailboat />
//           </div>

//           <div className={styles.last_services}>
//             <h3 className={styles.last_services__container}>
//               Derniers services
//             </h3>
//             <ul className={styles.last_services__box}>
//               {services.map((service) => (
//                 <Link href={`/manage/${service.id}`} key={service.id}>
//                   <ServiceItem service={service} enableHover={1}></ServiceItem>
//                 </Link>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// };

// export default DashboardUser;
