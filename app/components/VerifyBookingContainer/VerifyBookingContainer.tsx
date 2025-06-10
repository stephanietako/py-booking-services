// VerifyBookingContainer.tsx
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
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");

    if (token) {
      fetch("/api/bookings/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const err = await response.json();
            throw new Error(
              err.error || "Erreur lors de la vérification du token."
            );
          }
          return response.json() as Promise<{ data: BookingWithDetails }>;
        })
        .then((data) => {
          setBookingDetails(data.data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setError("Token de vérification manquant dans l'URL.");
      setLoading(false);
    }
  }, []);

  const handleRequestBooking = async () => {
    if (
      bookingDetails?.id &&
      bookingDetails.client &&
      !isRequesting &&
      !requestSent
    ) {
      setIsRequesting(true);
      try {
        let stripeUrl: string | null = null;

        // 1. Créer le lien de paiement Stripe
        const createStripeLinkResponse = await fetch(
          `/api/admin/bookings/${bookingDetails.id}/payment-url`
        );

        if (createStripeLinkResponse.ok) {
          const { url } = await createStripeLinkResponse.json();
          stripeUrl = url;
        }

        // 2. Envoyer les détails de la réservation à l'administrateur (avec stripeUrl)
        const sendDetailsResponse = await fetch(
          `/api/admin/bookings/sendReservationDetails`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bookingId: String(bookingDetails.id),
              firstName: bookingDetails.client.fullName.split(" ")[0],
              lastName: bookingDetails.client.fullName
                .split(" ")
                .slice(1)
                .join(" "),
              email: bookingDetails.client.email,
              phoneNumber: bookingDetails.client.phoneNumber,
              reservationTime: new Date(
                bookingDetails.startTime
              ).toLocaleString("fr-FR"),
              stripeUrl,
              bookingOptions: bookingDetails.bookingOptions,
              withCaptain: bookingDetails.withCaptain,
              mealOption: bookingDetails.mealOption,
              boatAmount: bookingDetails.boatAmount,
              service: bookingDetails.service,
            }),
          }
        );

        if (sendDetailsResponse.ok) {
          toast.success(
            "Votre demande de réservation a été envoyée. Vous allez être redirigé vers le paiement.",
            { position: "top-center" }
          );

          setRequestSent(true);
          setIsRequesting(false);

          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        } else {
          toast.error(
            "Une erreur est survenue lors de l'envoi de votre demande.",
            { position: "top-center" }
          );
          setIsRequesting(false);
        }
      } catch (error) {
        toast.error("Erreur inattendue : " + error, {
          position: "top-center",
        });
        setIsRequesting(false);
      }
    }
  };

  const handleDeleteBooking = async () => {
    if (
      bookingDetails?.id &&
      window.confirm("Voulez-vous vraiment supprimer cette réservation ?")
    ) {
      try {
        const res = await fetch(`/api/admin/bookings/${bookingDetails.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toast.success("Réservation supprimée.", {
            position: "top-center",
          });
          window.location.href = "/";
        } else {
          toast.error("Erreur lors de la suppression.", {
            position: "top-center",
          });
        }
      } catch {
        toast.error("Erreur inattendue.", { position: "top-center" });
      }
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <p className={styles.errorMessage}>{error}</p>;
  }

  if (bookingDetails) {
    return (
      <BookingDetailsDisplay
        bookingDetails={bookingDetails}
        isRequesting={isRequesting}
        requestSent={requestSent}
        onRequestBooking={handleRequestBooking}
        onDeleteBooking={handleDeleteBooking}
      />
    );
  }

  return null;
}
