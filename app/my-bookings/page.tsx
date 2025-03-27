// "use client";

// import { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { getUserBookings, generateBookingToken } from "@/actions/bookings";
// import Link from "next/link";
// import Wrapper from "@/app/components/Wrapper/Wrapper";
// import styles from "./styles.module.scss"; // Ajoute un fichier SCSS pour styliser
// import { Booking } from "@/types";

// const MyBookingPage = () => {
//   const { user, isSignedIn } = useUser();
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchBookings = async () => {
//       if (!user || !isSignedIn) return;

//       try {
//         const userBookings = await getUserBookings(user.id);

//         // Génère les tokens (seule opération nécessaire)
//         const bookingsWithTokens = await Promise.all(
//           userBookings.map(async (booking) => ({
//             ...booking,
//             token: await generateBookingToken(booking.id, user.id),
//           }))
//         );

//         setBookings(bookingsWithTokens);
//       } catch (err) {
//         console.error("Erreur lors de la récupération :", err);
//         setError("Impossible de charger vos réservations.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, [user, isSignedIn]);

//   if (loading) {
//     return (
//       <Wrapper>
//         <p>Chargement des réservations...</p>
//       </Wrapper>
//     );
//   }

//   if (error) {
//     return (
//       <Wrapper>
//         <p className="error">{error}</p>
//       </Wrapper>
//     );
//   }

//   return (
//     <Wrapper>
//       <h1>Mes Réservations</h1>

//       {bookings.length === 0 ? (
//         <p>Vous n&apos;avez aucune réservation.</p>
//       ) : (
//         <div className={styles.bookingList}>
//           {bookings.map((booking) => (
//             <div key={booking.id} className={styles.bookingCard}>
//               <h2>{booking.service.name}</h2>
//               <p>
//                 <strong>Date :</strong>{" "}
//                 {new Date(booking.startTime).toLocaleDateString("fr-FR")}
//               </p>
//               <p>
//                 <strong>Heure :</strong>{" "}
//                 {new Date(booking.startTime).toLocaleTimeString("fr-FR")} -{" "}
//                 {new Date(booking.endTime).toLocaleTimeString("fr-FR")}
//               </p>
//               <p>
//                 <strong>Statut :</strong> {booking.status}
//               </p>
//               <p>
//                 <strong>Montant :</strong>{" "}
//                 {new Intl.NumberFormat("fr-FR", {
//                   style: "currency",
//                   currency: "EUR",
//                 }).format(booking.totalAmount)}
//               </p>
//               <Link
//                 href={`/manage-booking?token=${booking.token}`}
//                 className={styles.manageButton}
//               >
//                 Gérer
//               </Link>
//             </div>
//           ))}
//         </div>
//       )}
//     </Wrapper>
//   );
// };

// export default MyBookingPage;

"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getUserBookings, generateBookingToken } from "@/actions/bookings";
import Link from "next/link";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import styles from "./styles.module.scss";
import { Booking } from "@/types";

const MyBookingPage = () => {
  const { user, isSignedIn } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || !isSignedIn) return;

      try {
        const userBookings = await getUserBookings(user.id);
        const bookingsWithTokens = await Promise.all(
          userBookings.map(async (booking) => ({
            ...booking,
            token: await generateBookingToken(booking.id, user.id),
          }))
        );

        setBookings(bookingsWithTokens);
      } catch (err) {
        console.error("Erreur lors de la récupération :", err);
        setError("Impossible de charger vos réservations.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, isSignedIn]);

  if (loading) {
    return (
      <Wrapper>
        <div className={styles.loader}></div>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper>
        <p className={styles.error}>{error}</p>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <h1 className={styles.title}>📅 Mes Réservations</h1>

      {bookings.length === 0 ? (
        <p className={styles.noBookings}>Aucune réservation trouvée.</p>
      ) : (
        <div className={styles.bookingList}>
          {bookings.map((booking) => (
            <div key={booking.id} className={styles.bookingCard}>
              <h2>{booking.service.name}</h2>
              <p>
                <strong>Date :</strong>{" "}
                {new Date(booking.startTime).toLocaleDateString("fr-FR")}
              </p>
              <p>
                <strong>Heure :</strong>{" "}
                {new Date(booking.startTime).toLocaleTimeString("fr-FR")} -{" "}
                {new Date(booking.endTime).toLocaleTimeString("fr-FR")}
              </p>
              <p>
                <strong>Statut :</strong>{" "}
                <span className={styles.status}>{booking.status}</span>
              </p>
              <p>
                <strong>Montant :</strong>{" "}
                <span className={styles.price}>
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(booking.totalAmount)}
                </span>
              </p>
              <Link
                href={`/manage-booking?token=${booking.token}`}
                className={styles.manageButton}
              >
                ✏️ Gérer
              </Link>
            </div>
          ))}
        </div>
      )}
    </Wrapper>
  );
};

export default MyBookingPage;
