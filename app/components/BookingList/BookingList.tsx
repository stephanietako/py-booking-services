// components/Booking/BookingList.tsx
"use client";

import React, { useEffect, useState } from "react";
import { BookingWithDetails } from "@/types";
import styles from "./styles.module.scss";

export default function BookingList() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/bookings/profile`);
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
    }

    fetchBookings();
  }, []);

  return (
    <>
      <span className={styles.title}>
        {" "}
        <h2>Mes réservations</h2>
      </span>

      <div className={styles.bookings}>
        {loading && <p>Chargement des réservations...</p>}
        {error && <p className={styles.error}>Erreur : {error}</p>}
        {!loading && bookings.length === 0 && <p>Aucune réservation.</p>}

        <ul className={styles.bookingList}>
          {bookings.map((booking) => {
            const totalOptions = booking.bookingOptions.reduce(
              (sum, opt) =>
                sum + (Number(opt.option.unitPrice) || 0) * (opt.quantity || 0),
              0
            );

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
                  <strong>Statut:</strong> {booking.status}
                </p>

                <p>
                  <strong>Montant bateau:</strong>{" "}
                  {booking.boatAmount.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: booking.service?.currency || "EUR",
                  })}
                </p>

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
                          {(opt.option.unitPrice * opt.quantity).toLocaleString(
                            "fr-FR",
                            {
                              style: "currency",
                              currency: booking.service?.currency || "EUR",
                            }
                          )}
                        </li>
                      ))}
                    </ul>
                    <p>
                      <strong>Total options:</strong>{" "}
                      {totalOptions.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: booking.service?.currency || "EUR",
                      })}
                    </p>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
