"use client";

import React, { useState } from "react";

import { Booking } from "@/types"; // ajuste si nécessaire
import { updateBookingStatus } from "@/utils/bookings";

interface Props {
  initialBookings: Booking[];
}

const BookingList: React.FC<Props> = ({ initialBookings }) => {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const handleStatusChange = async (
    bookingId: number,
    newStatus: "APPROVED" | "REJECTED" | "PAID"
  ) => {
    try {
      const updated = await updateBookingStatus(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut", error);
    }
  };

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="border p-4 rounded-lg shadow-sm space-y-2"
        >
          <p>
            <strong>Client :</strong>{" "}
            {booking.client?.fullName || "Client inconnu"}
          </p>
          <p>
            <strong>Statut :</strong> {booking.status}
          </p>
          <p>
            <strong>Date de réservation :</strong>{" "}
            {new Date(booking.reservedAt).toLocaleString()}
          </p>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleStatusChange(booking.id, "APPROVED")}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
            >
              Approuver
            </button>
            <button
              onClick={() => handleStatusChange(booking.id, "REJECTED")}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Rejeter
            </button>
            <button
              onClick={() => handleStatusChange(booking.id, "PAID")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
              Marquer comme payé
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingList;
