// 3. Composant PaymentSuccessDetails modifié
// // app/components/PaymentSuccessDetails/PaymentSuccessDetails.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { format } from "date-fns";
// import { fr } from "date-fns/locale";
// import { BookingWithDetails } from "@/types";
// // Styles
// import styles from "./styles.module.scss";

// interface PaymentSuccessDetailsProps {
//   token: string;
// }

// export default function PaymentSuccessDetails({
//   token,
// }: PaymentSuccessDetailsProps) {
//   const [booking, setBooking] = useState<BookingWithDetails | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchBookingDetails = async () => {
//       try {
//         const response = await fetch("/api/bookings/verify-token", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ token }),
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.error || "Erreur de vérification");
//         }

//         const { data } = await response.json();
//         setBooking(data);
//       } catch (err) {
//         console.error("Erreur lors de la récupération:", err);
//         setError(
//           err instanceof Error
//             ? err.message
//             : "Erreur lors du chargement des détails"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookingDetails();
//   }, [token]);

//   if (loading) {
//     return (
//       <div className={styles.loading}>
//         <p>🔄 Chargement des détails de votre réservation...</p>
//       </div>
//     );
//   }

//   if (error || !booking) {
//     return (
//       <div className="error">
//         <p>❌ {error || "Réservation introuvable"}</p>
//         <p>Le lien de confirmation a peut-être expiré.</p>
//       </div>
//     );
//   }

//   const customerName =
//     booking.client?.fullName || booking.user?.name || "Client";
//   const customerEmail = booking.client?.email || booking.user?.email || "";

//   // Calculer le montant payé en ligne
//   const paidOnline = booking.totalAmount - booking.payableOnBoard;

//   return (
//     <div className={styles.booking_details}>
//       <div className={styles.booking_summary}>
//         <h2>📧 Récapitulatif de votre réservation</h2>

//         <div className={styles.customer_info}>
//           <h3>👤 Informations client</h3>
//           <p>
//             <strong>Nom:</strong> {customerName}
//           </p>
//           <p>
//             <strong>Email:</strong> {customerEmail}
//           </p>
//           {booking.phoneNumber && (
//             <p>
//               <strong>Téléphone:</strong> {booking.phoneNumber}
//             </p>
//           )}
//         </div>

//         <div className={styles.service_info}>
//           <h3>🚤 Service réservé</h3>
//           <p>
//             <strong>{booking.service?.name}</strong>
//           </p>
//           <p>
//             <strong>Date:</strong>{" "}
//             {format(new Date(booking.reservedAt), "dd MMMM yyyy", {
//               locale: fr,
//             })}
//           </p>
//           <p>
//             <strong>Horaire:</strong>{" "}
//             {format(new Date(booking.startTime), "HH:mm")} -{" "}
//             {format(new Date(booking.endTime), "HH:mm")}
//           </p>
//           {booking.withCaptain && (
//             <p>
//               👨‍✈️ <strong>Avec capitaine</strong>
//             </p>
//           )}
//         </div>

//         {booking.bookingOptions && booking.bookingOptions.length > 0 && (
//           <div className={styles.options_info}>
//             <h3>🎯 Options sélectionnées</h3>
//             {booking.bookingOptions.map((option, index) => (
//               <div key={index} className={styles.option_item}>
//                 <p>
//                   • {option.label} x{option.quantity} - {option.amount}€
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}

//         <div className={styles.payment_info}>
//           <h3>💳 Détails du paiement</h3>
//           <p>
//             <strong>Montant du bateau:</strong> {booking.boatAmount}€
//           </p>
//           <p>
//             <strong>💰 Payé en ligne:</strong> {paidOnline}€
//           </p>
//           {booking.payableOnBoard > 0 && (
//             <p>
//               <strong>🏪 À payer sur place:</strong> {booking.payableOnBoard}€
//             </p>
//           )}
//           <p>
//             <strong>Total:</strong> {booking.totalAmount}€
//           </p>
//         </div>

//         <div className={styles.next_steps}>
//           <h3>📝 Prochaines étapes</h3>
//           <ul>
//             <li>✅ Votre paiement a été confirmé</li>
//             <li>📧 Un email de confirmation va vous être envoyé</li>
//             <li>📞 Nous vous contacterons pour finaliser les détails</li>
//             {booking.payableOnBoard > 0 && (
//               <li>💰 {booking.payableOnBoard}€ à régler sur place le jour J</li>
//             )}
//           </ul>
//         </div>

//         {/* Plus d'IDs sensibles affichés */}
//         <div
//           className={styles.booking_ref}
//           style={{ fontSize: "0.8em", color: "#666", marginTop: "20px" }}
//         >
//           <p>Référence réservation: #{booking.id}</p>
//         </div>
//       </div>
//     </div>
//   );
// }
// app/components/PaymentSuccessDetails/PaymentSuccessDetails.tsx
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import styles from "./styles.module.scss";

import type { BookingWithDetails } from "@/types"; // adapte le chemin si besoin

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

        toast.success("🎉 Paiement confirmé avec succès !");
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
    booking.user?.fullName ||
    booking.user?.name ||
    "Client";
  const customerEmail = booking.clientEmail || booking.user?.email || "";
  const paidOnline = booking.totalAmount - booking.payableOnBoard;

  return (
    <div className={styles.booking_details}>
      <div className={styles.booking_summary}>
        <h2>📧 Récapitulatif de votre réservation</h2>

        <div className={styles.customer_info}>
          <h3>👤 Informations client</h3>
          <p>
            <strong>Nom:</strong> {customerName}
          </p>
          <p>
            <strong>Email:</strong> {customerEmail}
          </p>
          {booking.clientPhoneNumber && (
            <p>
              <strong>Téléphone:</strong> {booking.clientPhoneNumber}
            </p>
          )}
        </div>

        <div className={styles.service_info}>
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
          <div className={styles.options_info}>
            <h3>🎯 Options sélectionnées</h3>
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

        <div className={styles.next_steps}>
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
          className={styles.booking_ref}
          style={{ fontSize: "0.8em", color: "#666", marginTop: "20px" }}
        >
          <p>Référence réservation: #{booking.id}</p>
        </div>
      </div>
    </div>
  );
}
