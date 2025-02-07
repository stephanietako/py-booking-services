"use client";

import { useState } from "react";
import { confirmBooking } from "@/actions/bookings";
import { Booking } from "@/types";
import toast from "react-hot-toast";

interface AdminBookingListProps {
  bookings: Booking[];
}

const AdminBookingList: React.FC<AdminBookingListProps> = ({
  bookings: initialBookings,
}) => {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await confirmBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "confirmed" } : b
        )
      );
      toast.success("Réservation confirmée !");
    } catch (error) {
      console.error("Erreur lors de la confirmation :", error);
      toast.error("Impossible de confirmer la réservation.");
    }
  };

  return (
    <div>
      <ul>
        {bookings.map((booking) => (
          <li key={booking.id}>
            <p>Service: {booking.service.name}</p>
            <p>Utilisateur: {booking.user.name}</p>
            <p>
              Statut:{" "}
              {booking.status === "confirmed"
                ? "Confirmée ✅"
                : "En attente ⏳"}
            </p>
            {booking.status !== "confirmed" && (
              <button onClick={() => handleConfirmBooking(booking.id)}>
                Confirmer
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminBookingList;
