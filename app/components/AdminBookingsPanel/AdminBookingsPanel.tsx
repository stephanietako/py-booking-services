"use client";

import { useState, useMemo } from "react";
import { updateBooking } from "@/actions/bookings";
import toast from "react-hot-toast";
import { Booking, BookingStatus } from "@/types";
import styles from "./styles.module.scss";

interface AdminBookingsPanelProps {
  bookings: Booking[];
}

const months = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  APPROVED: "Validée",
  REJECTED: "Refusée",
  PAID: "Payée",
  CANCELLED: "Annulée",
};

const AdminBookingsPanel: React.FC<AdminBookingsPanelProps> = ({
  bookings,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | "">("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");

  // Récupère toutes les années présentes dans les réservations
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const end = 2030;
    const arr = [];
    for (let y = end; y >= current; y--) {
      arr.push(y);
    }
    return arr;
  }, []);

  // Trie et filtre les réservations
  const filteredBookings = useMemo(() => {
    let sorted = [...bookings].sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    // Si aucun filtre, on affiche seulement les 10 dernières
    if (selectedMonth === "" && selectedYear === "") {
      return sorted.slice(0, 10);
    }
    // Sinon, on filtre comme avant
    if (selectedMonth !== "" && selectedYear !== "") {
      sorted = sorted.filter((b) => {
        const d = new Date(b.startTime);
        return (
          d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
        );
      });
    } else if (selectedYear !== "") {
      sorted = sorted.filter(
        (b) => new Date(b.startTime).getFullYear() === selectedYear
      );
    }
    return sorted;
  }, [bookings, selectedMonth, selectedYear]);

  // Mettre à jour le statut de la réservation
  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: BookingStatus
  ) => {
    if (loading) return;
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
          <h1 className={styles.title}>Réservations</h1>
          <div
            className={styles.filters}
            style={{
              marginBottom: "1.5rem",
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <label>
              Mois&nbsp;
              <select
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              >
                <option value="">Tous</option>
                {months.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Année&nbsp;
              <select
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              >
                <option value="">Toutes</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {selectedMonth === "" && selectedYear === "" && (
            <div style={{ marginBottom: "1rem", color: "#888" }}>
              Affichage des 10 dernières réservations
            </div>
          )}
          {filteredBookings.length === 0 ? (
            <div className={styles.empty}>
              <p style={{ fontSize: "2.5rem" }}>🛳️</p>
              <p>Aucune réservation à afficher pour cette période.</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {filteredBookings.map((booking) => {
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
                        <strong>Statut :</strong>{" "}
                        <span
                          className={`${styles.status} ${styles[styles[booking.status.toLowerCase()] ? booking.status.toLowerCase() : "pending"]}`}
                        >
                          {statusLabels[booking.status] || booking.status}
                        </span>
                      </p>
                      <p>
                        <strong>Paiement :</strong>{" "}
                        {isPaid ? "✅ Payé" : "❌ Non payé"}
                      </p>
                      <p>
                        <strong>Montant bateau :</strong>{" "}
                        {booking.boatAmount
                          ? new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: booking.service?.currency || "EUR",
                            }).format(booking.boatAmount)
                          : "-"}
                      </p>
                      <p>
                        <strong>Montant options :</strong>{" "}
                        {booking.payableOnBoard
                          ? new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: booking.service?.currency || "EUR",
                            }).format(booking.payableOnBoard)
                          : "-"}
                      </p>
                      <p>
                        <strong>Montant total :</strong>{" "}
                        {booking.totalAmount
                          ? new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: booking.service?.currency || "EUR",
                            }).format(booking.totalAmount)
                          : "-"}
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
