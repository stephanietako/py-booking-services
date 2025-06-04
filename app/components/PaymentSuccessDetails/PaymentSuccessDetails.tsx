// Description: Composant pour afficher les détails de la réservation après un paiement réussi
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Wrapper from "../Wrapper/Wrapper";
import styles from "./styles.module.scss";
import { Booking, BookingOption } from "@/types";

function PaymentSuccessDetails() {
  const params = useSearchParams();
  const bookingId = params.get("booking");
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}`)
      .then((res) => res.json())
      .then(setBooking);
  }, [bookingId]);

  if (!booking) return <p>Chargement des détails de la réservation...</p>;

  // Mapping correct des options
  const options = (booking.bookingOptions || []).map((bo: BookingOption) => ({
    id: bo.id,
    label: bo.option?.label || bo.label || "Option",
    unitPrice: bo.option?.unitPrice ?? bo.unitPrice ?? 0,
    quantity: bo.quantity ?? 1,
  }));

  // Prix du capitaine si applicable
  const needsCaptain =
    booking.withCaptain === false && booking.service?.requiresCaptain;
  const captainPrice = needsCaptain
    ? (booking.service?.captainPrice ?? 350)
    : 0;

  const totalOnBoard =
    options.reduce((sum, opt) => sum + opt.unitPrice * opt.quantity, 0) +
    captainPrice;

  return (
    <Wrapper>
      <section className={styles.succes_details}>
        <h2 className={styles.succes_details__title}>
          Détails de la réservation
        </h2>
        <p>
          Montant payé en ligne :{" "}
          <span className="amount">{booking.boatAmount}</span>{" "}
          <span className="currency">{booking.service?.currency}</span>
        </p>

        <div className={styles.succes_details__options}>
          <h3 className={styles.succes_details__options__title}>
            Options à payer à bord :
          </h3>
          {options.length > 0 || needsCaptain ? (
            <ul className={styles.succes_details__options__list}>
              {options.map((opt) => (
                <li
                  key={opt.id}
                  className={styles.succes_details__options__item}
                >
                  <span>
                    {opt.label} ×{" "}
                    <span className={styles.quantity}>{opt.quantity}</span>
                  </span>
                  <span>
                    <span className={styles.amount}>
                      {opt.unitPrice * opt.quantity}
                    </span>{" "}
                    <span className={styles.currency}>
                      {booking.service?.currency}
                    </span>
                  </span>
                </li>
              ))}
              {needsCaptain && (
                <li className={styles.succes_details__options__item}>
                  <span>Capitaine à bord</span>
                  <span>
                    <span className={styles.amount}>{captainPrice}</span>{" "}
                    <span className={styles.currency}>
                      {booking.service?.currency}
                    </span>
                  </span>
                </li>
              )}
            </ul>
          ) : (
            <p>Aucune option à payer à bord.</p>
          )}
          <p className={styles.succes_details__options__total}>
            Total à payer à bord :{" "}
            <span className={styles.amount}>{totalOnBoard}</span>{" "}
            <span className={styles.currency}>{booking.service?.currency}</span>
          </p>
        </div>
      </section>
    </Wrapper>
  );
}

export default PaymentSuccessDetails;
