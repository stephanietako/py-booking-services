"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import styles from "./styles.module.scss";

import type { BookingWithDetails } from "@/types";

interface PaymentSuccessDetailsProps {
  token: string;
}

export default function PaymentSuccessDetails({
  token,
}: PaymentSuccessDetailsProps) {
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch("/api/bookings/verify-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur de vérification");
        }

        const json: { data: BookingWithDetails } = await response.json();
        setBooking(json.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des détails"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [token]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>🔄 Chargement des détails de votre réservation...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="error">
        <p>❌ {error || "Réservation introuvable"}</p>
        <p>Le lien de confirmation a peut-être expiré.</p>
      </div>
    );
  }

  const customerName =
    booking.clientFullName ||
    booking.client?.fullName ||
    booking.user?.fullName ||
    booking.user?.name ||
    "Client";

  const customerEmail =
    booking.email ||
    booking.clientEmail ||
    booking.client?.email ||
    booking.user?.email ||
    "";

  const customerPhone =
    booking.phoneNumber ||
    booking.clientPhoneNumber ||
    booking.client?.phoneNumber ||
    booking.user?.phoneNumber ||
    "";

  const paidOnline = booking.totalAmount - booking.payableOnBoard;

  return (
    <div className={styles.booking_details}>
      <div className={styles.booking_summary}>
        <h3>📧 Récapitulatif de votre réservation</h3>

        <div className={styles.customer_info}>
          <h4>👤 Informations client</h4>
          <p>
            <strong>Nom:</strong> {customerName}
          </p>
          <p>
            <strong>Email:</strong> {customerEmail}
          </p>
          {customerPhone && (
            <p>
              <strong>Téléphone:</strong> {customerPhone}
            </p>
          )}
        </div>

        <div className={styles.service_info}>
          <h4>🚤 Service réservé</h4>
          <p>
            <strong>{booking.service?.name}</strong>
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {format(new Date(booking.reservedAt), "dd MMMM yyyy", {
              locale: fr,
            })}
          </p>
          <p>
            <strong>Horaire:</strong>{" "}
            {format(new Date(booking.startTime), "HH:mm")} -{" "}
            {format(new Date(booking.endTime), "HH:mm")}
          </p>
          {booking.withCaptain && (
            <p>
              👨‍✈️ <strong>Avec capitaine</strong>
            </p>
          )}
        </div>

        {booking.bookingOptions.length > 0 && (
          <div className={styles.options_info}>
            <h4>🎯 Options sélectionnées</h4>
            {booking.bookingOptions.map(({ label, quantity, amount, id }) => (
              <div key={id} className={styles.option_item}>
                <p>
                  • {label} x{quantity} - {amount}€
                </p>
              </div>
            ))}
          </div>
        )}

        <div className={styles.payment_info}>
          <h4>💳 Détails du paiement</h4>
          <p>
            <strong>Montant du bateau:</strong> {booking.boatAmount}€
          </p>
          <p>
            <strong>💰 Payé en ligne:</strong> {paidOnline}€
          </p>
          {booking.payableOnBoard > 0 && (
            <p>
              <strong>🏪 À payer sur place:</strong> {booking.payableOnBoard}€
            </p>
          )}
          <p>
            <strong>Total:</strong> {booking.totalAmount}€
          </p>
        </div>

        <div className={styles.next_steps}>
          <h4>📝 Prochaines étapes</h4>
          <ul>
            <li>✅ Votre paiement a été confirmé</li>
            <li>📧 Un email de confirmation va vous être envoyé</li>
            <li> Nous vous contacterons pour finaliser les détails</li>
            {booking.payableOnBoard > 0 && (
              <li>💰 {booking.payableOnBoard}€ à régler sur place le jour J</li>
            )}
          </ul>
        </div>

        <div
          className={styles.booking_ref}
          style={{ fontSize: "0.8em", color: "#666", marginTop: "20px" }}
        >
          <p>Référence réservation: #{booking.id}</p>
        </div>
      </div>
    </div>
  );
}
