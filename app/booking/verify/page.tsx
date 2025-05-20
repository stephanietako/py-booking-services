// app/booking/verify/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Booking, Service, BookingOption, Client } from "@/types";
import styles from "./styles.module.scss";
import { toast } from "react-hot-toast";

export interface BookingWithDetails extends Booking {
  service: Service;
  bookingOptions: (BookingOption & {
    option: { unitPrice: number; label: string; payableAtBoard: boolean };
  })[];
  client: Client | null;
  mealOption: boolean;
}

export default function VerifyBooking() {
  const [bookingDetails, setBookingDetails] =
    useState<BookingWithDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  console.log("Rendu de VerifyBooking avec bookingDetails :", bookingDetails);

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
            console.error("Erreur lors de la vérification du token :", err);
            throw new Error(
              err.error || "Erreur lors de la vérification du token."
            );
          }
          return response.json() as Promise<{ data: BookingWithDetails }>;
        })
        .then((data) => {
          console.log("Données de la réservation reçues :", data);
          setBookingDetails(data.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Erreur lors du traitement de la réponse :", err);
          setError(err.message);
          setLoading(false);
        });
    } else {
      setError("Token de vérification manquant dans l'URL.");
      setLoading(false);
    }
  }, []);

  const handleRequestBooking = async () => {
    if (bookingDetails?.id && bookingDetails.client && !isRequesting) {
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
          console.log("Lien Stripe généré :", stripeUrl);
        } else {
          console.warn("⚠️ Échec de la génération du lien Stripe.");
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
              stripeUrl, // ✅ Ajout ici
            }),
          }
        );

        // 3. Envoyer l'email de confirmation de réception au client
        const sendConfirmationResponse = await fetch(
          `/api/send-request-confirmation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bookingId: bookingDetails.id,
              clientEmail: bookingDetails.client.email,
              clientName: bookingDetails.client.fullName,
            }),
          }
        );

        // 4. Afficher les toasts et rediriger si besoin
        if (sendDetailsResponse.ok && sendConfirmationResponse.ok) {
          toast.success(
            "Votre demande de réservation a été envoyée. Vous allez être redirigé vers le paiement.",
            { position: "top-center" }
          );

          // // ✅ Ouvrir Stripe dans un nouvel onglet si le lien existe
          // if (stripeUrl) {
          //   window.open(stripeUrl, "_blank");
          // }
        } else {
          toast.error(
            "Une erreur est survenue lors de l'envoi de votre demande.",
            { position: "top-center" }
          );
        }
      } catch (error) {
        toast.error("Erreur inattendue : " + error, {
          position: "top-center",
        });
      } finally {
        setIsRequesting(false);
      }
    }
  };

  if (loading) {
    return <p className={styles.loadingMessage}>Vérification en cours...</p>;
  }

  if (error) {
    return <p className={styles.errorMessage}>{error}</p>;
  }

  if (bookingDetails) {
    console.log(
      "Structure complète de bookingDetails dans le rendu :",
      bookingDetails
    );

    const totalPayableOnBoard = bookingDetails.bookingOptions.reduce(
      (sum, bookingOption) =>
        bookingOption.option.payableAtBoard
          ? sum + bookingOption.quantity * bookingOption.option.unitPrice
          : sum,
      0
    );

    const captainPrice = 350;
    const isWithCaptain = bookingDetails.withCaptain; // True si le capitaine EST inclus dans les détails de la réservation
    let finalTotalAmount = bookingDetails.boatAmount + totalPayableOnBoard;
    let captainIncluded = false;
    const mealOptionSelected = bookingDetails.mealOption;

    if (isWithCaptain) {
      captainIncluded = true;
    } else {
      finalTotalAmount += captainPrice;
    }

    return (
      <div className={styles.bookingDetailsContainer}>
        <h1 className={styles.title}>Réservation Vérifiée !</h1>
        <div className={styles.twoColumns}>
          <div className={styles.leftBlock}>
            <p>
              <span className={styles.label}>ID de la réservation :</span>{" "}
              <span className={styles.value}>{bookingDetails.id}</span>
            </p>
            {bookingDetails.service && (
              <p>
                <span className={styles.label}>Service :</span>{" "}
                <span className={styles.value}>
                  {bookingDetails.service.name}
                </span>
              </p>
            )}
            <p>
              <span className={styles.label}>Début :</span>{" "}
              <span className={styles.value}>
                {bookingDetails.startTime
                  ? new Date(bookingDetails.startTime).toLocaleString("fr-FR", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })
                  : "Date de début invalide"}
              </span>
            </p>
            <p>
              <span className={styles.label}>Fin :</span>{" "}
              <span className={styles.value}>
                {bookingDetails.endTime
                  ? new Date(bookingDetails.endTime).toLocaleString("fr-FR", {
                      timeStyle: "short",
                    })
                  : "Date de fin invalide"}
              </span>
            </p>
            <p>
              <span className={styles.label}>
                Prix de la location du bateau :
              </span>{" "}
              <span className={styles.value}>
                {typeof bookingDetails.boatAmount === "number"
                  ? new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: bookingDetails.service?.currency || "EUR",
                    }).format(bookingDetails.boatAmount)
                  : "Prix de location invalide"}
              </span>
            </p>
            <p>
              <span className={styles.label}>État de la réservation :</span>{" "}
              <span className={styles.value}>{bookingDetails.status}</span>
            </p>
            <p>
              <span className={styles.label}>Capitaine inclus :</span>{" "}
              <span className={styles.value}>
                {captainIncluded ? "Oui" : "Non"}
              </span>
            </p>
            {!isWithCaptain && (
              <p className={styles.captainPrice}>
                <span className={styles.label}>Prix du capitaine :</span>{" "}
                <span className={styles.value}>
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: bookingDetails.service?.currency || "EUR",
                  }).format(captainPrice)}
                </span>
              </p>
            )}
            <p>
              <span className={styles.label}>Repas traiteur demandé :</span>{" "}
              <span className={styles.value}>
                {mealOptionSelected ? "Oui" : "Non"}
              </span>
            </p>
          </div>
          <div className={styles.rightBlock}>
            {bookingDetails.client && (
              <div className={styles.clientInfo}>
                <h3 className={styles.sectionTitle}>Informations Client</h3>
                <p>
                  <span className={styles.label}>Nom :</span>{" "}
                  <span className={styles.value}>
                    {bookingDetails.client.fullName}
                  </span>
                </p>
                <p>
                  <span className={styles.label}>Email :</span>{" "}
                  <span className={styles.value}>
                    {bookingDetails.client.email}
                  </span>
                </p>
                <p>
                  <span className={styles.label}>Téléphone :</span>{" "}
                  <span className={styles.value}>
                    {bookingDetails.client.phoneNumber}
                  </span>
                </p>
              </div>
            )}
            {bookingDetails.bookingOptions &&
              bookingDetails.bookingOptions.length > 0 && (
                <div className={styles.optionsSelected}>
                  <h3 className={styles.sectionTitle}>
                    Options Sélectionnées (paiement à bord)
                  </h3>
                  <ul className={styles.optionsList}>
                    {bookingDetails.bookingOptions.map((bookingOption) => (
                      <li key={bookingOption.id}>
                        {bookingOption.option.label} x {bookingOption.quantity}{" "}
                        ({" "}
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: bookingDetails.service?.currency || "EUR",
                        }).format(bookingOption.option.unitPrice)}
                        /unité )
                      </li>
                    ))}
                  </ul>
                  <p>
                    <span className={styles.label}>
                      Montant total des options à payer à bord :
                    </span>{" "}
                    <span className={styles.value}>
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: bookingDetails.service?.currency || "EUR",
                      }).format(totalPayableOnBoard)}
                    </span>
                  </p>
                </div>
              )}
            <p className={styles.totalAmount}>
              <span className={styles.label}>Montant total à payer :</span>{" "}
              <span className={styles.value}>
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: bookingDetails.service?.currency || "EUR",
                }).format(finalTotalAmount)}
              </span>
            </p>

            {bookingDetails.userId && (
              <div className={styles.userInfo}>
                <h3 className={styles.sectionTitle}>
                  Informations Utilisateur (si connecté)
                </h3>
                <p>
                  <span className={styles.label}>ID Utilisateur :</span>{" "}
                  <span className={styles.value}>{bookingDetails.userId}</span>
                </p>
              </div>
            )}
            {!bookingDetails.stripePaymentLink && (
              <p className={styles.paymentNote}>
                Le lien de paiement en ligne vous sera envoyé prochainement par
                l&apos;administrateur.
              </p>
            )}
          </div>
        </div>
        <button
          className={styles.requestButton}
          onClick={handleRequestBooking}
          disabled={isRequesting}
        >
          {isRequesting ? "Demande en cours..." : "Demande de Réservation"}
        </button>
      </div>
    );
  }

  return null;
}
