// app/users/payment/success/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Booking, BookingOption } from "@/types";

export default function PaymentSuccess() {
  const params = useSearchParams();
  const bookingId = params.get("booking");
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}`)
      .then((res) => res.json())
      .then(setBooking);
  }, [bookingId]);

  if (!booking) return <p>Chargement...</p>;

  const options = booking.bookingOptions || [];

  const totalOnBoard = options.reduce((sum: number, opt: BookingOption) => {
    return sum + opt.unitPrice * opt.quantity;
  }, 0);

  return (
    <div className="container">
      <h1 className="succes__title">🎉 Paiement confirmé</h1>
      <p>Merci pour votre réservation !</p>

      <div className="succes_details">
        <h2 className="succes_details__title">Détails :</h2>
        <p>
          Montant payé en ligne : {booking.boatAmount}{" "}
          {booking.service?.currency}
        </p>

        <div className="succes_details__options">
          <h3 className="succes_details__options__title ">
            Options à payer à bord :
          </h3>
          <ul className="succes_details__options__list">
            {options.map((opt) => (
              <li key={opt.id} className="succes_details__options__item">
                <span>
                  {opt.label} × {opt.quantity}
                </span>
                <span>
                  {opt.unitPrice * opt.quantity} {booking.service?.currency}
                </span>
              </li>
            ))}
          </ul>
          <p className="succes_details__options__total">
            Total à bord : {totalOnBoard} {booking.service?.currency}
          </p>
        </div>
      </div>
    </div>
  );
}
