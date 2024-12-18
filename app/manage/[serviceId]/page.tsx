"use client";

import {
  addTransactionToService,
  getTransactionsByServiceId,
} from "@/actions/actions";
import ServiceItem from "@/app/components/ServiceItem/ServiceItem";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import { Service } from "@/type";
import React, { useEffect, useState } from "react";
// Ici on va recupérer l'id de chaque service

const ManagePage = ({ params }: { params: Promise<{ serviceId: string }> }) => {
  const [serviceId, setServiceId] = useState<string>("");
  const [service, setService] = useState<Service>();

  const [description, setDescription] = useState<string>("");

  const [amount, setAmount] = useState<string>("");

  async function fetchServiceData(serviceId: string) {
    try {
      if (serviceId) {
        const serviceData = await getTransactionsByServiceId(serviceId);
        setService(serviceData);
      }
    } catch (error) {
      console.log(
        "erreur lors de la récupération du service et des transactions",
        error
      );
    }
  }
  //console.log("service:", service);
  // console.log("serviceId:", serviceId);

  useEffect(() => {
    const getId = async () => {
      const resolvedParams = await params;
      setServiceId(resolvedParams.serviceId);
      fetchServiceData(resolvedParams.serviceId);
    };
    getId();
  }, [params]);

  const handleAddTransaction = async () => {
    if (!amount || !description) {
      console.log(" Veuillez remplir tous les champs");
      alert("Veuillez remplir tous les champs");
      return;
    }

    try {
      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        throw new Error("Le montant doit être un nombre positif");
      }
      const newTransaction = await addTransactionToService(
        serviceId,
        amountNumber,
        description
      );
      console.log("ok");
      alert("Tout s'est passé avec succés");
      fetchServiceData(serviceId);
      setAmount("");
      setDescription("");
    } catch (error) {
      console.log("Vous avez dépassé le budget", error);
      alert("Vous avez dépassé le budget");
    }
  };
  return (
    <Wrapper>
      {service && (
        <div className="manage_service">
          <div className="manage_service_container">
            <ServiceItem service={service} enableHover={0} />
            <button className="btn_form"> supprimer le service</button>
            <div className="form">
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                required
                className="input_form_description"
              />
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Montant"
                required
                className="input_form_montant"
              />
              <button onClick={handleAddTransaction} className="btn_form">
                Ajouter votre option de depense
              </button>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default ManagePage;
