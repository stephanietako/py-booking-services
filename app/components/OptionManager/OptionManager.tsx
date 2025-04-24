"use client";

import React, { useEffect, useState } from "react";
import {
  addOptionToBooking,
  deleteOption,
  getOptionsByBookingId,
  updateBookingTotal,
} from "@/actions/bookings";
import { Option } from "@/types";
import { FaRegTrashAlt, FaWallet } from "react-icons/fa";
import { BsCartX } from "react-icons/bs";
// Styles
import styles from "./styles.module.scss";

interface OptionManagerProps {
  bookingId: string;
  serviceAmount: number;
  onTotalUpdate?: (total: number, updatedOptions: Option[]) => void;
}

const OptionManager: React.FC<OptionManagerProps> = ({
  bookingId,
  serviceAmount,
  onTotalUpdate,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(serviceAmount);
  const [shouldUpdateTotal, setShouldUpdateTotal] = useState(false);

  const optionsPlus = [
    { id: "capitaine", description: "Capitaine", amount: 350 },
    { id: "hôtesse", description: "Hôtesse", amount: 200 },
  ];

  // Charge les options existantes
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const { options } = await getOptionsByBookingId(bookingId);
        setOptions(options);

        // Calcul du total
        const total =
          serviceAmount +
          options.reduce((sum, option) => sum + option.amount, 0);
        setTotalAmount(total);

        if (onTotalUpdate) {
          onTotalUpdate(total, options);
        }
      } catch (error) {
        console.error("❌ Erreur lors du chargement des options :", error);
        setError("Impossible de récupérer les options.");
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [bookingId, serviceAmount, onTotalUpdate]);

  // Met à jour le total après un changement
  useEffect(() => {
    if (!shouldUpdateTotal) return;

    const updateTotal = async () => {
      try {
        const updatedTotalFromServer = await updateBookingTotal(bookingId);
        setTotalAmount(updatedTotalFromServer);
      } catch (error) {
        console.error("Erreur mise à jour du total :", error);
      } finally {
        setShouldUpdateTotal(false);
      }
    };

    const timeout = setTimeout(updateTotal, 3000);
    return () => clearTimeout(timeout);
  }, [shouldUpdateTotal, bookingId]);

  // Ajoute une option à la réservation
  const handleAddOption = async (optionId: string, optionAmount: number) => {
    if (options.some((opt) => opt.id === optionId)) {
      alert("Cette option a déjà été ajoutée.");
      return;
    }

    try {
      const newOption = await addOptionToBooking(
        bookingId,
        optionAmount,
        optionId
      );

      const updatedOptions = [
        ...options,
        { ...newOption, amount: optionAmount, description: optionId },
      ];
      setOptions(updatedOptions);
      setShouldUpdateTotal(true);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'option :", error);
      alert("Une erreur s'est produite lors de l'ajout. Veuillez réessayer.");
    }
  };

  // Supprime une option de la réservation
  const handleDeleteOption = async (optionId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette option ?"))
      return;

    try {
      await deleteOption(optionId);

      setOptions((prevOptions) =>
        prevOptions.filter((opt) => opt.id !== optionId)
      );
      setShouldUpdateTotal(true);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'option :", error);
      alert("Impossible de supprimer l'option.");
    }
  };

  return (
    <div className={styles.manage_service_container}>
      <h3>Options supplémentaires</h3>
      <div className={styles.form}>
        <h4>Total à payer : {totalAmount}€</h4>

        <div className={styles.optionCheckboxes}>
          {optionsPlus.map((option) => (
            <div key={option.id} className={styles.optionCard}>
              <input
                type="checkbox"
                id={option.id}
                name={option.id}
                onChange={(e) =>
                  e.target.checked
                    ? handleAddOption(option.id, option.amount)
                    : handleDeleteOption(option.id)
                }
              />
              <label htmlFor={option.id}>
                <h5>{option.description}</h5>
                <p>{option.amount}€</p>
              </label>
            </div>
          ))}
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : options.length === 0 ? (
          <div className={styles.noTransaction}>
            <span className={styles.noTransactionText}>
              <BsCartX />
              <p>aucune option</p>
            </span>
          </div>
        ) : (
          <>
            <h3>Options sélectionnées:</h3>
            <div className={styles.selectedOptions}>
              {options.map((option) => (
                <div key={option.id} className={styles.selectedOptionCard}>
                  <span>
                    <FaWallet /> {option.description} (+ {option.amount}€)
                  </span>
                  <button
                    onClick={() => handleDeleteOption(option.id)}
                    className={styles.btnAction}
                    aria-label={`Supprimer l'option ${option.description}`}
                  >
                    <FaRegTrashAlt />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OptionManager;
