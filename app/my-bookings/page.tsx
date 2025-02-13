//app/my-bookings

"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getUserBookings, deleteUserBooking } from "@/actions/bookings";
import { Booking } from "@/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Wrapper from "../components/Wrapper/Wrapper";
import TransactionManager from "../components/TransactionManager/TransactionManager";
import ServiceCompt from "../components/ServicesCompt/ServiceCompt";
// Liste des réservations utilisateur
const MyBookings = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [totalAmounts, setTotalAmounts] = useState<{ [key: string]: number }>(
    {}
  );

  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await getUserBookings(user.id);
        console.log("Réservations récupérées :", data); // Vérifie si des réservations sont bien retournées
        setBookings(data);
      } catch (error) {
        console.error("Erreur lors du chargement des réservations :", error);
        setError("Impossible de charger les réservations.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleTotalUpdate = (bookingId: string, total: number) => {
    setTotalAmounts((prev) => ({ ...prev, [bookingId]: total }));
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!user) {
      toast.error("Utilisateur non authentifié.");
      return;
    }

    const confirmation = confirm(
      "Voulez-vous vraiment annuler cette réservation ?"
    );
    if (!confirmation) return;

    setDeleting(bookingId);
    const toastId = toast.loading("Annulation en cours...");

    try {
      await deleteUserBooking(bookingId, user.id);
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
      toast.success("Réservation annulée avec succès !", { id: toastId });
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
      toast.error("Impossible d'annuler la réservation.", { id: toastId });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Wrapper>
      <div>
        <h1>Mes réservations</h1>

        {loading && <p>Chargement en cours...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && bookings.length === 0 && <p>Aucune réservation</p>}

        {!loading && bookings.length > 0 && (
          <ul>
            {bookings.map((booking) => (
              <li key={booking.id}>
                {/* ✅ Passer totalAmount au lieu de booking.service.amount */}

                <ServiceCompt
                  name={booking.service.name}
                  description={
                    booking.service.description ||
                    "Aucune description disponible"
                  } // 🔥 Évite null
                  amount={totalAmounts[booking.id] ?? booking.service.amount}
                  imageUrl={booking.service.imageUrl || "/assets/default.jpg"}
                  categories={booking.service.categories}
                />

                {/* ✅ TransactionManager met à jour totalAmount */}
                <TransactionManager
                  bookingId={booking.id}
                  serviceAmount={booking.service.amount}
                  onTotalUpdate={(total) =>
                    handleTotalUpdate(booking.id, total)
                  }
                />
                <button
                  onClick={() => handleDeleteBooking(booking.id)}
                  disabled={deleting === booking.id}
                >
                  {deleting === booking.id ? "Annulation..." : "Annuler"}
                </button>

                <button
                  onClick={() => router.push(`/manage-booking/${booking.id}`)}
                >
                  Voir la réservation
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Wrapper>
  );
};

export default MyBookings;
// Affiche une liste des réservations de l'utilisateur. Lorsque l'utilisateur clique sur le bouton "Voir la réservation", il est redirigé vers ManageBookingPage en passant l'ID de la réservation dans l'URL.
