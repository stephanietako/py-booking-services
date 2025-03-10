"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Booking } from "@/types";
import {
  getAllBookings,
  updateBookingTotal,
  updateBooking,
} from "@/actions/bookings";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

const UsersBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { user } = useUser();

  const fetchBookings = useCallback(async () => {
    if (!user || !user.id) {
      setError("Utilisateur non trouvé");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getAllBookings(user.id);

      // Récupérer le total de chaque réservation en parallèle
      const bookingsWithTotal = await Promise.all(
        data.map(async (booking) => {
          const totalAmount = await updateBookingTotal(booking.id);
          return { ...booking, totalAmount };
        })
      );

      setBookings(bookingsWithTotal);
      console.log("Bookings récupérés:", bookingsWithTotal);
    } catch (error) {
      console.error("Erreur lors du chargement des réservations:", error);
      setError(
        "Impossible de charger les réservations. Veuillez réessayer plus tard."
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [fetchBookings, user]);

  // Fonction pour mettre à jour le statut d'une réservation
  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: "APPROVED" | "REJECTED" | "PAID"
  ) => {
    try {
      await updateBooking(bookingId, newStatus);

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: newStatus,
                // Ne touche pas à `approvedByAdmin` si le statut est "PAID"
                approvedByAdmin:
                  newStatus === "APPROVED" ? true : booking.approvedByAdmin,
              }
            : booking
        )
      );

      if (newStatus === "REJECTED") {
        toast.success("Réservation annulée.");
      } else if (newStatus === "APPROVED") {
        toast.success("Réservation approuvée !");
      } else if (newStatus === "PAID") {
        toast.success("Réservation marquée comme payée !");
      }
    } catch {
      setError("Impossible de mettre à jour le statut.");
    }
  };

  return (
    <div className="users_bookings_container">
      <h3 className="title">Page Administrateur Réservations</h3>
      <h4>Vue D&apos;Ensemble Des Réservations</h4>

      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : bookings.length === 0 ? (
        <div>Aucune réservation en attente pour le moment.</div>
      ) : (
        <table className="bookings_table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Utilisateur</th>
              <th>Service</th>
              <th>Image du Service</th>
              <th>Statut</th>
              <th>Créée le</th>
              <th>Réservée pour</th>
              <th>Expire le</th>
              <th>Montant Total (€)</th>
              <th>Approuvé par Admin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.user?.name || "Utilisateur inconnu"}</td>
                <td>{booking.service?.name || "Service inconnu"}</td>
                <td>
                  {booking.service?.imageUrl ? (
                    <Image
                      src={booking.service.imageUrl}
                      alt={`Image du service ${booking.service.name}`}
                      width={50}
                      height={50}
                      className="serviceImage"
                      loading="lazy"
                    />
                  ) : (
                    <span>Aucune image disponible</span>
                  )}
                </td>
                <td>{booking.status}</td>
                <td>
                  {format(
                    new Date(booking.createdAt),
                    "dd MMMM yyyy 'à' HH:mm",
                    { locale: fr }
                  )}
                </td>
                <td>
                  {booking.reservedAt
                    ? format(
                        new Date(booking.reservedAt),
                        "dd MMMM yyyy 'à' HH:mm",
                        { locale: fr }
                      )
                    : "Non spécifiée"}
                </td>
                <td>
                  {booking.expiresAt
                    ? format(
                        new Date(booking.expiresAt),
                        "dd MMMM yyyy 'à' HH:mm",
                        { locale: fr }
                      )
                    : "Non définie"}
                </td>
                <td>{booking.totalAmount} €</td>
                <td>{booking.approvedByAdmin ? "Oui" : "Non"}</td>
                <td>
                  {/* Affichage des boutons selon le statut */}
                  {booking.status === "PENDING" && (
                    <div>
                      <button
                        onClick={() =>
                          handleUpdateStatus(booking.id, "APPROVED")
                        }
                        className="approve-button"
                      >
                        ✅ Approuver
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(booking.id, "REJECTED")
                        }
                        className="reject-button"
                      >
                        ❌ Rejeter
                      </button>
                    </div>
                  )}
                  {booking.status === "APPROVED" && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id, "PAID")}
                      className="paid-button"
                    >
                      💰 Marquer comme payé
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UsersBookings;
