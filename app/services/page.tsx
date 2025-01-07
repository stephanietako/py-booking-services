// "use client";

// import { useUser } from "@clerk/nextjs";
// import Wrapper from "../components/Wrapper/Wrapper";
// import { useEffect, useState } from "react";
// import Modal from "../components/Modal/Modal";
// import { addService, getServicesByUser } from "@/actions/actions";
// import { Service } from "@/type";
// import Link from "next/link";
// import ServiceItem from "../components/ServiceItem/ServiceItem";
// // Styles
// import styles from "./styles.module.scss";

// const ServicesPage = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const openModal = () => setIsModalOpen(true);
//   const closeModal = () => setIsModalOpen(false);
//   // D'abord on recupérer toutesles infos dont on a besoin pour ajouter un nouveau service
//   const { user } = useUser();
//   const [selectedService, setSelectedService] = useState<string>("");
//   // Ça va contenir nos services (vide par defaut)
//   const [services, setServices] = useState<Service[]>([]);
//   ///////
//   const [loading, setLoading] = useState<boolean>(false);
//   ////////

//   const serviceOptions = [
//     {
//       name: "Découverte",
//       amount: 1200,
//       description: "Service de découverte",
//       imageUrl: "/assets/default.jpg",
//     },

//     {
//       name: "Simplicité",
//       amount: 1500,
//       description: "Service de simplicité",
//       imageUrl: "/assets/default.jpg",
//     },
//     {
//       name: "Prenium",
//       amount: 1800,
//       description: "Service premium",
//       imageUrl: "/assets/default.jpg",
//     },
//   ];

//   const handleAddService = async () => {
//     try {
//       const selected = serviceOptions.find(
//         (service) => service.name === selectedService
//       );
//       if (!selected) {
//         throw new Error("Veuillez sélectionner un service valide");
//       }

//       await addService(
//         user?.primaryEmailAddress?.emailAddress as string,
//         selected.name,
//         selected.amount,
//         selected.description
//       );
//       fetchServices();
//       // Fermer le modul quand l'ajout s'est bien passé
//       if (isModalOpen) {
//         closeModal();
//       }

//       setSelectedService("");
//       console.log("Nouveau service créé avec succès");
//     } catch (error) {
//       console.error("Erreur lors de l'ajout du service:", error);
//     }
//   };

//   // Fonction qui va nous permettre de récupérer les services
//   const fetchServices = async () => {
//     if (user?.primaryEmailAddress?.emailAddress) {
//       setLoading(true);
//       try {
//         const userServices = await getServicesByUser(
//           user?.primaryEmailAddress?.emailAddress
//         );
//         setServices(
//           userServices.map((service) => ({
//             ...service,
//             imageUrl: service.imageUrl,
//           }))
//         );
//         setLoading(false);
//       } catch (error) {
//         console.log("Erreur lors de la récupération des services", error);
//       }
//     }
//   };

//   useEffect(() => {
//     fetchServices();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.primaryEmailAddress?.emailAddress]);

//   return (
//     <Wrapper>
//       <div className={styles.container}>
//         <h1 className={styles.title}>ServicesPage dans services/pages</h1>
//         <button className={styles.btn_modal_service} onClick={openModal}>
//           Nouveau Service
//         </button>

//         <Modal
//           isOpen={isModalOpen}
//           onClose={closeModal}
//           title="Création d'un service"
//         >
//           <h3 className={styles.text_service__title}>
//             Création d&apos;un service
//           </h3>
//           <p className={styles.text_service}>
//             Permet de contrôler ses dépenses facilement
//           </p>
//           <div className={styles.service_input}>
//             <select
//               value={selectedService}
//               onChange={(e) => setSelectedService(e.target.value)}
//               className={styles.service_input_select}
//               required
//             >
//               <option value="" disabled>
//                 Sélectionnez un service
//               </option>
//               {serviceOptions.map((option) => (
//                 <option key={option.name} value={option.name}>
//                   {option.name} - {option.amount}€ ({option.description})
//                 </option>
//               ))}
//             </select>
//             <button
//               onClick={handleAddService}
//               className={styles.btn_handle_add_budget}
//             >
//               Ajouter service !!!!
//             </button>
//           </div>
//         </Modal>

