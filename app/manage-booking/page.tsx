"use client";

import React, { FC, useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import {
  deleteUserBooking,
  getBookingById,
  getBookingIdFromToken,
  updateBooking,
} from "@/actions/bookings";
import { createStripeCheckoutSession } from "@/actions/actionsStripe";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import ServiceCompt from "@/app/components/ServicesCompt/ServiceCompt";
import { Booking } from "@/types";

export const dynamic = "force-dynamic";

const ManageBookingPage: FC = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isRequestingConfirmation, setIsRequestingConfirmation] =
    useState<boolean>(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");
  const [deleting, setDeleting] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPaying, setIsPaying] = useState<boolean>(false); // Ajout de l'état isPaying
  const [isPaid, setIsPaid] = useState<boolean>(false);

  // Vérifier si le paiement a déjà été effectué
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
        const bookingId = token ? await getBookingIdFromToken(token) : id;

        if (!bookingId) {
          throw new Error("Identifiant de réservation invalide");
        }

        const { booking } = await getBookingById(bookingId, user.id);
        setBooking(booking);
        setTotalAmount(booking.totalAmount || 0);

        // Vérifier si la réservation est déjà payée
        if (booking.status === "PAID") {
          setIsPaid(true); // Marquer comme payé si c'est déjà le cas
        }
      } catch (error) {
        console.error("Erreur de chargement", error);
        setError(error instanceof Error ? error.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, isSignedIn, searchParams, id, user?.id]);

  if (loading)
    return (
      <Wrapper>
        <p>Chargement...</p>
      </Wrapper>
    );
  if (error)
    return (
      <Wrapper>
        <p className="error">{error}</p>
      </Wrapper>
    );
  if (!booking)
    return (
      <Wrapper>
        <p>Réservation introuvable.</p>
      </Wrapper>
    );

  const handleRequestConfirmation = async () => {
    console.log("📩 Tentative d'envoi d'email...");

    if (!user) {
      console.error("⛔ Utilisateur non connecté !");
      toast.error("Vous devez être connecté.");
      return;
    }

    console.log("📌 Booking ID :", booking.id);
    console.log("📌 Clerk User ID :", user.id);

    setIsRequestingConfirmation(true);
    const toastId = toast.loading("Envoi de la demande...");

    try {
      const response = await fetch("/api/bookings/request-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, userId: user.id }),
      });

      const result = await response.json();

      console.log("✅ Réponse API :", result);

      if (!response.ok) throw new Error(result.error || "Erreur inconnue");

      toast.success(result.message, { id: toastId });

      setBooking((prev) => (prev ? { ...prev, status: "PENDING" } : prev));
      setConfirmationMessage(
        "Votre réservation est en attente de confirmation."
      );
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de l'email :", error);
      toast.error(error || "Erreur inconnue", { id: toastId });
    } finally {
      setIsRequestingConfirmation(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!user) {
      setError("Vous devez être connecté pour annuler cette réservation.");
      return;
    }

    if (!booking?.id) {
      toast.error("ID de réservation invalide.");
      return;
    }

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
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      toast.error("Impossible d'annuler la réservation.", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  // Fonction pour payer maintenant
  const handlePayNow = async () => {
    if (!booking || !booking.stripeCustomerId) {
      toast.error("Informations de paiement incomplètes");
      return;
    }

    try {
      // Créer la session Stripe pour le paiement
      const sessionUrl = await createStripeCheckoutSession(
        booking.stripeCustomerId,
        totalAmount,
        "eur",
        booking.service.name,
        window.location.origin,
        booking.id
      );

      // Rediriger l'utilisateur vers Stripe pour effectuer le paiement
      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        throw new Error("Session URL is null.");
      }

      // Après le paiement réussi, marquer la réservation comme payée
      // Mise à jour du statut de la réservation
      await updateBooking(booking.id, "PAID"); // Mettre à jour le statut à "PAID"

      // Mise à jour de l'état local du paiement
      setIsPaid(true);

      toast.success("Paiement effectué avec succès !");
    } catch (error) {
      console.error("Erreur lors du paiement", error);
      toast.error("Erreur lors du paiement");
    }
  };

  return (
    <Wrapper>
      <div className="manage_booking">
        <h1>Ma Réservation</h1>
        <br />
        <span className="manage_booking__text">
          <h2>Voici votre réservation, vous avez un imprévu ?</h2>
          <p>
            Pas de souci ! Vous pouvez demander la confirmation de votre
            réservation ici. Une fois confirmée, elle sera en attente de
            validation par l&apos;administrateur.
          </p>
        </span>

        <div className="manage_booking_container">
          <ServiceCompt
            name={booking.service.name}
            description={
              booking.service.description || "Aucune description disponible"
            }
            imageUrl={booking.service.imageUrl || "/assets/default.jpg"}
            categories={booking.service.categories}
            startTime={booking.startTime}
            endTime={booking.endTime}
            options={booking.options || []}
            totalAmount={totalAmount}
          />

          {/* Bouton Annuler la réservation */}
          <button
            onClick={handleDeleteBooking}
            className="btn_form"
            disabled={deleting}
          >
            {deleting ? "Annulation en cours..." : "Annuler la réservation"}
          </button>

          {/* Afficher la notification si la réservation est en attente */}
          {confirmationMessage && (
            <div className="confirmation_message">{confirmationMessage}</div>
          )}

          {/* Afficher le bouton de demande de confirmation seulement si la réservation est en attente */}
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

          {/* Afficher le bouton Payer maintenant ou le message "Paiement effectué" */}
          {booking.approvedByAdmin && !isPaid ? (
            <>
              <p>✅ Réservation approuvée</p>
              <p>Vous pouvez maintenant accéder à votre portail de paiement.</p>
              <p>
                Si vous avez des questions, n&apos;hésitez pas à nous contacter.
              </p>
              <button onClick={handlePayNow} className="btn_form">
                Payer maintenant
              </button>
            </>
          ) : isPaid ? (
            <p>✅ Paiement effectué. Merci de votre paiement !</p>
          ) : null}
        </div>
      </div>
    </Wrapper>
  );
};

export default ManageBookingPage;
