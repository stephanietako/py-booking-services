//app/manage/[serviceId]

"use client";

import {
  addTransactionToService,
  deleteService,
  deleteTransaction,
  getTransactionsByServiceId,
} from "@/actions/actions";
import ServiceItem from "@/app/components/ServiceItem/ServiceItem";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import { Service } from "@/types";
import React, { useEffect, useState } from "react";
import { FaRegTrashAlt, FaWallet } from "react-icons/fa";
import { BsCartX } from "react-icons/bs";
import { redirect } from "next/navigation";

// Ici on va recupérer l'id de chaque service

const ManagePage = ({ params }: { params: Promise<{ serviceId: string }> }) => {
  const [serviceId, setServiceId] = useState<string>("");
  const [service, setService] = useState<Service>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [amount, setAmount] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string>("");

  const options = [
    {
      description: "personne supplémentaire",
      amount: 50,
      allowedFor: ["Découverte"],
      maxCount: 9,
    },
    {
      description: "personne supplémentaire",
      amount: 120,
      allowedFor: ["Prenium"],
      maxCount: 5,
    },
    {
      description: "hôtesse",
      amount: 200,
      allowedFor: ["Simplicité", "Prenium"],
    },
    {
      description: "vidéo drône",
      amount: 500,
      allowedFor: ["Découverte", "Simplicité", "Prenium"],
    },
    {
      description: "paddle board",
      amount: 50,
      allowedFor: ["Découverte", "Simplicité", "Prenium"],
    },
  ];

  async function fetchServiceData(serviceId: string) {
    try {
      if (serviceId) {
        const serviceData = (await getTransactionsByServiceId(
          serviceId
        )) as unknown as Service;
        setService(serviceData);
      }
    } catch (error) {
      console.log(
        "erreur lors de la récupération du service et des transactions",
        error
      );
    }
  }

  useEffect(() => {
    const getId = async () => {
      const resolvedParams = await params;
      setServiceId(resolvedParams.serviceId);
      fetchServiceData(resolvedParams.serviceId);
    };
    getId();
  }, [params]);

  const handleAddTransaction = async () => {
    const option = options.find(
      (option) => option.amount.toString() === selectedOption
    );
    if (!option) {
      alert("Veuillez sélectionner une option valide");
      return;
    }

    if (service?.name && !option.allowedFor.includes(service.name)) {
      alert(
        `L'option "${option.description}" n'est pas disponible pour le service "${service?.name}"`
      );
      return;
    }

    if (option.maxCount) {
      const optionCount =
        service?.transactions?.filter(
          (transaction) =>
            transaction.description === option.description &&
            transaction.amount === option.amount
        ).length || 0;

      if (optionCount >= option.maxCount) {
        alert(
          `L'option "${option.description}" ne peut pas être ajoutée plus de ${option.maxCount} fois pour le service "${service?.name}"`
        );
        return;
      }
    }

    try {
      // Ajouter la transaction sans vérification de budget
      await addTransactionToService(
        serviceId,
        option.amount,
        option.description
      );
      console.log("ok");
      fetchServiceData(serviceId);
      setAmount("");
      setSelectedOption("");
    } catch (error) {
      console.log("Erreur lors de l'ajout de la transaction", error);
      alert("Une erreur s'est produite lors de l'ajout de la transaction.");
    }
  };

  const handleDeleteService = async () => {
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
                <div className="options">
                  <select
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="select_option"
                  >
                    <option value="" disabled>
                      Choisir une option
                    </option>
                    {options.map((option) => (
                      <option
                        key={`${option.description}-${option.amount}`}
                        value={option.amount}
                      >
                        {option.description} - {option.amount}€
                      </option>
                    ))}
                  </select>
                  <button onClick={handleAddTransaction} className="btn_option">
                    Ajouter une option
                  </button>
                </div>
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
                          <td> + {transaction.amount}€ </td>
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
