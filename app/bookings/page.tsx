"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { deleteUserBooking, getUserBookings } from "@/actions/bookings";
import { Booking } from "@/types";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      setLoading(true); // Active le chargement
      try {
        const data = await getUserBookings(user.id);
        setBookings(data);
      } catch (error) {
        console.error("Erreur lors du chargement des réservations :", error);
        setError("Impossible de charger les réservations.");
      } finally {
        setLoading(false); // Désactive le chargement
      }
    };

    fetchBookings();
  }, [user]);
  ////////////////
  const handleDeleteBooking = async (serviceId: string) => {
    if (!user) return;
    if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

    setDeleting(serviceId);
    const toastId = toast.loading("Annulation en cours...");

    try {
      await deleteUserBooking(user.id, serviceId);

      // Mise à jour locale après suppression
      setBookings((prev) =>
        prev.filter((booking) => booking.serviceId !== serviceId)
      );

      toast.success("Réservation annulée avec succès !", { id: toastId });
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
      toast.error("Impossible d'annuler la réservation.", { id: toastId });
    } finally {
      setDeleting(null);
    }
  };
  return (
    <div>
      <h1>Mes réservations</h1>

      {/* Affichage du message de chargement */}
      {loading && <p>Chargement en cours...</p>}

      {/* Gestion des erreurs */}
      {error && <p className="error">{error}</p>}

      {/* Affichage des réservations une fois le chargement terminé */}
      {!loading && bookings.length === 0 && <p>Aucune réservation</p>}

      {!loading && bookings.length > 0 && (
        <ul>
          {bookings.map((booking) => (
            <li key={booking.id}>
              <p>Service: {booking.service.name}</p>
              <p>
                Date de réservation:{" "}
                {new Date(booking.createdAt).toLocaleString()}
              </p>
              <button
                onClick={() => handleDeleteBooking(booking.id)}
                disabled={deleting === booking.id} // Désactive le bouton si en cours
              >
                {deleting === booking.id ? "Annulation..." : "Annuler"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyBookings;
