"use client";

import React, { useEffect, useState } from "react";
import {
  addOptionToBooking,
  deleteOption,
  getOptionsByBookingId,
  updateBookingTotal, // ✅ Nouvelle action
} from "@/actions/bookings";
import { Option } from "@/types";
import { FaRegTrashAlt, FaWallet } from "react-icons/fa";
import { BsCartX } from "react-icons/bs";

interface OptionManagerProps {
  bookingId: string;
  serviceAmount: number; // ✅ Ajout du prix initial du service
  onTotalUpdate?: (total: number) => void; // ✅ Callback pour envoyer le total
}

const OptionManager: React.FC<OptionManagerProps> = ({
  bookingId,
  serviceAmount, // ✅ Montant initial
  onTotalUpdate,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<number>(serviceAmount || 0);

  const optionsPlus = [
    { description: "Personne supplémentaire", amount: 50 },
    { description: "Personne supplémentaire", amount: 120 },
    { description: "Hôtesse", amount: 200 },
    { description: "Vidéo drone", amount: 500 },
    { description: "Paddle board", amount: 50 },
  ];

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const { options } = await getOptionsByBookingId(bookingId);
      setOptions(options);

      // ✅ Vérifie que les options sont bien des nombres valides avant de calculer
      const total = options.reduce(
        (sum, option) => sum + option.amount,
        serviceAmount || 0
      );

      setTotalAmount(total); // ✅ Met à jour localement
      onTotalUpdate?.(total); // ✅ Envoie le total à la card
      console.log("Montant du service:", serviceAmount);
      console.log("Options récupérées:", options);
      console.log("Total calculé :", total);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des options :", error);
      setError("Impossible de récupérer les options.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, serviceAmount]);

  const handleAddOption = async () => {
    if (!selectedOption) {
      alert("Veuillez sélectionner une option valide");
      return;
    }

    const option = optionsPlus.find(
      (opt) => opt.amount.toString() === selectedOption
    );
    if (!option) {
      alert("Option invalide");
      return;
    }

    try {
      if (option.description) {
        await addOptionToBooking(bookingId, option.amount, option.description);
      } else {
        alert("Description de l'option invalide");
      }
      await updateBookingTotal(bookingId); // ✅ Mise à jour du total dans la DB
      setSelectedOption("");
      setTotalAmount((prev) => prev + option.amount); // ✅ Mise à jour locale du total
      fetchOptions(); // ✅ Recharge les options
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout de l'option :", error);
      alert("Une erreur s'est produite lors de l'ajout.");
    }
  };

  // 🔥 Suppression d'une option et mise à jour du total
  const handleDeleteOption = async (optionId: string, amount: number) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette option ?"
    );
    if (!confirmed) return;

    try {
      await deleteOption(optionId);
      await updateBookingTotal(bookingId); // ✅ Mise à jour du total après suppression
      setTotalAmount((prev) => prev - amount); // ✅ Mise à jour locale
      setOptions((prev) => prev.filter((t) => t.id !== optionId));
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de l'option :", error);
      alert("Impossible de supprimer l'option.");
    }
  };

  return (
    <div className="manage_service_container">
      <h3>Options supplémentaires</h3>
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
            {optionsPlus.map((option) => (
              <option
                key={`${option.description}-${option.amount}`}
                value={option.amount.toString()}
              >
                {option.description} - {option.amount}€
              </option>
            ))}
          </select>
          <button onClick={handleAddOption} className="btn_option">
            Ajouter une option
          </button>
        </div>

        <h4>Total à payer : {totalAmount}€</h4>

        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : options.length === 0 ? (
          <div className="no_transaction">
            <span className="no_transaction_text">
              <BsCartX />
              <p>aucune option</p>
            </span>
          </div>
        ) : (
          <>
            <h3>Voici les options que vous avez choisies:</h3>
            <table className="table_container">
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
                {options.map((option) => (
                  <tr key={option.id}>
                    <td>
                      <FaWallet />
                    </td>
                    <td>+ {option.amount}€</td>
                    <td>{option.description}</td>
                    <td>
                      {new Date(option.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td>
                      {new Date(option.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          handleDeleteOption(option.id, option.amount)
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
          </>
        )}
      </div>
    </div>
  );
};

export default OptionManager;
