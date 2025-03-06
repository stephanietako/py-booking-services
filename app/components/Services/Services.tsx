"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Service } from "@/types";
import { getServicesByUser } from "@/actions/actions";
import ServiceCompt from "../ServicesCompt/ServiceCompt";
import styles from "./styles.module.scss";
import { useUser } from "@clerk/nextjs";

const Services: React.FC = () => {
  const { user } = useUser();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les services de l'utilisateur
  const fetchServices = useCallback(async () => {
    if (user?.id) {
      console.log("Utilisateur authentifié:", user);
      setLoading(true);
      try {
        const userServices = await getServicesByUser(user.id);
        console.log("Données récupérées :", userServices); // 🔍 Vérifie la structure reçue

        // Correction ici : utilisation de `categories` et `options`
        const servicesWithRequiredProps: Service[] = userServices.map(
          (service) => ({
            ...service,
            categories: service.categories ?? [], // ✅ Correction (pas `category`)
            // ✅ Vérifie si présent sinon valeur par défaut
          })
        );
        setServices(servicesWithRequiredProps);
      } catch (error) {
        console.error("Erreur lors de la récupération des services:", error);
        setError("Impossible de récupérer les services.");
      } finally {
        setLoading(false);
      }
    } else {
      console.error("Utilisateur non connecté ou ID non disponible.");
      setError("Utilisateur non connecté ou ID non disponible.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.services_container}>
      {services.length === 0 ? (
        <div>Aucun service disponible</div>
      ) : (
        services.map((service) => (
          <ServiceCompt
            key={service.id}
            name={service.name}
            description={service.description || ""}
            amount={service.amount}
            imageUrl={service.imageUrl || "/assets/default.jpg"}
            categories={service.categories} // ✅ Ajout des catégories
          />
        ))
      )}
    </div>
  );
};

export default Services;
