"use client";

import {
  addTransactionToService,
  deleteService,
  deleteTransaction,
  getTransactionsByServiceId,
} from "@/actions/actions";
import ServiceItem from "@/app/components/ServiceItem/ServiceItem";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import { Service } from "@/type";
import React, { useEffect, useState } from "react";
import { FaRegTrashAlt, FaWallet } from "react-icons/fa";
import { BsCartX } from "react-icons/bs";
import { redirect } from "next/navigation";

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
      // // eslint-disable-next-line
      // const newTransaction = await addTransactionToService(

      await addTransactionToService(serviceId, amountNumber, description);
      console.log("ok");
      // alert("Tout s'est passé avec succés");
      fetchServiceData(serviceId);
      setAmount("");
      setDescription("");
    } catch (error) {
      console.log("Vous avez dépassé le budget", error);
      alert("Vous avez dépassé le budget");
    }
  };

  const handleDeleteService = async () => {
    // ici je vais utiliser la pop-up du navigateur
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce service et toutes les transactions associées ?"
    );
    if (confirmed) {
      try {
        await deleteService(serviceId);
      } catch (error) {
        console.error("Erreur lors de la suppréssion du service ", error);
      }
      redirect("/services");
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    // ici je vais utiliser la pop-up du navigateur
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette transaction ?"
    );
    if (confirmed) {
      try {
        await deleteTransaction(transactionId);
        fetchServiceData(serviceId);
        console.log("Dépense supprimée");
      } catch (error) {
        console.error("Erreur lors de la suppréssion du service ", error);
      }
    }
  };
  return (
    <Wrapper>
      {service && (
        <div className="manage_service">
          <div className="manage_service_bloc">
            <div className="manage_service_container">
              <ServiceItem service={service} enableHover={0} />
              <button
                onClick={() => handleDeleteService()}
                className="btn_form"
              >
                supprimer le service
              </button>
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
            <div className="manage_service_table">
              {service?.transactions && service.transactions.length > 0 ? (
                <div className="table_container">
                  <table>
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Montant</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Heure</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {service?.transactions?.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>
                            <FaWallet />
                          </td>
                          <td> - {transaction.amount}€ </td>
                          <td> {transaction.description}</td>
                          <td>
                            {transaction.createdAt.toLocaleDateString("fr-FR")}
                          </td>
                          <td>
                            {transaction.createdAt.toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>
                          <td>
                            <button
                              onClick={() =>
                                handleDeleteTransaction(transaction.id)
                              }
                              className="btn_action"
                            >
                              <FaRegTrashAlt />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no_transaction">
                  <span className="no_transaction_text">
                    <BsCartX />
                    <p>aucune transaction</p>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default ManagePage;
