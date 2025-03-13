"use client";

import { useEffect, useState } from "react";
import { getAllServices } from "@/actions/actions";
import { Service } from "@/types";
import ServiceItem from "../ServiceItem/ServiceItem";
import Wrapper from "../Wrapper/Wrapper";
// Styles
import styles from "./styles.module.scss";

const ServiceList = () => {
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Wrapper>
      <div className={styles.service_list}>
        <header className="header">
          <h1>Liste des Services</h1>
        </header>
        <div className={styles.service_list__container}>
          {loading && <p>Chargement des services...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && services.length === 0 && (
            <p>Aucun service disponible.</p>
          )}
          {!loading &&
            !error &&
            services.map((service) => (
              <ServiceItem key={service.id} service={service} enableHover={1} />
            ))}
        </div>
      </div>
    </Wrapper>
  );
};

export default ServiceList;
