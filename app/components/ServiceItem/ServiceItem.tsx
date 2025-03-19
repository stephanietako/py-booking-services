"use client";

import { formatISO, parseISO } from "date-fns";
import { Service } from "@/types";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useTransition } from "react";
import toast from "react-hot-toast";
// Styles
import styles from "./styles.module.scss";
import { createBooking } from "@/actions/bookings";
import { useRouter } from "next/navigation";

interface ServiceItemProps {
  service: Service;
  enableHover?: number;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ service, enableHover }) => {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // 🧑‍💻 Gérer l'état du montant dynamique
  const [remainingAmount, setRemainingAmount] = useState<number>(
    service.amount
  ); // Initialisation avec le montant de base

  useEffect(() => {
    // Calcul du montant dynamique en fonction des options
    const totalOptionAmount =
      service.options?.reduce((sum, option) => sum + option.amount, 0) || 0;
    const totalAmount = service.amount + totalOptionAmount;
    setRemainingAmount(totalAmount); // Mise à jour du montant dynamique
  }, [service.amount, service.options]); // Dépendances pour recalculer le montant lorsque ces valeurs changent

  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(remainingAmount);

  const progressValue =
    service.options && service.options.length
      ? (remainingAmount /
          (service.amount +
            (service.options.reduce((sum, option) => sum + option.amount, 0) ||
              0))) *
        100
      : 0;

  const hoverClass = enableHover === 1 ? styles.hoverEnabled : "";
  const imageUrl = service.imageUrl || "/assets/default.jpg";

  // 🛒 Gestion de la réservation
  const handleBooking = () => {
    if (!user) {
      toast.error("Vous devez être connecté pour réserver un service.");
      return;
    }

    // ✅ Récupération et validation des créneaux horaires
    const selectedStartTime = localStorage.getItem("selectedStartTime");
    const selectedEndTime = localStorage.getItem("selectedEndTime");

    if (!selectedStartTime || !selectedEndTime) {
      toast.error(
        "Veuillez sélectionner une heure de début et une heure de fin."
      );
      return;
    }

    // ✅ Convertir en objets Date
    const startTime = parseISO(selectedStartTime);
    const endTime = parseISO(selectedEndTime);

    // 🚨 Vérification stricte pour éviter l'erreur "Invalid time value"
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      toast.error("Erreur : Les horaires sélectionnés sont invalides.");
      return;
    }

    // ✅ Extraction de la date uniquement
    const selectedDate = formatISO(new Date(startTime));

    startTransition(async () => {
      try {
        // ✅ Création de la réservation avec `startTime` et `endTime`
        const booking = await createBooking(
          user.id,
          service.id,
          selectedDate,
          startTime.toISOString(),
          endTime.toISOString()
        );

        // Mise à jour du montant dynamique après la réservation
        setRemainingAmount(booking.totalAmount); // Utiliser le prix dynamique renvoyé par le back-end

        toast.success("Réservation réussie !");
        router.push("/my-bookings");
      } catch (error) {
        console.error("❌ Erreur lors de la réservation :", error);
        toast.error("Erreur lors de la réservation.");
      }
    });
  };

  return (
    <li className={`${styles.service_item} ${hoverClass}`}>
      <div className={styles.service_item__content}>
        <div className={styles.service_image}>
          <Image
            src={imageUrl}
            alt={service.name}
            width={60}
            height={60}
            className={styles.__img}
          />
        </div>

        <div className={styles.service_item__details}>
          <div className={styles.service_item__infos}>
            <span className={styles.service_item__title}>{service.name}</span>
            <span className={styles.service_item__description}>
              {service.description?.split("\n").map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </span>

            <span className={styles.service_item__option_count}>
              {service.options?.length} option(s)
            </span>
          </div>
          <div className={styles.service_item__stats}>
            <span>{formattedAmount} montant total</span>
          </div>

          <div className={styles.service_item__progress}>
            <progress value={progressValue} max="100"></progress>
          </div>
          <div className={styles.service_item__amount}>{formattedAmount}</div>

          <button disabled={isPending} onClick={handleBooking}>
            {isPending ? "Réservation..." : "Réserver"}
          </button>
        </div>
      </div>
    </li>
  );
};

export default ServiceItem;
