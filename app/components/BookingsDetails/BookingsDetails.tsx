"use client";

import BookingSummary from "../BookingSummary/BookingSummary";
import BookingForm from "../BookingForm/BookingForm";
import useBookingData from "../useBookingData/useBookingData";
import styles from "./styles.module.scss";

export default function MyBookingsPage() {
  const { booking, loading, error } = useBookingData();

  if (loading) return <p>Chargement...</p>;
  if (error || !booking) return <p>{error || "Réservation introuvable."}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.leftColumn}>
        <BookingSummary booking={booking} />
      </div>
      <div className={styles.rightColumn}>
        <BookingForm booking={booking} />
      </div>
    </div>
  );
}
