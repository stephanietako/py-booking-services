"use client";

import { useState, useEffect, useCallback } from "react";
import { format, formatISO, parseISO } from "date-fns";
import { Service, Option } from "@/types";
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
  availableOptions: Option[];
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  enableHover,
  remainingAmount,
  availableOptions, // ✅ ici manquait dans ton code précédent
}) => {
  const { user } = useUser();
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  const router = useRouter();

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

  const handleBooking = useCallback(async () => {
    if (!user) {
      return toast.error("Vous devez être connecté pour réserver.", {
        ariaProps: { role: "alert", "aria-live": "assertive" },
      });
    }
    if (!startTime || !endTime) {
      return toast.error("Veuillez sélectionner un horaire.", {
        ariaProps: { role: "alert", "aria-live": "assertive" },
      });
    }

    const startISO = parseISO(startTime);
    const endISO = parseISO(endTime);

    if (isNaN(startISO.getTime()) || isNaN(endISO.getTime())) {
      return toast.error("Les horaires sélectionnés sont invalides.", {
        ariaProps: { role: "alert", "aria-live": "assertive" },
      });
    }

    setIsBooking(true);

    try {
      const booking = await createBooking(
        user.id,
        service.id,
        formatISO(startISO),
        startTime,
        endTime,
        [],
        false
      );

      setBookingId(String(booking.id));
      setBookingMessage(
        `✅ Réservé de ${format(startISO, "HH:mm")} à ${format(endISO, "HH:mm")}`
      );
      toast.success("Réservation réussie !", {
        ariaProps: { role: "status", "aria-live": "polite" },
      });

      await generateBookingToken(String(booking.id), user.id);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la réservation.", {
        ariaProps: { role: "alert", "aria-live": "assertive" },
      });
    } finally {
      setIsBooking(false);
    }
  }, [user, service.id, startTime, endTime]);

  const handleCancelBooking = useCallback(async () => {
    if (!user || !bookingId) {
      return toast.error("Impossible d'annuler la réservation.", {
        ariaProps: { role: "alert", "aria-live": "assertive" },
      });
    }

    try {
      const result = await deleteUserBooking(bookingId, user.id);
      toast.success(result.message, {
        ariaProps: { role: "status", "aria-live": "polite" },
      });

      setBookingId(null);
      setBookingMessage(null);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'annulation de la réservation.", {
        ariaProps: { role: "alert", "aria-live": "assertive" },
      });
    }
  }, [user, bookingId]);

  const hoverClass = enableHover === 1 ? styles.hoverEnabled : "";
  const imageUrl = service.imageUrl || "/assets/logo/logo-full.png";

  return (
    <div>
      <li className={`${styles.service_item} ${hoverClass}`}>
        <div className={styles.service_item__content}>
          <div className={styles.__img_content}>
            <Image
              src={imageUrl}
              alt={`Excursions en mer : ${service.name}`}
              width={200}
              height={200}
              className={styles.__img}
            />
          </div>

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
                  availableOptions={availableOptions}
                  onTotalUpdate={() => {}}
                />
              </div>
            )}

            {!bookingId ? (
              <button
                disabled={isBooking}
                onClick={handleBooking}
                aria-label={
                  isBooking ? "Réservation en cours" : "Réserver ce service"
                }
                aria-disabled={isBooking}
                className={isBooking ? styles.loading : ""}
              >
                {isBooking ? "Réservation en cours..." : "Réserver ce service"}
              </button>
            ) : (
              <button
                onClick={handleCancelBooking}
                className={styles.cancelButton}
                aria-label="Annuler ma réservation"
              >
                Annuler ma réservation
              </button>
            )}
          </div>
        </div>

        {bookingMessage && (
          <div className={styles.bookingConfirmationMessage}>
            <p>{bookingMessage}</p>
            {bookingId && user && (
              <button
                className={styles.manageBookingButton}
                onClick={async () => {
                  const token = await generateBookingToken(bookingId, user.id);
                  router.push(`/manage-booking?token=${token}`);
                }}
                aria-label="Gérer ma réservation"
              >
                Gérer ma réservation
              </button>
            )}
          </div>
        )}
      </li>
    </div>
  );
};

export default ServiceItem;
