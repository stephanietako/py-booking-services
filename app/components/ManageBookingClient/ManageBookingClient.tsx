/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { FC, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  deleteUserBooking,
  getBookingById,
  getBookingIdFromToken,
  updateBooking,
} from "@/actions/bookings";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import ServiceCompt from "@/app/components/ServicesCompt/ServiceCompt";
import { Booking } from "@/types";
import { createStripeCheckoutSession } from "@/actions/actionsStripe";

// Styles
import styles from "./styles.module.scss"; // Import du fichier SCSS
import Spinner from "../Spinner/Spinner";

const ManageBookingClient: FC = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isRequestingConfirmation, setIsRequestingConfirmation] =
    useState<boolean>(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");
  const [deleting, setDeleting] = useState<boolean>(false);
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(false);

  useEffect(() => {
    if (localStorage.getItem("paymentStatus") === "paid") {
      setIsPaying(true);
      localStorage.setItem("paymentStatus", "paid");
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = searchParams.get("token");
        const bookingId = token ? await getBookingIdFromToken(token) : null;

        if (!bookingId) {
          throw new Error("Identifiant de réservation invalide");
        }

        const { booking } = await getBookingById(bookingId, user.id);
        setBooking(booking);
        setTotalAmount(booking.totalAmount || 0);

        if (booking.status === "PAID") {
          setIsPaid(true);
        }
      } catch (error) {
        console.error("Erreur de chargement", error);
        setError(error instanceof Error ? error.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, isSignedIn, searchParams, user?.id]);

  if (loading)
    return (
      <Wrapper>
        <Spinner />
      </Wrapper>
    );
  if (error)
    return (
      <Wrapper>
        <p className={styles.error}>{error}</p>
      </Wrapper>
    );
  if (!booking)
    return (
      <Wrapper>
        <p className={styles.not_found}>Réservation introuvable.</p>
      </Wrapper>
    );

  const handleRequestConfirmation = async () => {
    if (!user) {
      toast.error("Vous devez être connecté.");
      return;
    }

    setIsRequestingConfirmation(true);
    const toastId = toast.loading("Envoi de la demande...");

    try {
      const response = await fetch("/api/bookings/request-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, userId: user.id }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Erreur inconnue");

      toast.success(result.message, { id: toastId });
      setBooking((prev) => (prev ? { ...prev, status: "PENDING" } : prev));
      setConfirmationMessage(
        "Votre réservation est en attente de confirmation."
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur inconnue", {
        id: toastId,
      });
    } finally {
      setIsRequestingConfirmation(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!user || !booking?.id) return;

    const confirmation = window.confirm(
      "Voulez-vous vraiment annuler cette réservation ?"
    );
    if (!confirmation) return;

    setDeleting(true);
    const toastId = toast.loading("Annulation en cours...");

    try {
      await deleteUserBooking(booking.id, user.id);
      router.push("/my-bookings");
      toast.success("Réservation annulée avec succès !", { id: toastId });
    } catch {
      toast.error("Impossible d'annuler la réservation.", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  const handlePayNow = async () => {
    if (!booking || !booking.stripeCustomerId) {
      toast.error("Informations de paiement incomplètes");
      return;
    }

    try {
      const sessionUrl = await createStripeCheckoutSession(
        booking.stripeCustomerId,
        totalAmount,
        "eur",
        booking.service.name,
        window.location.origin,
        booking.id
      );

      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        throw new Error("Session URL is null.");
      }

      await updateBooking(booking.id, "PAID");
      setIsPaid(true);
      toast.success("Paiement effectué avec succès !");
    } catch {
      toast.error("Erreur lors du paiement");
    }
  };

  return (
    <Wrapper>
      <section>
        <div className={styles.manage_booking}>
          <div className={styles.manage_booking_container}>
            <div className={styles.manage_booking__bloc_left}>
              <div className={styles.logo_title_wrapper}>
                <div className={styles.logo_container}>
                  <Image
                    src="/assets/logo/hippo.png"
                    alt="Logo"
                    width={100}
                    height={110}
                  />
                </div>
                <h3 className={styles.title}>Ma réservation</h3>
              </div>
              <span className={styles.manage_booking__text}>
                <p>Voici votre réservation, vous avez un imprévu ?</p>
                <p>
                  Pas de souci ! Vous pouvez demander la confirmation de votre
                  réservation ici.
                </p>
                <p>
                  Une fois confirmée, elle sera en attente de validation par
                  l&apos;administrateur.
                </p>
              </span>
            </div>
            <div className={styles.manage_booking__bloc_right}>
              <ServiceCompt
                name={booking.service.name}
                description={
                  booking.service.description || "Aucune description disponible"
                }
                imageUrl={
                  booking.service.imageUrl || "/assets/logo/logo-full.png"
                }
                categories={booking.service.categories}
                startTime={booking.startTime}
                endTime={booking.endTime}
                options={booking.options || []}
                totalAmount={totalAmount}
              />
              <span className={styles.manage_booking__btn}>
                <button
                  onClick={handleDeleteBooking}
                  className={styles.btn_form}
                  disabled={deleting}
                >
                  {deleting
                    ? "Annulation en cours..."
                    : "Annuler la réservation"}
                </button>

                {confirmationMessage && (
                  <div className={styles.confirmation_message}>
                    {confirmationMessage}
                  </div>
                )}

                {booking.status === "PENDING" &&
                  !booking.approvedByAdmin &&
                  !confirmationMessage && (
                    <button
                      onClick={handleRequestConfirmation}
                      disabled={isRequestingConfirmation}
                    >
                      {isRequestingConfirmation
                        ? "Demande en cours..."
                        : "Demander confirmation"}
                    </button>
                  )}

                {booking.approvedByAdmin && !isPaid ? (
                  <>
                    <p>✅ Réservation approuvée</p>
                    <button onClick={handlePayNow} className={styles.btn_form}>
                      Payer maintenant
                    </button>
                  </>
                ) : isPaid ? (
                  <p>✅ Paiement effectué. Merci de votre paiement !</p>
                ) : null}
              </span>
            </div>
          </div>
        </div>
      </section>
    </Wrapper>
  );
};

export default ManageBookingClient;
