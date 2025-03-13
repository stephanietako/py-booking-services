import { formatISO, parseISO } from "date-fns";
import { Service } from "@/types";
import React from "react";
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

  // 📊 Calcul des options
  const optionCount = service.options?.length || 0;
  const totalOptionAmount = service.options
    ? service.options.reduce((sum, option) => sum + option.amount, 0)
    : 0;
  const remainingAmount = service.amount + totalOptionAmount;
  const progressValue =
    totalOptionAmount > service.amount
      ? 100
      : (totalOptionAmount / service.amount) * 100;
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
              {service.description}
            </span>
            <span className={styles.service_item__option_count}>
              {optionCount} option(s)
            </span>
          </div>
          <div className={styles.service_item__stats}>
            <span>{remainingAmount} € montant total</span>
          </div>

          <div className={styles.service_item__progress}>
            <progress value={progressValue} max="100"></progress>
          </div>
          <div className={styles.service_item__amount}>{remainingAmount} €</div>

          <button disabled={isPending} onClick={handleBooking}>
            {isPending ? "Réservation..." : "Réserver"}
          </button>
        </div>
      </div>
    </li>
  );
};

export default ServiceItem;
