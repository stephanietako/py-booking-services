// Services.tsx
// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import { Service } from "@/types"; // Service importé de vos types
// import { getServicesByUser } from "@/actions/actions";
// import ServiceCompt from "../ServicesCompt/ServiceCompt";
// import styles from "./styles.module.scss";
// import { useUser } from "@clerk/nextjs";

// const Services: React.FC = () => {
//   const { user } = useUser();
//   const [services, setServices] = useState<Service[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   // Fonction pour récupérer les services de l'utilisateur
//   const fetchServices = useCallback(async () => {
//     if (user?.id) {
//       setLoading(true);
//       try {
//         const userServices = await getServicesByUser(user.id);

//         // Calcul de totalAmount dans le code sans modifier le schéma Prisma
//         const servicesWithTotalAmount = userServices.map((service) => {
//           // Calcul du totalAmount basé sur price, defaultPrice, ou amount
//           const totalAmount =
//             service.price || service.defaultPrice || service.amount || 0;

//           return {
//             ...service,
//             totalAmount, // Ajouter cette propriété au service
//             categories: service.categories ?? [],
//           };
//         });

//         setServices(servicesWithTotalAmount);
//       } catch (error) {
//         console.error("Erreur lors de la récupération des services:", error);
//         setError("Impossible de récupérer les services.");
//       } finally {
//         setLoading(false);
//       }
//     } else {
//       setError("Utilisateur non connecté ou ID non disponible.");
//     }
//   }, [user?.id]);

//   useEffect(() => {
//     fetchServices();
//   }, [fetchServices]);

//   if (loading) return <div>Chargement...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div className={styles.services_container}>
//       {services.length === 0 ? (
//         <div>Aucun service disponible</div>
//       ) : (
//         services.map((service) => (
//           <ServiceCompt
//             key={service.id}
//             name={service.name}
//             description={service.description || ""}
//             imageUrl={service.imageUrl || "/assets/default.jpg"}
//             categories={service.categories}
//             startTime={service.startTime}
//             endTime={service.endTime}
//             options={service.options || []}
//             totalAmount={service.totalAmount} // Vous passez totalAmount comme prop ici
//           />
//         ))
//       )}
//     </div>
//   );
// };

// export default Services;
// "use client";

// import React from "react";
// import { Service } from "@/types";
// import ServiceCompt from "../ServicesCompt/ServiceCompt";
// import styles from "./styles.module.scss";

// interface ServicesProps {
//   services: Service[]; // La liste des services est passée en prop
// }

// const Services: React.FC<ServicesProps> = ({ services }) => {
//   return (
//     <div className={styles.services_container}>
//       {services.length === 0 ? (
//         <div>Aucun service disponible</div>
//       ) : (
//         services.map((service) => (
//           <ServiceCompt
//             key={service.id}
//             name={service.name}
//             description={service.description || ""}
//             imageUrl={service.imageUrl || "/assets/default.jpg"}
//             categories={service.categories}
//             startTime={service.startTime}
//             endTime={service.endTime}
//             options={service.options || []}
//             totalAmount={service.totalAmount} // Vous passez totalAmount comme prop ici
//           />
//         ))
//       )}
//     </div>
//   );
// };

// export default Services;
