"use client";

import { useEffect, useState } from "react";
import { getAllServices, getDynamicPrice } from "@/actions/actions"; // ⚡ Importation correcte
import { Service } from "@/types";
import ServiceItem from "../ServiceItem/ServiceItem";
import Wrapper from "../Wrapper/Wrapper";
// Styles
import styles from "./styles.module.scss";

const ServiceList = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingAmount, setRemainingAmount] = useState<number>(1500); // Valeur par défaut

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getAllServices();
        setServices(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les services.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // 🕐 Récupérer les dates stockées dans localStorage et calculer le prix
  useEffect(() => {
    const startTime = localStorage.getItem("selectedStartTime");
    const endTime = localStorage.getItem("selectedEndTime");

    if (startTime && endTime) {
      const fetchPrice = async () => {
        try {
          if (services.length > 0) {
            // Récupère le prix pour le premier service
            const price = await getDynamicPrice(
              services[0].id,
              startTime,
              endTime
            );
            setRemainingAmount(price);
          }
        } catch (error) {
          console.error("Erreur lors du calcul du prix :", error);
        }
      };

      fetchPrice();
    }
  }, [services]); // Exécuter seulement quand les services sont chargés

  useEffect(() => {
    const startTime = localStorage.getItem("selectedStartTime");
    const endTime = localStorage.getItem("selectedEndTime");

    console.log("Vérification LocalStorage :", { startTime, endTime });

    if (startTime) localStorage.setItem("startTime", startTime);
    if (endTime) localStorage.setItem("endTime", endTime);
  }, []);

  return (
    <Wrapper>
      <div className={styles.service_list}>
        {loading && <p>Chargement des services...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && services.length === 0 && <p>Aucun service disponible.</p>}
        {!loading &&
          !error &&
          services.map((service) => (
            <ServiceItem
              key={service.id}
              service={service}
              remainingAmount={remainingAmount}
            />
          ))}
      </div>
    </Wrapper>
  );
};

export default ServiceList;
