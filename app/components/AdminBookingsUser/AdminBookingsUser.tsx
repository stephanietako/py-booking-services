// app/components/AdminBookingsUser/AdminBookingsUser.tsx
"use client";

import { useState } from "react";
import { updateBooking } from "@/actions/bookings";
import toast from "react-hot-toast";
import { Booking, BookingStatus } from "@/types";

interface AdminBookingsUserProps {
  bookings: Booking[];
}

const AdminBookingsUser: React.FC<AdminBookingsUserProps> = ({ bookings }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mettre à jour le statut de la réservation
  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: BookingStatus
  ) => {
    try {
      setLoading(true);
      await updateBooking(bookingId, newStatus); // Mettre à jour le statut
      toast.success(
        `Réservation ${newStatus === "APPROVED" ? "validée" : "annulée"} avec succès`
      );
    } catch {
      setError("Erreur lors de la mise à jour du statut de la réservation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Réservations en attente</h1>
      {error && <p className="error">{error}</p>}
      {loading && <p>Chargement...</p>}
      <ul>
        {bookings.map((booking) => (
          <li key={booking.id}>
            <div>
              <p>
                <strong>Service :</strong> {booking.service.name}
              </p>
              <p>
                <strong>Date :</strong>{" "}
                {new Intl.DateTimeFormat("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }).format(new Date(booking.createdAt))}
              </p>
              <p>
                <strong>Statut :</strong> {booking.status}
              </p>
            </div>
            <div>
              {/* Boutons pour valider ou annuler la réservation */}
              <button
                onClick={() => handleUpdateStatus(booking.id, "APPROVED")}
                disabled={loading}
              >
                Valider
              </button>
              <button
                onClick={() => handleUpdateStatus(booking.id, "REJECTED")}
                disabled={loading}
              >
                Annuler
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminBookingsUser;
