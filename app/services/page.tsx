//app/services/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Service } from "@/type";
import { useUser } from "@clerk/nextjs";
import { addService, getAllServices } from "@/actions/actions";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string>("");

  // Fonction de récupération des services
  const fetchServices = useCallback(async () => {
    setLoading(true); // On met le loading à true avant la récupération des services
    try {
      const data = await getAllServices();
      setServices(data);
    } catch (error) {
      console.error("Erreur lors du chargement des services:", error);
      setError("Impossible de charger les services.");
    } finally {
      setLoading(false); // On arrête le loading
    }
  }, []);

  // On récupère les services au montage du composant
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Fonction pour ajouter un service
  const handleAddService = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      setErrorMessage("Utilisateur non connecté ou email non disponible.");
      return;
    }

    try {
      const selected = services.find(
        (service) => service.name === selectedService
      );
      if (!selected) {
        setErrorMessage("Veuillez sélectionner un service valide.");
        return;
      }

      // Appel à addService
      const result = await addService(
        user.primaryEmailAddress.emailAddress,
        selected.name,
        selected.amount,
        selected.description || "Aucune description fournie"
      );
      console.log("Service ajouté avec succès : ", result); // Ajoute un log ici pour vérifier
      fetchServices(); // Récupérer de nouveau les services après l'ajout
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
