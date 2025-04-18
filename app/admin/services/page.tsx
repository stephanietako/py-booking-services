"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Service } from "@/types";
import { getAllServices } from "@/actions/actions";
import Image from "next/image";
import Wrapper from "@/app/components/Wrapper/Wrapper";

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(""); // Réinitialiser les erreurs au début de la requête
    try {
      const data = await getAllServices();
      setServices(data);
    } catch (error) {
      console.error("Erreur lors du chargement des services:", error);
      setError(
        "Impossible de charger les services. Veuillez réessayer plus tard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return (
    <Wrapper>
      <div className="table_container">
        <h1 className="title">Page Administrateur Services</h1>
        <h2>Vue D&apos;Ensemble Des Services Disponibles</h2>

        {loading ? (
          <div>Chargement...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : services.length === 0 ? (
          <div>Aucun service disponible pour le moment.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Description</th>
                <th>Montant (€)</th>
                <th>Catégories</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>{service.name}</td>
                  <td>
                    {service.description || "Aucune description disponible"}
                  </td>
                  <td>{service.amount} €</td>
                  <td>
                    {service.categories.length > 0
                      ? service.categories.join(", ")
                      : "Pas de catégorie assignée"}
                  </td>
                  <td>
                    <Image
                      src={service.imageUrl || "/assets/default.jpg"}
                      alt={`Image du service ${service.name}`}
                      width={100}
                      height={100}
                      className="serviceImage"
                      loading="lazy" // Ajout de lazy loading pour l'image
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Wrapper>
  );
};

export default ServicesPage;
