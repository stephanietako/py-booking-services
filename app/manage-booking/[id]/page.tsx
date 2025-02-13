"use client";

import React, { FC, useEffect, useState } from "react";
import {
  deleteUserBooking,
  getBookingById,
  updateBookingTotal,
} from "@/actions/bookings";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import { Booking } from "@/types";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import ServiceCompt from "@/app/components/ServicesCompt/ServiceCompt";

const ManageBookingPage: FC = () => {
  // Récupérer les informations de l'utilisateur et l'état de chargement de Clerk
  const { user, isSignedIn, isLoaded } = useUser();

  // Récupérer l'ID de la réservation depuis l'URL
  const { id } = useParams<{ id: string }>();

  // États locaux pour gérer les données de la réservation, les erreurs, et les états de chargement
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Utilisé pour la navigation
  const router = useRouter();

  // Effet pour récupérer les données de la réservation lorsque le composant est monté ou que l'ID change
  useEffect(() => {
    // Si Clerk n'a pas fini de charger, ne rien faire
    if (!isLoaded) {
      return;
    }

    // Si l'utilisateur n'est pas connecté, afficher une erreur
    if (!isSignedIn) {
      setError("Vous devez être connecté pour voir cette réservation.");
      setLoading(false);
      return;
    }

    // Fonction pour récupérer les données de la réservation
    const fetchBooking = async () => {
      try {
        // Récupérer les données de la réservation
        const bookingData = await getBookingById(id, user.id);
        setBooking(bookingData);

        // Calculer le montant total de la réservation
        const newTotal = await updateBookingTotal(id);
        setTotalAmount(newTotal);
      } catch (error) {
        console.error("Erreur lors du chargement de la réservation:", error);
        setError("Impossible de récupérer la réservation.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, user, isSignedIn, isLoaded]);

  // Fonction pour gérer la suppression de la réservation
  const handleDeleteBooking = async () => {
    if (!user) {
      setError("Vous devez être connecté pour annuler cette réservation.");
      return;
    }

    // Confirmer la suppression avec l'utilisateur
    const confirmation = window.confirm(
      "Voulez-vous vraiment annuler cette réservation ?"
    );
    if (!confirmation) return;

    setDeleting(true);
    const toastId = toast.loading("Annulation en cours...");

    try {
      // Supprimer la réservation
      await deleteUserBooking(id, user.id);
      router.push("/my-bookings");
      toast.success("Réservation annulée avec succès !", { id: toastId });
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
      toast.error("Impossible d'annuler la réservation.", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  // Afficher un message de chargement pendant la récupération des données
  if (loading) {
    return (
      <Wrapper>
        <p>Chargement...</p>
      </Wrapper>
    );
  }

  // Afficher un message d'erreur si une erreur s'est produite
  if (error) {
    return (
      <Wrapper>
        <p className="error">{error}</p>
      </Wrapper>
    );
  }

  // Afficher un message si la réservation n'est pas trouvée
  if (!booking) {
    return (
      <Wrapper>
        <p>Réservation introuvable.</p>
      </Wrapper>
    );
  }

  // Afficher les détails de la réservation
  return (
    <Wrapper>
      <div className="manage_booking">
        <div className="manage_booking_container">
          <ServiceCompt
            name={booking.service.name}
            description={
              booking.service.description || "Aucune description disponible"
            }
            amount={totalAmount}
            imageUrl={booking.service.imageUrl || "/assets/default.jpg"}
            categories={booking.service.categories}
          />
          <button
            onClick={handleDeleteBooking}
            className="btn_form"
            disabled={deleting}
          >
            {deleting ? "Annulation en cours..." : "Annuler la réservation"}
          </button>
        </div>
      </div>
    </Wrapper>
  );
};

export default ManageBookingPage;

// La page ManageBookingPage est complémentaire à MyBookings et permet de gérer une réservation spécifique en montrant les détails du service et en offrant la possibilité d'annuler la réservation. Les deux pages fonctionnent ensemble pour créer une expérience utilisateur complète autour de la gestion des réservations.
