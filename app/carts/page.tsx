"use client";

import React, { useEffect, useState } from "react";
import ServiceItem from "../components/ServiceItem/ServiceItem";
import { Service } from "@/types";
import { getAllServices } from "@/actions/actions";
import Wrapper from "../components/Wrapper/Wrapper";
const Page: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const carts = await getAllServices();

        setServices(carts);
      } catch (error) {
        console.error(error);
        setError("Impossible de charger les services.");
      }
    };

    fetchServices();
  }, []);

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <Wrapper>
      <div className="services-container">
        <header>
          <h1>Liste des services</h1>
        </header>
        <ul className="services-list">
          {services.map((service) => (
            <ServiceItem key={service.id} service={service} enableHover={1} />
          ))}
        </ul>
      </div>
    </Wrapper>
  );
};

export default Page;
