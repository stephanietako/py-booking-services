"use client";

import { FC, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { format, parseISO } from "date-fns";
import { Service } from "@/types";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { createBooking } from "@/actions/bookings"; // Reuse createBooking function from your project
import styles from "./styles.module.scss"; // Assumed stylesheet for styling

interface ConfirmBookingProps {
  service: Service; // Utilisation de "service" au lieu de "selectedService"
}

const ConfirmBooking: FC<ConfirmBookingProps> = ({ service }) => {
  const { user } = useUser(); // Access the user context from Clerk
  const router = useRouter();

  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null);
  const [isBooking, setIsBooking] = useState(false); // Handle booking state

  useEffect(() => {
    const selectedStartTimeFromLocalStorage =
      localStorage.getItem("selectedStartTime");
    const selectedEndTimeFromLocalStorage =
      localStorage.getItem("selectedEndTime");

    if (selectedStartTimeFromLocalStorage && selectedEndTimeFromLocalStorage) {
      const startTime = parseISO(selectedStartTimeFromLocalStorage);
      const endTime = parseISO(selectedEndTimeFromLocalStorage);

      setSelectedStartTime(startTime);
      setSelectedEndTime(endTime);

      // Dynamically calculate the total amount including any options
      const totalOptionAmount =
        service.options?.reduce((sum, option) => sum + option.amount, 0) || 0;
      setTotalAmount(service.amount + totalOptionAmount); // Total amount = base service + options
    }
  }, [service]); // Recalculate if the selected service changes

  const handleConfirm = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour réserver.");
      return;
    }

    if (!selectedStartTime || !selectedEndTime) {
      toast.error(
        "Veuillez sélectionner une heure de début et une heure de fin."
      );
      return;
    }

    // Prevent multiple bookings
    if (isBooking) {
      toast.error("Réservation en cours, veuillez patienter.");
      return;
    }

    setIsBooking(true); // Set booking in progress

    try {
      const startTimeFormatted = selectedStartTime.toISOString();
      const endTimeFormatted = selectedEndTime.toISOString();

      // Create booking using the already existing createBooking function
      await createBooking(
        user.id,
        service.id, // Utilisation de "service" ici
        format(selectedStartTime, "yyyy-MM-dd"),
        startTimeFormatted,
        endTimeFormatted
      );

      toast.success("Réservation réussie !");
      // Optionally, redirect to a confirmation page or other page
      router.push("/serviceList");
    } catch {
      toast.error("Erreur lors de la réservation.");
    } finally {
      setIsBooking(false); // Reset booking state
    }
  };

  return (
    <div className={styles.confirmBookingContainer}>
      <h2>Résumé de votre réservation</h2>
      <p>Service: {service.name}</p> {/* Changement ici */}
      <p>
        Date et heure:{" "}
        {selectedStartTime && selectedEndTime
          ? `${format(selectedStartTime, "kk:mm")} - ${format(selectedEndTime, "kk:mm")}`
          : "Non sélectionnées"}
      </p>
      <p>
        Prix estimé:{" "}
        {new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(totalAmount)}
      </p>
      <button onClick={handleConfirm} disabled={isBooking}>
        {isBooking ? "Réservation en cours..." : "Confirmer la réservation"}
      </button>
    </div>
  );
};

export default ConfirmBooking;
