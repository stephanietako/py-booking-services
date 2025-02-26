import { formatISO, parseISO } from "date-fns";
import { Service } from "@/types";
import React from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useTransition } from "react";
import toast from "react-hot-toast";
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

  // 📊 Calcul des transactions
  const transactionCount = service.transactions?.length || 0;
  const totalTransactionAmount = service.transactions
    ? service.transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      )
    : 0;
  const remainingAmount = service.amount + totalTransactionAmount;
  const progressValue =
    totalTransactionAmount > service.amount
      ? 100
      : (totalTransactionAmount / service.amount) * 100;
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
      console.error("⛔ Erreur: startTime ou endTime invalide", {
        startTime,
        endTime,
      });
      return;
    }

    // ✅ Extraction de la date uniquement
    // const selectedDate = formatISO(new Date(startTime.setHours(0, 0, 0, 0)));
    const selectedDate = formatISO(new Date(startTime));
    console.log("📅 StartTime valide :", startTime);
    console.log("⏳ EndTime valide :", endTime);
    console.log("📌 Date sélectionnée :", selectedDate);

    startTransition(async () => {
      try {
        // ✅ Création de la réservation avec `startTime` et `endTime`
        await createBooking(
          user.id,
          service.id,
          selectedDate,
          startTime.toISOString(),
          endTime.toISOString()
        );
        toast.success("Réservation réussie !");
        router.push("/my-bookings");
      } catch (error) {
        console.error("❌ Erreur lors de la réservation :", error);
        toast.error("Erreur lors de la réservation.");
      }
    });
  };

  return (
    <li className={`${styles.serviceItem} ${hoverClass}`}>
      <div className={styles.serviceItemHeader}>
        <div className={styles.serviceItemImage}>
          <Image
            src={imageUrl}
            alt={service.name}
            width={60}
            height={60}
            className={styles.serviceImage}
          />
        </div>

        <div className={styles.serviceItemDetails}>
          <div className={styles.serviceItemInfo}>
            <span className={styles.serviceItemTitle}>{service.name}</span>
            <span className={styles.serviceItemDescription}>
              {service.description}
            </span>
            <span className={styles.serviceItemTransactionCount}>
              {transactionCount} transaction(s)
            </span>
          </div>
        </div>
        <div className={styles.serviceItemAmount}>{remainingAmount} €</div>
      </div>

      <div className={styles.serviceItemStats}>
        <span>{totalTransactionAmount} € dépensés</span>
        <span>{remainingAmount} € montant total</span>
      </div>

      <div className={styles.serviceItemProgress}>
        <progress value={progressValue} max="100"></progress>
      </div>

      <button disabled={isPending} onClick={handleBooking}>
        {isPending ? "Réservation..." : "Réserver"}
      </button>
    </li>
  );
};

export default ServiceItem;
