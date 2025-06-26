"use client";

import { useState } from "react";
import { updateBooking } from "@/actions/bookings";
import toast from "react-hot-toast";
import { Booking, BookingStatus } from "@/types";
import styles from "./styles.module.scss";

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
    <section>
      <div className={styles.panel}>
        <div className={styles.panelContainer}>
          <h1 className={styles.title}>Réservations en attente</h1>
          {bookings.length === 0 ? (
            <div className={styles.empty}>
              <p style={{ fontSize: "2.5rem" }}>🛳️</p>
              <p>Aucune réservation à afficher pour le moment.</p>
              <p>
                Les nouvelles réservations apparaîtront ici dès qu&apos;elles
                seront créées.
              </p>
            </div>
          ) : (
            <ul className={styles.list}>
              {bookings.map((booking) => {
                // Récupération des infos client/utilisateur
                const customerName =
                  booking.client?.fullName || booking.user?.name || "Client";
                const customerEmail =
                  booking.email ||
                  booking.client?.email ||
                  booking.user?.email ||
                  "";
                const customerPhone =
                  booking.client?.phoneNumber ||
                  booking.user?.phoneNumber ||
                  "";
                const isPaid =
                  booking.status === "PAID" ||
                  booking.paymentStatus === "PAID" ||
                  false;

                return (
                  <li key={booking.id} className={styles.item}>
                    <div className={styles.details}>
                      <p>
                        <strong>Nom :</strong> {customerName}
                      </p>
                      <p>
                        <strong>Email :</strong> {customerEmail}
                      </p>
                      {customerPhone && (
                        <p>
                          <strong>Téléphone :</strong> {customerPhone}
                        </p>
                      )}
                      <p>
                        <strong>Service :</strong>{" "}
                        {booking.service
                          ? booking.service.name
                          : "Non spécifié"}
                      </p>
                      <p>
                        <strong>Jour :</strong>{" "}
                        {booking.startTime
                          ? new Date(booking.startTime).toLocaleDateString(
                              "fr-FR",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Date inconnue"}
                      </p>
                      <p>
                        <strong>Horaires :</strong>{" "}
                        {booking.startTime
                          ? new Date(booking.startTime).toLocaleTimeString(
                              "fr-FR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "?"}
                        {" - "}
                        {booking.endTime
                          ? new Date(booking.endTime).toLocaleTimeString(
                              "fr-FR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "?"}
                      </p>
                      <p>
                        <strong>Statut :</strong> {booking.status}
                      </p>
                      <p>
                        <strong>Paiement :</strong>{" "}
                        {isPaid ? "✅ Payé" : "❌ Non payé"}
                      </p>
                    </div>
                    <div className={styles.actions}>
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
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminBookingsPanel;
