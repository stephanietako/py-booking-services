// components/Booking/BookingList.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { BookingWithDetails } from "@/types";
import styles from "./styles.module.scss";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente de validation",
  APPROVED: "Réservations approuvées",
  REJECTED: "Réservations refusées",
  CANCELLED: "Réservations annulées",
};

const BOOKINGS_PER_PAGE = 5;

export default function BookingList() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/bookings/profile");
        if (!res.ok)
          throw new Error("Erreur lors du chargement des réservations");

        const data: BookingWithDetails[] = await res.json();

        const parsed = data.map((booking) => ({
          ...booking,
          startTime: new Date(booking.startTime),
          endTime: new Date(booking.endTime),
        }));

        setBookings(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings;

    if (filterStatus === "PAID_PAYMENT") {
      filtered = bookings.filter((b) => b.paymentStatus === "PAID");
    } else if (filterStatus !== "ALL") {
      filtered = bookings.filter((b) => b.status === filterStatus);
    }

    const sorted = filtered.sort((a, b) =>
      sortAsc
        ? a.startTime.getTime() - b.startTime.getTime()
        : b.startTime.getTime() - a.startTime.getTime()
    );

    return sorted;
  }, [bookings, filterStatus, sortAsc]);

  const totalPages = Math.ceil(
    filteredAndSortedBookings.length / BOOKINGS_PER_PAGE
  );
  const currentBookings = filteredAndSortedBookings.slice(
    (currentPage - 1) * BOOKINGS_PER_PAGE,
    currentPage * BOOKINGS_PER_PAGE
  );

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) return <p>Chargement des réservations...</p>;
  if (error) return <p className={styles.error}>Erreur : {error}</p>;

  return (
    <>
      <span className={styles.title}>
        <h2>Mes réservations</h2>
      </span>

      <div className={styles.controls}>
        <label>
          Filtrer par statut :{" "}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">Tous</option>
            <option value="PAID_PAYMENT">Réservations payées</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={() => setSortAsc((asc) => !asc)}
          style={{ marginLeft: "1em" }}
          aria-label="Trier par date"
        >
          Trier par date : {sortAsc ? "Ascendant" : "Descendant"}
        </button>
      </div>

      <div className={styles.bookings}>
        {currentBookings.length === 0 ? (
          <p>Aucune réservation.</p>
        ) : (
          <ul className={styles.bookingList}>
            {currentBookings.map((booking) => {
              const currency = booking.service?.currency || "EUR";
              const captainPrice = booking.service?.captainPrice ?? 350;

              const totalOptions = booking.bookingOptions.reduce(
                (sum, opt) => sum + opt.option.unitPrice * opt.quantity,
                0
              );

              const captainCost =
                booking.withCaptain === false ? captainPrice : 0;

              const totalBookingAmount =
                booking.boatAmount + captainCost + totalOptions;

              return (
                <li key={booking.id} className={styles.bookingItem}>
                  <p>
                    <strong>Service:</strong> {booking.service?.name || "—"}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {booking.startTime.toLocaleDateString("fr-FR", {
                      dateStyle: "long",
                    })}
                  </p>

                  <p>
                    <strong>Heure:</strong>{" "}
                    {booking.startTime.toLocaleTimeString("fr-FR")} -{" "}
                    {booking.endTime.toLocaleTimeString("fr-FR")}
                  </p>

                  <p>
                    <strong>Statut:</strong>{" "}
                    {STATUS_LABELS[booking.status] || booking.status}
                  </p>

                  <p>
                    <strong>Paiement :</strong>{" "}
                    <span
                      className={
                        booking.paymentStatus === "PAID"
                          ? styles.paid
                          : styles.unpaid
                      }
                    >
                      {booking.paymentStatus === "PAID"
                        ? "Payé ✅"
                        : "Non payé ❌"}
                    </span>
                  </p>

                  <p>
                    <strong>Montant bateau:</strong>{" "}
                    {booking.boatAmount.toLocaleString("fr-FR", {
                      style: "currency",
                      currency,
                    })}
                  </p>

                  {booking.withCaptain === false && (
                    <p>
                      <strong>Capitaine :</strong>{" "}
                      {captainPrice.toLocaleString("fr-FR", {
                        style: "currency",
                        currency,
                      })}
                    </p>
                  )}

                  {booking.description && (
                    <p>
                      <strong>Note:</strong> {booking.description}
                    </p>
                  )}

                  {booking.bookingOptions.length > 0 && (
                    <>
                      <strong>Options:</strong>
                      <ul>
                        {booking.bookingOptions.map((opt) => (
                          <li key={opt.id}>
                            {opt.option.label} x {opt.quantity} —{" "}
                            {(
                              opt.option.unitPrice * opt.quantity
                            ).toLocaleString("fr-FR", {
                              style: "currency",
                              currency,
                            })}
                          </li>
                        ))}
                      </ul>

                      <p>
                        <strong>Total options:</strong>{" "}
                        {totalOptions.toLocaleString("fr-FR", {
                          style: "currency",
                          currency,
                        })}
                      </p>
                    </>
                  )}

                  <p className={styles.totalBookingAmount}>
                    <strong>Montant total réservation :</strong>{" "}
                    {totalBookingAmount.toLocaleString("fr-FR", {
                      style: "currency",
                      currency,
                    })}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        {totalPages > 1 && (
          <nav
            className={styles.pagination}
            aria-label="Pagination des réservations"
          >
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Page précédente"
            >
              &lt; Précédent
            </button>

            <span>
              Page {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Page suivante"
            >
              Suivant &gt;
            </button>
          </nav>
        )}
      </div>
    </>
  );
}
