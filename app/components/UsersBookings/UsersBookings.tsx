"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Booking } from "@/types";
import { getAllBookings, updateBookingTotal } from "@/actions/bookings";
import Image from "next/image";

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
              <th>Date et Heure de Réservation</th>
              <th>Date d&apos;Expiration</th>
              <th>Montant Total (€)</th>
              <th>Approuvé par Admin</th>
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
                <td>{new Date(booking.createdAt).toLocaleString()}</td>
                <td>
                  {booking.expiresAt
                    ? new Date(booking.expiresAt).toLocaleString()
                    : "Date d'expiration non disponible"}
                </td>
                <td>{booking.totalAmount} €</td>
                <td>{booking.approvedByAdmin ? "Oui" : "Non"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UsersBookings;
