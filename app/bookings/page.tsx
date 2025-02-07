// "use client";

// import { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { getUserBookings, deleteUserBooking } from "@/actions/bookings";
// import { Booking } from "@/types";
// import toast from "react-hot-toast";

// const MyBookings = () => {
//   const { user } = useUser();
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState<string | null>(null);

//   useEffect(() => {
//     if (!user) return;

//     const fetchBookings = async () => {
//       setLoading(true);
//       try {
//         const data = await getUserBookings(user.id);

//         // Adapter les données côté client
//         const formattedData = data.map((booking) => ({
//           id: booking.id,
//           userId: booking.userId,
//           serviceId: booking.serviceId,
//           createdAt: new Date(booking.createdAt),
//           status: booking.status as "confirmed" | "pending", // Cast du statut
//           service: booking.service, // Déjà récupéré par Prisma
//           user: booking.user, // Déjà récupéré par Prisma
//           transactions: booking.transactions ?? [], // Garantir un tableau
//         }));

//         setBookings(formattedData);
//       } catch (error) {
//         console.error("Erreur lors du chargement des réservations :", error);
//         setError("Impossible de charger les réservations.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, [user]);

//   const handleDeleteBooking = async (bookingId: string) => {
//     if (!user) return;
//     if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

//     setDeleting(bookingId);
//     const toastId = toast.loading("Annulation en cours...");

//     try {
//       await deleteUserBooking(bookingId); // Passer uniquement `bookingId`

//       // Mise à jour locale après suppression
//       setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));

//       toast.success("Réservation annulée avec succès !", { id: toastId });
//     } catch (error) {
//       console.error("Erreur lors de l'annulation :", error);
//       toast.error("Impossible d'annuler la réservation.", { id: toastId });
//     } finally {
//       setDeleting(null);
//     }
//   };

//   return (
//     <div>
//       <h1>Mes réservations</h1>

//       {loading && <p>Chargement en cours...</p>}
//       {error && <p className="text-red-500">{error}</p>}
//       {!loading && bookings.length === 0 && <p>Aucune réservation</p>}

//       {!loading && bookings.length > 0 && (
//         <ul>
//           {bookings.map((booking) => (
//             <li key={booking.id}>
//               <p>Service: {booking.service.name}</p>
//               <p>
//                 Date de réservation:{" "}
//                 {new Date(booking.createdAt).toLocaleString()}
//               </p>
//               <p>
//                 Statut:{" "}
//                 <span
//                   className={
//                     booking.status === "confirmed"
//                       ? "text-green"
//                       : "text-orange"
//                   }
//                 >
//                   {booking.status === "confirmed"
//                     ? "Confirmée ✅"
//                     : "En attente ⏳"}
//                 </span>
//               </p>
//               <button
//                 onClick={() => handleDeleteBooking(booking.id)} // Passer uniquement `booking.id`
//                 disabled={deleting === booking.id}
//               >
//                 {deleting === booking.id ? "Annulation..." : "Annuler"}
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default MyBookings;
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getUserBookings, deleteUserBooking } from "@/actions/bookings";
import { Booking } from "@/types";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await getUserBookings(user.id);

        // Adapter les données côté client
        const formattedData = data.map((booking) => ({
          id: booking.id,
          userId: booking.userId,
          serviceId: booking.serviceId,
          createdAt: new Date(booking.createdAt),
          status: booking.status as "confirmed" | "pending", // Cast du statut
          service: booking.service, // Déjà récupéré par Prisma
          user: booking.user, // Déjà récupéré par Prisma
          transactions: booking.transactions ?? [], // Garantir un tableau
        }));

        setBookings(formattedData);
      } catch (error) {
        console.error("Erreur lors du chargement des réservations :", error);
        setError("Impossible de charger les réservations.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleDeleteBooking = async (bookingId: string) => {
    if (!user) return;
    if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

    setDeleting(bookingId);
    const toastId = toast.loading("Annulation en cours...");

    try {
      await deleteUserBooking(bookingId); // Passer uniquement `bookingId`

      // Mise à jour locale après suppression
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));

      toast.success("Réservation annulée avec succès !", { id: toastId });
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
      toast.error("Impossible d'annuler la réservation.", { id: toastId });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <h1>Mes réservations</h1>

      {loading && <p>Chargement en cours...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && bookings.length === 0 && <p>Aucune réservation</p>}

      {!loading && bookings.length > 0 && (
        <ul>
          {bookings.map((booking) => (
            <li key={booking.id}>
              <p>Service: {booking.service.name}</p>
              <p>
                Date de réservation:{" "}
                {new Date(booking.createdAt).toLocaleString()}
              </p>
              <p>
                Statut:{" "}
                <span
                  className={
                    booking.status === "confirmed"
                      ? "text-green"
                      : "text-orange"
                  }
                >
                  {booking.status === "confirmed"
                    ? "Confirmée ✅"
                    : "En attente ⏳"}
                </span>
              </p>
              <button
                onClick={() => handleDeleteBooking(booking.id)} // Passer uniquement `booking.id`
                disabled={deleting === booking.id}
              >
                {deleting === booking.id ? "Annulation..." : "Annuler"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyBookings;
