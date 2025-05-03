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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [remainingAmount, setRemainingAmount] = useState<number>(1500); // Valeur par défaut

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Chargement unique des services
        const data = await getAllServices();
        setServices(data);

        // 2. Calcul du prix UNIQUEMENT si nécessaire
        const startTime = localStorage.getItem("selectedStartTime");
        const endTime = localStorage.getItem("selectedEndTime");

        if (startTime && endTime && data.length > 0) {
          const price = await getDynamicPrice(data[0].id, startTime, endTime);
          setRemainingAmount(price);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Un seul useEffect pour tout gérer

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
              availableOptions={service.options || []}
            />
          ))}
      </div>
    </Wrapper>
  );
};

export default ServiceList;
