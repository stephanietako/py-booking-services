"use client";

import React, { useEffect, useState } from "react";
import { Booking, BookingOption } from "@/types";
import { useBookingStore } from "@/store/store";
import OptionQuantityUpdater from "../OptionQuantityUpdater/OptionQuantityUpdater";

interface BookingWithOptionsProps {
  booking: Booking;
}

const BookingWithOptions: React.FC<BookingWithOptionsProps> = ({ booking }) => {
  const { totalAmounts, options, setOptions, updateTotalAmount } =
    useBookingStore();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const bookingId = String(booking.id);

  useEffect(() => {
    if (!options[bookingId]) {
      const bookingOptions = booking.bookingOptions || [];
      setOptions(bookingId, bookingOptions);
    }
    updateTotalAmount(bookingId);
  }, [
    bookingId,
    booking.bookingOptions,
    options,
    setOptions,
    updateTotalAmount,
  ]);

  const currentOptions: BookingOption[] = options[bookingId] || [];
  const currentTotal = totalAmounts[bookingId] ?? booking.totalAmount;

  const handleQuantityChange = (optionId: string, newQuantity: number) => {
    const updatedOptions = currentOptions.map((option) =>
      option.optionId === optionId
        ? { ...option, quantity: newQuantity }
        : option
    );
    setOptions(bookingId, updatedOptions);
    updateTotalAmount(bookingId);
  };

  return (
    <div>
      <h3>Réservation #{booking.id}</h3>
      <p>Total initial: {booking.totalAmount} €</p>
      <p>Total mis à jour: {currentTotal} €</p>

      <div>
        <h4>Options associées :</h4>
        {currentOptions.length > 0 ? (
          <ul>
            {currentOptions.map((option) => (
              <li key={option.optionId}>
                <div>
                  <strong>{option.option?.label ?? option.label}</strong>
                  <p>{option.option?.description ?? option.description}</p>
                  <p>Prix unitaire: {option.unitPrice} €</p>
                  <OptionQuantityUpdater
                    initialQuantity={option.quantity}
                    onQuantityChange={(newQty) =>
                      handleQuantityChange(option.optionId, newQty)
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucune option disponible pour cette réservation.</p>
        )}
      </div>
    </div>
  );
};

export default BookingWithOptions;
