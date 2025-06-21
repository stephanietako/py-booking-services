// import Link from "next/link";
// import styles from "./styles.module.scss";

// export default function PaymentSuccess() {
//   return (
//     <div className={styles.container}>
//       <h1 className={styles.success__title}>🎉 Paiement confirmé !</h1>
//       <p className={styles.success__message}>
//         Merci infiniment pour votre réservation ! Nous sommes ravis de vous
//         accueillir bientôt. Un e-mail de confirmation vous a été envoyé.
//       </p>

//       <Link href="/" className={styles.success__button}>
//         Retour à l&apos;accueil
//       </Link>
//     </div>
//   );
// }
// app/components/PaymentSuccessDetails/PaymentSuccessDetails.tsx
// interface PaymentSuccessDetailsProps {
//   sessionId: string;
//   bookingId: string;
// }

// export default function PaymentSuccessDetails({
//   sessionId,
//   bookingId,
// }: PaymentSuccessDetailsProps) {
//   // Maintenant vous avez accès aux paramètres !
//   // Récupérer les détails de la réservation avec bookingId
//   // Valider le paiement avec sessionId si nécessaire

//   return (
//     <div>
//       <h2>Détails de votre réservation #{bookingId}</h2>
//       {/* Votre logique d'affichage */}
//     </div>
//   );
// }

// app/components/PaymentSuccessDetails/PaymentSuccessDetails.tsx
// app/components/PaymentSuccessDetails/PaymentSuccessDetails.tsx
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PaymentSuccessDetailsProps {
  sessionId: string;
  bookingId: string;
}

interface BookingDetails {
  id: number;
  reservedAt: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  payableOnBoard: number;
  boatAmount: number;
  withCaptain: boolean;
  service?: {
    name: string;
    description: string;
  };
  bookingOptions: Array<{
    label: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  client?: {
    fullName: string;
    email: string;
  };
  user?: {
    name: string;
    email: string;
  };
}

export default function PaymentSuccessDetails({
  sessionId,
  bookingId,
}: PaymentSuccessDetailsProps) {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // Récupérer les détails de la réservation
        const response = await fetch(
          `/api/bookings/${bookingId}?session_id=${sessionId}`
        );

        if (!response.ok) {
          throw new Error(
            "Impossible de récupérer les détails de la réservation"
          );
        }

        const data = await response.json();
        setBooking(data);
      } catch (err) {
        console.error("Erreur lors de la récupération:", err);
        setError("Erreur lors du chargement des détails");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, sessionId]);

  if (loading) {
    return (
      <div className="loading">
        <p>🔄 Chargement des détails de votre réservation...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="error">
        <p>❌ {error || "Réservation introuvable"}</p>
        <p>ID de réservation: {bookingId}</p>
        <p>ID de session: {sessionId}</p>
      </div>
    );
  }

  const customerName =
    booking.client?.fullName || booking.user?.name || "Client";
  const customerEmail = booking.client?.email || booking.user?.email || "";

  // Calculer le montant payé en ligne
  const paidOnline = booking.totalAmount - booking.payableOnBoard;

  return (
    <div className="booking-details">
      <div className="booking-summary">
        <h2>📧 Récapitulatif de votre réservation</h2>

        <div className="customer-info">
          <h3>👤 Informations client</h3>
          <p>
            <strong>Nom:</strong> {customerName}
          </p>
          <p>
            <strong>Email:</strong> {customerEmail}
          </p>
        </div>

        <div className="service-info">
          <h3>🚤 Service réservé</h3>
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
          <div className="options-info">
            <h3>🎯 Options sélectionnées</h3>
            {booking.bookingOptions.map((option, index) => (
              <div key={index} className="option-item">
                <p>
                  • {option.label} x{option.quantity} - {option.amount}€
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="payment-info">
          <h3>💳 Détails du paiement</h3>
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

        <div className="next-steps">
          <h3>📝 Prochaines étapes</h3>
          <ul>
            <li>✅ Votre paiement a été confirmé</li>
            <li>📧 Un email de confirmation va vous être envoyé</li>
            <li>📞 Nous vous contacterons pour finaliser les détails</li>
            {booking.payableOnBoard > 0 && (
              <li>💰 {booking.payableOnBoard}€ à régler sur place le jour J</li>
            )}
          </ul>
        </div>

        <div
          className="session-info"
          style={{ fontSize: "0.8em", color: "#666", marginTop: "20px" }}
        >
          <p>ID réservation: {booking.id}</p>
          <p>ID session: {sessionId}</p>
        </div>
      </div>

      <style jsx>{`
        .booking-details {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .booking-summary {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #4caf50;
        }
        .customer-info,
        .service-info,
        .options-info,
        .payment-info,
        .next-steps {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        .next-steps:last-child {
          border-bottom: none;
        }
        .option-item {
          margin: 5px 0;
        }
        .loading,
        .error {
          text-align: center;
          padding: 20px;
        }
        h3 {
          color: #333;
          margin-bottom: 10px;
        }
        ul {
          padding-left: 20px;
        }
        li {
          margin: 8px 0;
        }
      `}</style>
    </div>
  );
}
