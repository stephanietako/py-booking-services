// "use client";

// import React, { useEffect, useState, useCallback } from "react";
// import { Service } from "@/types";
// import { getAllServices } from "@/actions/actions";
// import ServiceItem from "@/app/components/ServiceItem/ServiceItem";
// import styles from "./styles.module.scss";
// import Wrapper from "@/app/components/Wrapper/Wrapper";

// const ServicesPage: React.FC = () => {
//   //const { user } = useUser();
//   const [services, setServices] = useState<Service[]>([]);
//   // const [selectedService, setSelectedService] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const [error, setError] = useState<string>("");

//   const fetchServices = useCallback(async () => {
//     setLoading(true);
//     try {
//       const data = await getAllServices();
//       setServices(data);
//     } catch (error) {
//       console.error("Erreur lors du chargement des services:", error);
//       setError("Impossible de charger les services.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchServices();
//   }, [fetchServices]);

//   return (
//     <Wrapper>
//       <div className={styles.container}>
//         <h1 className={styles.title}>Page Administrateur Services</h1>
//         <h2>Vue D&apos;ensemble Des Services disponibles</h2>
//         <ul className={styles.list_services}>
//           {loading ? (
//             <div>Chargement...</div>
//           ) : services.length === 0 ? (
//             <div>Aucun service disponible</div>
//           ) : (
//             services.map((service) => (
//               <ServiceItem
//                 key={service.id}
//                 service={service}
//                 enableHover={1}
//               ></ServiceItem>
//             ))
//           )}
//         </ul>
//       </div>
//     </Wrapper>
//   );
// };

// export default ServicesPage;
"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Service } from "@/types";
import { getAllServices } from "@/actions/actions";
import Image from "next/image";
import styles from "./styles.module.scss";
import Wrapper from "@/app/components/Wrapper/Wrapper";

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(""); // Réinitialiser les erreurs au début de la requête
    try {
      const data = await getAllServices();
      setServices(data);
    } catch (error) {
      console.error("Erreur lors du chargement des services:", error);
      setError(
        "Impossible de charger les services. Veuillez réessayer plus tard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return (
    <Wrapper>
      <div className={styles.container}>
        <h1 className={styles.title}>Page Administrateur Services</h1>
        <h2>Vue D&apos;Ensemble Des Services Disponibles</h2>

        {loading ? (
          <div>Chargement...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : services.length === 0 ? (
          <div>Aucun service disponible pour le moment.</div>
        ) : (
          <table className={styles.servicesTable}>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Description</th>
                <th>Montant (€)</th>
                <th>Catégories</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>{service.name}</td>
                  <td>
                    {service.description || "Aucune description disponible"}
                  </td>
                  <td>{service.amount} €</td>
                  <td>
                    {service.categories.length > 0
                      ? service.categories.join(", ")
                      : "Pas de catégorie assignée"}
                  </td>
                  <td>
                    <Image
                      src={service.imageUrl || "/assets/default.jpg"}
                      alt={`Image du service ${service.name}`}
                      width={100}
                      height={100}
                      className={styles.serviceImage}
                      loading="lazy" // Ajout de lazy loading pour l'image
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Wrapper>
  );
};

export default ServicesPage;
