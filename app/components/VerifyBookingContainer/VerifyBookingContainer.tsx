// app/components/VerifyBookingContainer/VerifyBookingContainer.tsx
"use client";
import { useEffect, useState } from "react";
import { BookingWithDetails } from "@/types";
import { toast } from "react-hot-toast";
import Spinner from "@/app/components/Spinner/Spinner";
import BookingDetailsDisplay from "../BookingDetailsDisplay/BookingDetailsDisplay";
import styles from "./styles.module.scss";

export default function VerifyBookingContainer() {
  const [bookingDetails, setBookingDetails] =
    useState<BookingWithDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setError("Token de vérification manquant dans l'URL.");
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch("/api/bookings/verify-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (!res.ok)
          throw new Error(
            data.error || "Erreur lors de la vérification du token."
          );

        setBookingDetails(data.data);
        setLoading(false);
      } catch (err: unknown) {
        console.error("Erreur token:", err);
        setError((err as Error).message);
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const handleRequestBooking = async () => {
    if (
      !bookingDetails?.id ||
      !(bookingDetails.client || bookingDetails.user) ||
      isRequesting ||
      requestSent
    ) {
      return toast.error("Conditions invalides pour l'envoi.");
    }

    setIsRequesting(true);

    try {
      let stripeUrl: string | null = null;

      const fullName =
        bookingDetails.client?.fullName ||
        bookingDetails.user?.name ||
        "Nom inconnu";
      const email =
        bookingDetails.client?.email ||
        bookingDetails.user?.email ||
        "email@inconnu.com";
      const phoneNumber =
        bookingDetails.client?.phoneNumber ||
        bookingDetails.user?.phoneNumber ||
        "Non spécifié";

      const firstName = fullName.split(" ")[0];
      const lastName = fullName.split(" ").slice(1).join(" ") || "";

      const stripeRes = await fetch(
        `/api/bookings/${bookingDetails.id}/payment-url`
      );
      if (stripeRes.ok) {
        const { url } = await stripeRes.json();
        stripeUrl = url;
      }

      const sendDetailsRes = await fetch(
        `/api/admin/bookings/sendReservationDetails`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: String(bookingDetails.id),
            firstName,
            lastName,
            email,
            phoneNumber,
            reservationTime: new Date(bookingDetails.startTime).toLocaleString(
              "fr-FR"
            ),
            stripeUrl,
            bookingOptions: bookingDetails.bookingOptions,
            withCaptain: bookingDetails.withCaptain,
            mealOption: bookingDetails.mealOption,
            boatAmount: bookingDetails.boatAmount,
            service: bookingDetails.service,
          }),
        }
      );

      if (sendDetailsRes.ok) {
        toast.success("Demande envoyée. Redirection en cours...", {
          position: "top-center",
        });
        setRequestSent(true);
        setTimeout(() => (window.location.href = "/"), 3000);
      } else {
        const err = await sendDetailsRes.json();
        console.error("Erreur:", err);
        toast.error("Erreur envoi email admin: " + err.message, {
          position: "top-center",
        });
        setIsRequesting(false);
      }
    } catch (error: unknown) {
      console.error("Erreur:", error);
      toast.error("Erreur inattendue : " + (error as Error).message, {
        position: "top-center",
      });
      setIsRequesting(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (
      bookingDetails?.id &&
      window.confirm("Voulez-vous vraiment supprimer cette réservation ?")
    ) {
      const res = await fetch(`/api/admin/bookings/${bookingDetails.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Réservation supprimée.", { position: "top-center" });
        window.location.href = "/";
      } else {
        toast.error("Erreur lors de la suppression.", {
          position: "top-center",
        });
      }
    }
  };

  if (loading) return <Spinner />;
  if (error) return <p className={styles.errorMessage}>{error}</p>;

  return bookingDetails ? (
    <BookingDetailsDisplay
      bookingDetails={bookingDetails}
      isRequesting={isRequesting}
      requestSent={requestSent}
      onRequestBooking={handleRequestBooking}
      onDeleteBooking={handleDeleteBooking}
    />
  ) : null;
}
