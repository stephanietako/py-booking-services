"use client";

import { useState } from "react";
import { updateBooking } from "@/actions/bookings";
import toast from "react-hot-toast";
import { Booking, BookingStatus } from "@/types";

interface AdminBookingsPanelProps {
  bookings: Booking[];
}

const AdminBookingsPanel: React.FC<AdminBookingsPanelProps> = ({
  bookings,
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  // Mettre à jour le statut de la réservation
  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: BookingStatus
  ) => {
    if (loading) return; // Empêcher les doubles requêtes

    setLoading(bookingId);
    const toastId = toast.loading("Mise à jour en cours...", {
      ariaProps: { role: "status", "aria-live": "polite" },
    });

    try {
      if (newStatus !== "APPROVED" && newStatus !== "REJECTED") {
        throw new Error("Statut de réservation invalide");
      }

      // Passez un objet contenant le champ à mettre à jour
      await updateBooking(bookingId, { status: newStatus });

      toast.success(
        `Réservation ${newStatus === "APPROVED" ? "validée" : "annulée"} avec succès`,
        { id: toastId, ariaProps: { role: "status", "aria-live": "polite" } }
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de la réservation.",
        { id: toastId, ariaProps: { role: "alert", "aria-live": "assertive" } }
      );
    } finally {
      setLoading(null);
      toast.dismiss(toastId);
    }
  };

  return (
    <div>
      <h1>Réservations en attente</h1>
      <ul>
        {bookings.map((booking) => (
          <li key={booking.id}>
            <div>
              <p>
                <strong>Service :</strong>{" "}
                {booking.service ? booking.service.name : "Non spécifié"}
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
                onClick={() =>
                  handleUpdateStatus(booking.id.toString(), "APPROVED")
                }
                disabled={loading === booking.id.toString()}
                aria-label={`Valider la réservation ${booking.id}`}
                aria-disabled={loading === booking.id.toString()}
              >
                Valider
              </button>
              <button
                onClick={() =>
                  handleUpdateStatus(booking.id.toString(), "REJECTED")
                }
                disabled={loading === booking.id.toString()}
                aria-label={`Annuler la réservation ${booking.id}`}
                aria-disabled={loading === booking.id.toString()}
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

export default AdminBookingsPanel;
