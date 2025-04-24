"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  addOptionToBooking,
  deleteOption,
  getOptionsByBookingId,
  updateBookingTotal,
} from "@/actions/bookings";
import { Booking } from "@/types";
import { useBookingStore } from "@/store/store";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
// Styles
import styles from "./styles.module.scss";

// Définition des props
interface BookingWithOptionsProps {
  booking: Booking;
  onCancel: () => void;
}

const BookingWithOptions: React.FC<BookingWithOptionsProps> = ({ booking }) => {
  const [state, setState] = useState({
    loading: false,
    error: null as string | null, // Correction ici
    selectedOption: "",
  });

  const { options, setOptions, totalAmounts, setTotalAmount } =
    useBookingStore();
  const bookingOptions = options[booking.id] || [];

  const optionsPlus = [
    { description: "Capitaine", amount: 350 },
    { description: "Hôtesse", amount: 200 },
  ];

  const fetchOptions = useCallback(async () => {
    setState({ ...state, loading: true });
    try {
      const { options: fetchedOptions } = await getOptionsByBookingId(
        booking.id
      );
      setOptions(booking.id, fetchedOptions);
      const total =
        booking.totalAmount +
        fetchedOptions.reduce((sum, opt) => sum + opt.amount, 0);
      setTotalAmount(booking.id, total);
    } catch (error) {
      console.error("❌ Erreur:", error);
      setState({ ...state, error: "Impossible de charger les options." });
    } finally {
      setState({ ...state, loading: false });
    }
  }, [booking.id, booking.totalAmount, setOptions, setTotalAmount, state]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const handleAddOption = async () => {
    if (!state.selectedOption) {
      setState({ ...state, error: "Veuillez sélectionner une option." });
      return;
    }

    const option = optionsPlus.find(
      (opt) => opt.amount.toString() === state.selectedOption
    );
    if (!option) {
      setState({ ...state, error: "Option invalide." });
      return;
    }

    if (bookingOptions.some((opt) => opt.amount === option.amount)) {
      setState({ ...state, error: "Cette option est déjà ajoutée." });
      return;
    }

    try {
      const newOption = await addOptionToBooking(
        booking.id,
        option.amount,
        option.description
      );
      const updatedOptions = [
        ...bookingOptions,
        {
          ...option,
          id: newOption.id,
          createdAt: new Date(newOption.createdAt),
        },
      ];
      setOptions(booking.id, updatedOptions);

      const updatedTotal = await updateBookingTotal(booking.id);
      setTotalAmount(booking.id, updatedTotal);
      setState({ ...state, selectedOption: "" });
    } catch {
      setState({ ...state, error: "Erreur lors de l'ajout de l'option." });
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette option ?"))
      return;

    try {
      await deleteOption(optionId);
      const updatedOptions = bookingOptions.filter(
        (opt) => opt.id !== optionId
      );
      setOptions(booking.id, updatedOptions);

      const updatedTotal = await updateBookingTotal(booking.id);
      setTotalAmount(booking.id, updatedTotal);
    } catch {
      setState({ ...state, error: "Impossible de supprimer cette option." });
    }
  };

  return (
    <div className={styles.bookingItem}>
      <div className={styles.bookingItem__header}>
        <h3>{booking.service.name}</h3>
        <p>{booking.service.description}</p>
      </div>

      <div className={styles.bookingItem__content}>
        <div className={styles.bookingItem__details}>
          <p>
            <strong>Réservé pour :</strong>{" "}
            {format(new Date(booking.startTime), "eeee dd MMMM 'à' HH:mm", {
              locale: fr,
            })}{" "}
            à {format(new Date(booking.endTime), "HH:mm", { locale: fr })}
          </p>
          <p className={styles.bookingItem__total}>
            Total: {totalAmounts[booking.id] || booking.totalAmount} €
          </p>
        </div>

        <div className={styles.bookingItem__options}>
          <h4>Options choisies :</h4>
          {state.loading ? (
            <p>Chargement...</p>
          ) : state.error ? (
            <p className="error">{state.error}</p>
          ) : bookingOptions.length === 0 ? (
            <p>Aucune option sélectionnée.</p>
          ) : (
            <ul>
              {bookingOptions.map((option) => (
                <li key={option.id}>
                  {option.description} - {option.amount} €
                  <button onClick={() => handleDeleteOption(option.id)}>
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          )}

          <select
            value={state.selectedOption}
            onChange={(e) =>
              setState({ ...state, selectedOption: e.target.value })
            }
          >
            <option value="">Choisir une option</option>
            {optionsPlus.map((opt) => (
              <option key={opt.amount} value={opt.amount.toString()}>
                {opt.description} - {opt.amount} €
              </option>
            ))}
          </select>
          <button onClick={handleAddOption}>Ajouter</button>
        </div>
      </div>
    </div>
  );
};

export default BookingWithOptions;
