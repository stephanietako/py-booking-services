"use client";

import React, { useState, useEffect } from "react";
import { OptionWithAmount, Option } from "@/types";
import { addOptionToBooking } from "@/actions/bookings";

interface Props {
  bookingId: string;
  availableOptions: Option[];
  serviceAmount: number;
  onTotalUpdate?: (total: number, options: OptionWithAmount[]) => void;
}

const OptionsSelector: React.FC<Props> = ({
  bookingId,
  availableOptions,
  serviceAmount,
  onTotalUpdate,
}) => {
  const [options, setOptions] = useState<OptionWithAmount[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const total =
    serviceAmount + options.reduce((sum, option) => sum + option.amount, 0);

  useEffect(() => {
    if (onTotalUpdate) {
      onTotalUpdate(total, options);
    }
  }, [onTotalUpdate, options, total]);

  const handleAddOption = async () => {
    if (!selectedOptionId) return;

    if (options.some((opt) => opt.optionId === selectedOptionId)) {
      alert("Cette option a déjà été ajoutée.");
      return;
    }

    try {
      const added = await addOptionToBooking(
        bookingId,
        selectedOptionId,
        quantity
      );

      const completedOption: OptionWithAmount = {
        ...added,
        amount: added.unitPrice * added.quantity,
        createdAt: new Date(), // Ou `added.createdAt` s'il existe
      };

      setOptions((prev) => [...prev, completedOption]);
      setSelectedOptionId("");
      setQuantity(1);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'option :", error);
      alert("Une erreur est survenue.");
    }
  };

  return (
    <div>
      <h2>Ajouter des options</h2>

      <select
        value={selectedOptionId}
        onChange={(e) => setSelectedOptionId(e.target.value)}
      >
        <option value="">-- Sélectionnez une option --</option>
        {availableOptions.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label} - {opt.amount} €
          </option>
        ))}
      </select>

      <input
        type="number"
        value={quantity}
        min={1}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      <button onClick={handleAddOption}>Ajouter</button>

      <ul>
        {options.map((opt) => (
          <li key={opt.optionId}>
            {opt.label} (x{opt.quantity}) — {opt.amount} €
          </li>
        ))}
      </ul>

      <p>Total : {total} €</p>
    </div>
  );
};

export default OptionsSelector;
