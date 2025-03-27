"user client";

import { useState, useEffect, useCallback } from "react";
import { format, formatISO, parseISO } from "date-fns";
import { Service } from "@/types";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  createBooking,
  generateBookingToken,
  deleteUserBooking,
} from "@/actions/bookings";
import OptionManager from "../OptionManager/OptionManager";
import styles from "./styles.module.scss";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

interface ServiceItemProps {
  service: Service;
  enableHover?: number;
  remainingAmount: number;
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  enableHover,
  remainingAmount,
}) => {
  const { user } = useUser(); // Utilisation de useUser()
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  const router = useRouter();

  // Effect qui va récupérer les heures sauvegardées
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStartTime = localStorage.getItem("selectedStartTime");
      const savedEndTime = localStorage.getItem("selectedEndTime");

      if (savedStartTime && savedEndTime) {
        setStartTime(savedStartTime);
        setEndTime(savedEndTime);
      }
    }
  }, []);

  // Fonction de réservation non conditionnelle

  const handleBooking = useCallback(async () => {
    if (!user) {
      return toast.error("Vous devez être connecté pour réserver.");
    }
    if (!startTime || !endTime) {
      return toast.error("Veuillez sélectionner un horaire.");
    }

    const startISO = parseISO(startTime);
    const endISO = parseISO(endTime);

    if (isNaN(startISO.getTime()) || isNaN(endISO.getTime())) {
      return toast.error("Les horaires sélectionnés sont invalides.");
    }

    setIsBooking(true);

    try {
      // Création de la réservation
      const booking = await createBooking(
        user.id,
        service.id,
        formatISO(startISO),
        startTime,
        endTime
      );

      // Mise à jour des informations de réservation
      setBookingId(booking.id);
      setBookingMessage(
        `✅ Réservé de ${format(startISO, "HH:mm")} à ${format(endISO, "HH:mm")}`
      );
      toast.success("Réservation réussie !");

      // Génération du token, mais sans redirection automatique
      await generateBookingToken(booking.id, user.id);

      // Pas de redirection ici
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la réservation.");
    } finally {
      setIsBooking(false);
    }
  }, [user, service.id, startTime, endTime]);

  // Fonction pour annuler la réservation
  const handleCancelBooking = useCallback(async () => {
    if (!user || !bookingId) {
      return toast.error("Impossible d'annuler la réservation.");
    }

    try {
      // Appel à la fonction deleteUserBooking pour supprimer la réservation
      const result = await deleteUserBooking(bookingId, user.id);
      toast.success(result.message);

      // Réinitialisation des états après l'annulation
      setBookingId(null);
      setBookingMessage(null);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'annulation de la réservation.");
    }
  }, [user, bookingId]);

  // Classe CSS conditionnelle pour le hover
  const hoverClass = enableHover === 1 ? styles.hoverEnabled : "";
  const imageUrl = service.imageUrl || "/assets/default.jpg";

  return (
    <li className={`${styles.service_item} ${hoverClass}`}>
      <div className={styles.service_item__content}>
        {/* 📷 Image du service */}
        <div className={styles.service_image}>
          <Image
            src={imageUrl}
            alt={service.name}
            width={60}
            height={60}
            className={styles.__img}
          />
        </div>

        {/* ℹ️ Détails du service */}
        <div className={styles.service_item__details}>
          <div className={styles.service_item__infos}>
            <span className={styles.service_item__title}>{service.name}</span>
            <span className={styles.service_item__description}>
              {service.description
                ?.split("\n")
                .map((line, index) => <span key={index}>{line}</span>)}
            </span>
            <span className={styles.service_item__option_count}>
              {service.options?.length} option(s)
            </span>
          </div>

          {/* 💰 Montant */}
          <div className={styles.service_item__stats}>
            <span>
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(remainingAmount)}
            </span>
          </div>
          {bookingId && (
            <div className={styles.service_item__option_reminder}>
              <p>Ajoutez des options pour votre réservation :</p>
              <OptionManager
                bookingId={bookingId}
                serviceAmount={remainingAmount}
                onTotalUpdate={() => {}}
              />
            </div>
          )}
          {/* 🎟️ Bouton de réservation */}
          {!bookingId ? (
            <button
              disabled={isBooking}
              onClick={handleBooking}
              aria-label={
                isBooking ? "Réservation en cours" : "Réserver ce service"
              }
              className={isBooking ? styles.loading : ""}
            >
              {isBooking ? "Réservation en cours..." : "Réserver ce service"}
            </button>
          ) : (
            <button
              onClick={handleCancelBooking} // Appel à la fonction pour annuler la réservation
              className={styles.cancelButton} // Ajouter une classe pour styliser le bouton
            >
              Annuler ma réservation
            </button>
          )}
        </div>
      </div>

      {/* 📩 Message de confirmation */}
      {bookingMessage && (
        <div className={styles.bookingConfirmationMessage}>
          <p>{bookingMessage}</p>
          {bookingId && user && (
            <button
              className={styles.manageBookingButton}
              onClick={async () => {
                // Générer le token à chaque fois que l'utilisateur clique sur ce bouton
                const token = await generateBookingToken(bookingId, user.id);

                // Redirection vers la page de gestion
                router.push(`/manage-booking?token=${token}`);
              }}
            >
              Gérer ma réservation
            </button>
          )}
        </div>
      )}
    </li>
  );
};

export default ServiceItem;
