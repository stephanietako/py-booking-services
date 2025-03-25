import React from "react";
import { Booking } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AiOutlineCloseCircle } from "react-icons/ai";
// Style
import styles from "./styles.module.scss"; // Importez le fichier styles.module.scss

interface BookingItemProps {
  booking: Booking;
  onCancel: (booking: Booking) => void;
}

const BookingItem: React.FC<BookingItemProps> = ({ booking, onCancel }) => {
  return (
    <div className={styles.bookingItem}>
      <div className={styles.bookingItem__header}>
        <h3>{booking.service.name}</h3>
        <p className={styles.bookingItem__description}>
          {booking.service.description}
        </p>
      </div>
      <div className={styles.bookingItem__content}>
        <div className={styles.bookingItem__details}>
          <p>
            <strong>Réservé pour :</strong>{" "}
            {format(new Date(booking.startTime), "eeee dd MMMM 'à' HH:mm", {
              locale: fr,
            })}{" "}
            à {format(new Date(booking.endTime), "HH:mm", { locale: fr })}
          </p>
          <p className={styles.bookingItem__total}>
            Total: {booking.totalAmount} €
          </p>
        </div>
        <div className={styles.bookingItem__options}>
          {booking.options && booking.options.length > 0 && (
            <div>
              <h4>Options choisies :</h4>
              <ul>
                {booking.options.map((option) => (
                  <li key={option.id}>
                    {option.description} - {option.amount} €
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className={styles.bookingItem__actions}>
        <button
          className={styles.bookingItem__cancelBtn}
          onClick={() => onCancel(booking)}
        >
          <AiOutlineCloseCircle className={styles.bookingItem__cancelIcon} />{" "}
          Annuler
        </button>
      </div>
    </div>
  );
};

export default BookingItem;
