import React, { useState, useEffect, useCallback } from "react";
import { Service } from "@/type"; // Typage des services
import { getServicesByUser } from "@/actions/actions"; // Import de l'API pour récupérer les services
import ServiceCompt from "../ServicesCompt/ServiceCompt";
import styles from "./styles.module.scss";
import { useUser } from "@clerk/nextjs";

const Services: React.FC = () => {
  const { user } = useUser();
  const [services, setServices] = useState<Service[]>([]); // Type des services
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les services de l'utilisateur
  const fetchServices = useCallback(async () => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setLoading(true);
      try {
        const userServices = await getServicesByUser(
          user.primaryEmailAddress.emailAddress
        );
        setServices(userServices); // Met à jour les services récupérés
      } catch (error) {
        console.error("Erreur lors de la récupération des services:", error);
        setError("Impossible de récupérer les services.");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Utilisateur non connecté ou email non disponible.");
    }
  }, [user?.primaryEmailAddress?.emailAddress]);

  // Récupérer les services dès que l'utilisateur est défini
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.services_container}>
      {services.length === 0 ? (
        <div>Aucun service disponible</div>
      ) : (
        services.map((service) => (
          <ServiceCompt
            key={service.id}
            name={service.name}
            description={service.description}
            amount={service.amount}
            imageUrl={service.imageUrl || "/default.jpg"}
          />
        ))
      )}
    </div>
  );
};

export default Services;
