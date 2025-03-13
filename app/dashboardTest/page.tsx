// "use client";

// import {
//   getLastServices,
//   getReachedServices,
//   getTotalOptionAmount,
//   getTotalOptionCount,
// } from "@/actions/actions";
// import { useUser } from "@clerk/nextjs";
// import React, { useState, useEffect } from "react";
// import Wrapper from "../components/Wrapper/Wrapper";
// import { FaMoneyCheckAlt } from "react-icons/fa";
// import { MdOutlineDone } from "react-icons/md";
// import { FaSailboat } from "react-icons/fa6";
// import Link from "next/link";
// import ServiceItem from "../components/ServiceItem/ServiceItem";
// import { Service } from "@/types";

// const DashboardUserPage = () => {
//   const { user } = useUser();
//   const [totalAmount, setTotalAmount] = useState<number | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [totalCount, setTotalCount] = useState<number | null>(null);
//   const [reachedServicesRatio, setReachedServicesRatio] = useState<
//     string | null
//   >(null);
//   const [services, setService] = useState<Service[]>([]);
//   const [fetchError, setFetchError] = useState<string | null>(null);

//   // Ne pas exécuter fetchData tant que user est null
//   useEffect(() => {
//     if (!user) return;
//     fetchData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user]);

//   const fetchData = async () => {
//     setIsLoading(true);
//     try {
//       const userId = user?.id ?? "";

//       const [amount, count, reachedServices, lastServices] = await Promise.all([
//         getTotalOptionAmount(userId, "last30"),
//         getTotalOptionCount(userId, "last30"),
//         getReachedServices(userId),
//         getLastServices(userId),
//       ]);

//       setTotalAmount(amount);
//       setTotalCount(count);
//       setReachedServicesRatio(JSON.stringify(reachedServices));
//       setService(lastServices as unknown as Service[]);
//     } catch (error) {
//       console.error("❌ Erreur lors de la récupération des données:", error);
//       setFetchError("Impossible de récupérer les données.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // 🔥 Attendre que `user` soit défini avant d'afficher la page
//   if (!user) {
//     return (
//       <Wrapper>
//         <div className="loading">
//           <span>Chargement des données utilisateur...</span>
//         </div>
//       </Wrapper>
//     );
//   }

//   return (
//     <Wrapper>
//       {isLoading ? (
//         <div className="loading">
//           <span>Loading ...</span>
//         </div>
//       ) : fetchError ? (
//         <p style={{ color: "red" }}>{fetchError}</p>
//       ) : (
//         <div
//           className="dashboard_container"
//           style={{
//             marginTop: "2rem",
//             display: "flex",
//             flexDirection: "column",
//           }}
//         >
//           <h2>Options</h2>

//           <div
//             className="dashboard_container__box"
//             style={{ marginTop: "1rem", display: "flex", width: "20rem" }}
//           >
//             <div className="__box">
//               <span id="total_transactions">Total des options</span>
//               <span className="item" id="box_total_amount">
//                 {totalAmount != null ? `${totalAmount}€` : "Chargement..."}
//               </span>
//             </div>
//             <FaMoneyCheckAlt />
//           </div>

//           <div
//             className="dashboard_container__box"
//             style={{ marginTop: "1rem", display: "flex", width: "20rem" }}
//           >
//             <div className="__box">
//               <span id="total_transactions">Nombre de options</span>
//               <span className="item" id="total_transactions">
//                 {totalCount != null ? `${totalCount}` : "Chargement..."}
//               </span>
//             </div>
//             <MdOutlineDone />
//           </div>

//           <div
//             className="dashboard_container__box"
//             style={{ marginTop: "1rem", display: "flex", width: "20rem" }}
//           >
//             <div className="__box">
//               <span id="total_transactions">Services atteints</span>
//               <span className="item" id="box_total_amount">
//                 {reachedServicesRatio || "Chargement..."}
//               </span>
//             </div>
//             <FaSailboat />
//           </div>

//           <div className="last_services">
//             <h3 className="last_services__container">Derniers services</h3>
//             <ul className="last_services__box">
//               {services.map((service) => (
//                 <Link href={`/manage/${service.id}`} key={service.id}>
//                   <ServiceItem service={service} enableHover={1} />
//                 </Link>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </Wrapper>
//   );
// };

// export default DashboardUserPage;
