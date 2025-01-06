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

// // On va créer un formulaire d'ajout
// const ServicesPage = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const openModal = () => setIsModalOpen(true);
//   const closeModal = () => setIsModalOpen(false);
//   // D'abord on recupérer toutesles infos dont on a besoin pour ajouter un nouveau service
//   const { user } = useUser();
//   const [serviceName, setServiceName] = useState<string>("");
//   // Service amount c'est la somme qu'aura choisi l'utilisateur
//   const [serviceAmount, setServiceAmount] = useState<string>("");
//   // Ça va contenir nos services (vide par defaut)
//   const [services, setServices] = useState<Service[]>([]);
//   ///////
//   const [loading, setLoading] = useState<boolean>(false);
//   ////////

//   const handleAddService = async () => {
//     try {
//       const amount = parseFloat(serviceAmount);
//       if (isNaN(amount) || amount <= 0) {
//         throw new Error("Le montant doit être un nombre positif");
//       }

//       await addService(
//         user?.primaryEmailAddress?.emailAddress as string,
//         serviceName,
//         amount
//       );
//       fetchServices();
//       // Fermer le modul quand l'ajout s'est bien passé
//       // closeModal();
//       if (isModalOpen) {
//         closeModal();
//       }

//       setServiceName("");
//       setServiceAmount("");
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
//         setServices(userServices);
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
//             <input
//               type="text"
//               value={serviceName}
//               placeholder="Nom du service"
//               onChange={(e) => setServiceName(e.target.value)}
//               className={styles.service_input_name}
//               required
//             />

//             <input
//               type="number"
//               value={serviceAmount}
//               placeholder="Montant"
//               onChange={(e) => setServiceAmount(e.target.value)}
//               className={styles.service_input_amount}
//               required
//             />
//             <button
//               onClick={handleAddService}
//               className={styles.btn_handle_add_budget}
//             >
//               Ajouter services
//             </button>
//           </div>
//         </Modal>

//         <ul className={styles.list_services}>
//           {/* {services.map((service) => (
//             <Link key={service.id} href={`/manage/${service.id}`}>
//               <ServiceItem service={service} enableHover={1}></ServiceItem>
//             </Link>
//           ))} */}
//           <ul className={styles.list_services}>
//             {loading ? (
//               <div className="loading">Loading...</div>
//             ) : services.length === 0 ? (
//               <div>
//                 <span>Aucune transaction à afficher</span>
//               </div>
//             ) : (
//               // Si des services sont disponibles, on les affiche dans une liste
//               services.map((service) => (
//                 <Link key={service.id} href={`/manage/${service.id}`}>
//                   <ServiceItem service={service} enableHover={1}></ServiceItem>
//                 </Link>
//               ))
//             )}
//           </ul>
//         </ul>
//       </div>
//     </Wrapper>
//   );
// };

// export default ServicesPage;
"use client";

import { useUser } from "@clerk/nextjs";
import Wrapper from "../components/Wrapper/Wrapper";
import { useEffect, useState } from "react";
import Modal from "../components/Modal/Modal";
import { addService, getServicesByUser } from "@/actions/actions";
import { Service } from "@/type";
import Link from "next/link";
import ServiceItem from "../components/ServiceItem/ServiceItem";
// Styles
import styles from "./styles.module.scss";

const ServicesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  // D'abord on recupérer toutesles infos dont on a besoin pour ajouter un nouveau service
  const { user } = useUser();
  const [selectedService, setSelectedService] = useState<string>("");
  // Ça va contenir nos services (vide par defaut)
  const [services, setServices] = useState<Service[]>([]);
  ///////
  const [loading, setLoading] = useState<boolean>(false);
  ////////

  const serviceOptions = [
    { name: "Découverte", amount: 1200, description: "Service de découverte" },
    { name: "Simplicité", amount: 1500, description: "Service de simplicité" },
    { name: "Prenium", amount: 1800, description: "Service premium" },
  ];

  const handleAddService = async () => {
    try {
      const selected = serviceOptions.find(
        (service) => service.name === selectedService
      );
      if (!selected) {
        throw new Error("Veuillez sélectionner un service valide");
      }

      await addService(
        user?.primaryEmailAddress?.emailAddress as string,
        selected.name,
        selected.amount
      );
      fetchServices();
      // Fermer le modul quand l'ajout s'est bien passé
      if (isModalOpen) {
        closeModal();
      }

      setSelectedService("");
      console.log("Nouveau service créé avec succès");
    } catch (error) {
      console.error("Erreur lors de l'ajout du service:", error);
    }
  };

  // Fonction qui va nous permettre de récupérer les services
  const fetchServices = async () => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setLoading(true);
      try {
        const userServices = await getServicesByUser(
          user?.primaryEmailAddress?.emailAddress
        );
        setServices(
          userServices.map((service) => ({
            ...service,
            imageKey: service.imageUrl, // Assuming imageKey can be derived from imageUrl
          }))
        );
        setLoading(false);
      } catch (error) {
        console.log("Erreur lors de la récupération des services", error);
      }
    }
  };

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.primaryEmailAddress?.emailAddress]);

  return (
    <Wrapper>
      <div className={styles.container}>
        <button className={styles.btn_modal_service} onClick={openModal}>
          Nouveau Service
        </button>

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Création d'un service"
        >
          <h3 className={styles.text_service__title}>
            Création d&apos;un service
          </h3>
          <p className={styles.text_service}>
            Permet de contrôler ses dépenses facilement
          </p>
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
              {serviceOptions.map((option) => (
                <option key={option.name} value={option.name}>
                  {option.name} - {option.amount}€ ({option.description})
                </option>
              ))}
            </select>
            <button
              onClick={handleAddService}
              className={styles.btn_handle_add_budget}
            >
              Ajouter service !!!!
            </button>
          </div>
        </Modal>

        <ul className={styles.list_services}>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : services.length === 0 ? (
            <div>
              <span>Aucune transaction à afficher</span>
            </div>
          ) : (
            // Si des services sont disponibles, on les affiche dans une liste
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