//         <ul className={styles.list_services}>
//           {loading ? (
//             <div className="loading">Loading...</div>
//           ) : services.length === 0 ? (
//             <div>
//               <span>Aucune transaction à afficher</span>
//             </div>
//           ) : (
//             // Si des services sont disponibles, on les affiche dans une liste
//             services.map((service) => (
//               <Link key={service.id} href={`/manage/${service.id}`}>
//                 <ServiceItem service={service} enableHover={1}></ServiceItem>
//               </Link>
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
import { Service } from "@/type";
import { useUser } from "@clerk/nextjs";
import { getServicesByUser, addService } from "@/actions/actions";
import Modal from "../components/Modal/Modal";
import ServiceItem from "../components/ServiceItem/ServiceItem";
import styles from "./styles.module.scss";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import Link from "next/link";

const ServicesPage: React.FC = () => {
  const { user } = useUser();
  const [services, setServices] = useState<Service[]>([]); // Typage de l'état services
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>(""); // Typage de la sélection de service
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Ajout de la gestion des erreurs

  // Fonction de récupération des services
  const fetchServices = useCallback(async () => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setLoading(true);
      try {
        const userServices = await getServicesByUser(
          user.primaryEmailAddress.emailAddress
        );
        setServices(userServices);
      } catch (error) {
        console.log("Erreur lors de la récupération des services", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("Utilisateur non connecté ou email non disponible");
    }
  }, [user?.primaryEmailAddress?.emailAddress]);

  // Chargement des services lorsque l'email de l'utilisateur change
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Fonction pour ajouter un service
  const handleAddService = async () => {
    try {
      const selected = services.find(
        (service) => service.name === selectedService
      );
      if (!selected) {
        setErrorMessage("Veuillez sélectionner un service valide.");
        return;
      }

      await addService(
        user?.primaryEmailAddress?.emailAddress as string,
        selected.name,
        selected.amount,
        selected.description
      );
      fetchServices(); // Récupère de nouveau les services après l'ajout
      setSelectedService(""); // Réinitialiser la sélection
      setIsModalOpen(false); // Fermer le modal
      setErrorMessage(null); // Réinitialiser l'erreur
    } catch (error) {
      console.error("Erreur lors de l'ajout du service:", error);
      setErrorMessage("Une erreur s'est produite lors de l'ajout du service.");
    }
  };

  return (
    <Wrapper>
      <div className={styles.container}>
        <h1 className={styles.title}>ServicesPage dans services/pages</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className={styles.btn_modal_service}
        >
          Nouveau Service
        </button>

        {/* Modal pour ajouter un service */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Création d'un service"
        >
          <h3 className={styles.text_service__title}>Création du service</h3>
          <p className={styles.text_service}>
            Permet de contrôler ses dépenses facilement
          </p>

          {/* Sélection du service */}
          <div className={styles.service_input}>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className={styles.service_input_select}
              required
            >
              <option value="" disabled>
                Sélectionnez un service
              </option>
              {services.map((service) => (
                <option key={service.id} value={service.name}>
                  {service.name} - {service.amount}€ ({service.description})
                </option>
              ))}
            </select>
            {errorMessage && <p className="error">{errorMessage}</p>}{" "}
            {/* Affichage de l'erreur */}
            <button
              onClick={handleAddService}
              className={styles.btn_handle_add_budget}
            >
              Ajouter le service
            </button>
          </div>
        </Modal>

        {/* Afficher la liste des services */}
        <ul className={styles.list_services}>
          {loading ? (
            <div className="loading">Chargement...</div>
          ) : services.length === 0 ? (
            <div>Aucun service à afficher</div>
          ) : (
            services.map((service) => (
              <Link key={service.id} href={`/manage/${service.id}`}>
                <ServiceItem service={service} enableHover={1}></ServiceItem>
              </Link>
            ))
          )}
        </ul>
      </div>
    </Wrapper>
  );
};

export default ServicesPage;
