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

  const transactionCount = service.transactions
    ? service.transactions.length
    : 0;

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

  // Valeur par défaut pour l'image si imageUrl est vide ou null
  const imageUrl = service.imageUrl ? service.imageUrl : "/assets/default.jpg";
  ////////////////////
  const handleBooking = () => {
    if (!user) {
      toast.error("Vous devez être connecté pour réserver un service.");
      return;
    }

    startTransition(async () => {
      try {
        await createBooking(user.id, service.id);
        toast.success("Réservation réussie !");
        router.push("/my-bookings");
      } catch (error) {
        console.error(error);
        toast.error("Erreur lors de la réservation.");
      }
    });
  };
  return (
    <li className={`${styles.serviceItem} ${hoverClass}`}>
      <div className={styles.serviceItemHeader}>
        {/* Affichage de l'image du service avec gestion d'image vide */}
        <div className={styles.serviceItemImage}>
          <Image
            src={imageUrl} // Utilise imageUrl avec fallback si vide
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
        <div className={styles.serviceItemAmount}> {remainingAmount} €</div>
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
