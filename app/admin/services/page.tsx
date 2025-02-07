"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Service } from "@/types";
import { getAllServices } from "@/actions/actions";
import ServiceItem from "@/app/components/ServiceItem/ServiceItem";
import styles from "./styles.module.scss";
import Wrapper from "@/app/components/Wrapper/Wrapper";

const ServicesPage: React.FC = () => {
  //const { user } = useUser();
  const [services, setServices] = useState<Service[]>([]);
  // const [selectedService, setSelectedService] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string>("");

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllServices();
      setServices(data);
    } catch (error) {
      console.error("Erreur lors du chargement des services:", error);
      setError("Impossible de charger les services.");
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
        <h2>Vue D&apos;ensemble Des Services disponibles</h2>
        <ul className={styles.list_services}>
          {loading ? (
            <div>Chargement...</div>
          ) : services.length === 0 ? (
            <div>Aucun service disponible</div>
          ) : (
            services.map((service) => (
              <ServiceItem
                key={service.id}
                service={service}
                enableHover={1}
              ></ServiceItem>
            ))
          )}
        </ul>
      </div>
    </Wrapper>
  );
};

export default ServicesPage;
