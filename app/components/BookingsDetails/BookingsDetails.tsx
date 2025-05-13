"use client";

import BookingSummary from "../BookingSummary/BookingSummary";
import BookingForm from "../BookingForm/BookingForm";
import useBookingData from "../useBookingData/useBookingData";
import { generateInvoice } from "@/lib/pdf/generateInvoice";

import styles from "./styles.module.scss";

export default function MyBookingsPage() {
  const { booking, loading, error } = useBookingData();

  if (loading) return <p>Chargement...</p>;
  if (error || !booking) return <p>{error || "Réservation introuvable."}</p>;
  const handleDownloadPDF = async () => {
    const pdfBytes = await generateInvoice(booking);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `facture-reservation-${booking.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <BookingSummary booking={booking} />
        </div>
        <div className={styles.rightColumn}>
          <BookingForm booking={booking} />
        </div>
      </div>
      <button onClick={handleDownloadPDF} className={styles.downloadBtn}>
        Télécharger la facture PDF
      </button>
    </>
  );
}
