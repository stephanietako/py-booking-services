// "use client";

// import React, { useState } from "react";
// import type { Booking, BookingStatus } from "@/types";
// import { updateBookingStatus } from "@/utils/bookings";
// import toast from "react-hot-toast";
// import styles from "./styles.module.scss";

// interface Props {
//   initialBookings: Booking[];
// }

// const BookingList: React.FC<Props> = ({ initialBookings }) => {
//   const [bookings, setBookings] = useState<Booking[]>(initialBookings);
//   const [loadingId, setLoadingId] = useState<number | null>(null);

//   const handleStatusChange = async (
//     bookingId: number,
//     newStatus: BookingStatus
//   ) => {
//     setLoadingId(bookingId);
//     try {
//       const updated = await updateBookingStatus(bookingId, newStatus);
//       setBookings((prev) =>
//         prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
//       );
//       toast.success("Statut mis à jour !");
//     } catch (error) {
//       console.error("Erreur lors de la mise à jour du statut", error);
//       toast.error("Erreur lors de la mise à jour");
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   const getStatusClass = (status: BookingStatus) => {
//     switch (status) {
//       case "APPROVED":
//         return styles.approved;
//       case "REJECTED":
//         return styles.rejected;
//       case "PAID":
//         return styles.paid;
//       case "CANCELLED":
//         return styles.cancelled;
//       default:
//         return styles.pending;
//     }
//   };

//   return (
//     <div className={styles.container}>
//       {bookings.map((booking) => {
//         const bookingOptions = booking.bookingOptions ?? [];

//         // Calcul du total des options, sécurisation si unitPrice ou quantity manquent
//         const optionsTotal = bookingOptions.reduce(
//           (sum, opt) => sum + (opt.unitPrice ?? 0) * (opt.quantity ?? 0),
//           0
//         );

//         return (
//           <div key={booking.id} className={styles.card}>
//             <h3 className={styles.title}>Réservation #{booking.id}</h3>

//             <p>
//               <strong>Client :</strong> {booking.client?.fullName || "Inconnu"}
//             </p>
//             <p>
//               <strong>Email :</strong>{" "}
//               {booking.client?.email || "Non renseigné"}
//             </p>
//             <p>
//               <strong>Téléphone :</strong>{" "}
//               {booking.client?.phoneNumber || "Non renseigné"}
//             </p>

//             <p>
//               <strong>Statut :</strong>{" "}
//               <span
//                 className={`${styles.statusBadge} ${getStatusClass(
//                   booking.status
//                 )}`}
//               >
//                 {booking.status}
//               </span>
//             </p>

//             <p>
//               <strong>Réservé le :</strong>{" "}
//               {new Date(booking.reservedAt).toLocaleString()}
//             </p>
//             <p>
//               <strong>Début :</strong>{" "}
//               {new Date(booking.startTime).toLocaleString()}
//             </p>
//             <p>
//               <strong>Fin :</strong>{" "}
//               {new Date(booking.endTime).toLocaleString()}
//             </p>

//             <p>
//               <strong>Service :</strong> {booking.service?.name || "N/A"}
//             </p>
//             <p>
//               <strong>Montant bateau :</strong> {booking.boatAmount.toFixed(2)}{" "}
//               €
//             </p>
//             <p>
//               <strong>Payable à bord :</strong>{" "}
//               {booking.payableOnBoard.toFixed(2)} €
//             </p>
//             <p>
//               <strong>Montant total :</strong> {booking.totalAmount.toFixed(2)}{" "}
//               €
//             </p>

//             <p>
//               <strong>Total options :</strong> {optionsTotal.toFixed(2)} €
//             </p>

//             <p>
//               <strong>Capitaine :</strong> {booking.withCaptain ? "Oui" : "Non"}
//             </p>
//             <p>
//               <strong>Repas inclus :</strong>{" "}
//               {booking.mealOption ? "Oui" : "Non"}
//             </p>

//             {booking.description && (
//               <p>
//                 <strong>Commentaire :</strong> {booking.description}
//               </p>
//             )}

//             {bookingOptions.length > 0 && (
//               <div>
//                 <strong>Options :</strong>
//                 <ul className={styles.optionsList}>
//                   {bookingOptions.map((opt) => (
//                     <li key={opt.id}>
//                       {opt.label} - {opt.quantity} x{" "}
//                       {(opt.unitPrice ?? 0).toFixed(2)} €
//                       {opt.description && ` (${opt.description})`}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             <div className={styles.buttons}>
//               <button
//                 onClick={() => handleStatusChange(booking.id, "APPROVED")}
//                 disabled={loadingId === booking.id}
//                 className={styles.approve}
//               >
//                 {loadingId === booking.id ? "Mise à jour…" : "Approuver"}
//               </button>
//               <button
//                 onClick={() => handleStatusChange(booking.id, "REJECTED")}
//                 disabled={loadingId === booking.id}
//                 className={styles.reject}
//               >
//                 {loadingId === booking.id ? "Mise à jour…" : "Rejeter"}
//               </button>
//               <button
//                 onClick={() => handleStatusChange(booking.id, "PAID")}
//                 disabled={loadingId === booking.id}
//                 className={styles.paid}
//               >
//                 {loadingId === booking.id
//                   ? "Mise à jour…"
//                   : "Marquer comme payé"}
//               </button>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default BookingList;

// components/Booking/BookingList.tsx
"use client";

import React, { useEffect, useState } from "react";
import { BookingWithDetails } from "@/types";
import styles from "./styles.module.scss";

export default function BookingList() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/bookings/profile`);
        if (!res.ok)
          throw new Error("Erreur lors du chargement des réservations");

        const data: BookingWithDetails[] = await res.json();
        const parsed = data.map((booking) => ({
          ...booking,
          startTime: new Date(booking.startTime),
          endTime: new Date(booking.endTime),
        }));

        setBookings(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  return (
    <>
      <span className={styles.title}>
        {" "}
        <h2>Mes réservations</h2>
      </span>

      <div className={styles.bookings}>
        {loading && <p>Chargement des réservations...</p>}
        {error && <p className={styles.error}>Erreur : {error}</p>}
        {!loading && bookings.length === 0 && <p>Aucune réservation.</p>}

        <ul className={styles.bookingList}>
          {bookings.map((booking) => {
            const totalOptions = booking.bookingOptions.reduce(
              (sum, opt) =>
                sum + (Number(opt.option.unitPrice) || 0) * (opt.quantity || 0),
              0
            );

            return (
              <li key={booking.id} className={styles.bookingItem}>
                <p>
                  <strong>Service:</strong> {booking.service?.name || "—"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {booking.startTime.toLocaleDateString("fr-FR", {
                    dateStyle: "long",
                  })}
                </p>
                <p>
                  <strong>Heure:</strong>{" "}
                  {booking.startTime.toLocaleTimeString("fr-FR")} -{" "}
                  {booking.endTime.toLocaleTimeString("fr-FR")}
                </p>
                <p>
                  <strong>Statut:</strong> {booking.status}
                </p>
                <p>
                  <strong>Montant bateau:</strong>{" "}
                  {booking.boatAmount.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: booking.service?.currency || "EUR",
                  })}
                </p>

                {booking.description && (
                  <p>
                    <strong>Note:</strong> {booking.description}
                  </p>
                )}

                {booking.bookingOptions.length > 0 && (
                  <>
                    <strong>Options:</strong>
                    <ul>
                      {booking.bookingOptions.map((opt) => (
                        <li key={opt.id}>
                          {opt.option.label} x {opt.quantity} —{" "}
                          {(opt.option.unitPrice * opt.quantity).toLocaleString(
                            "fr-FR",
                            {
                              style: "currency",
                              currency: booking.service?.currency || "EUR",
                            }
                          )}
                        </li>
                      ))}
                    </ul>
                    <p>
                      <strong>Total options:</strong>{" "}
                      {totalOptions.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: booking.service?.currency || "EUR",
                      })}
                    </p>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
