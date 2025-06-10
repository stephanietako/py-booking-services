// UserProfile.tsx
// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import UserProfileUpdateForm from "../UserProfileUpdateForm/UserProfileUpdateForm";
// import UserBookingCard from "../UserBookingCard/UserBookingCard";
// import { Booking } from "@/types";

// interface UserProfileProps {
//   userId: string;
// }

// const BOOKINGS_PER_PAGE = 5;

// const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [toast, setToast] = useState<{
//     message: string;
//     type: "success" | "error";
//   } | null>(null);

//   const fetchBookings = useCallback(
//     async (page: number) => {
//       setLoading(true);
//       setError("");
//       try {
//         const res = await fetch(
//           `/api/bookings?userId=${userId}&page=${page}&limit=${BOOKINGS_PER_PAGE}`
//         );
//         if (!res.ok)
//           throw new Error("Erreur lors du chargement des réservations");
//         const data = await res.json();
//         setBookings(data.bookings);
//         setTotalPages(data.pagination.totalPages);
//       } catch (e) {
//         console.error(e);
//         setError("Impossible de charger les réservations");
//       } finally {
//         setLoading(false);
//       }
//     },
//     [userId]
//   );

//   useEffect(() => {
//     fetchBookings(page);
//   }, [page, fetchBookings]);

//   const handleCancelBooking = async (booking: Booking) => {
//     if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?"))
//       return;
//     try {
//       const res = await fetch(`/api/bookings/${booking.id}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) throw new Error("Erreur lors de l'annulation");
//       setBookings((prev) => prev.filter((b) => b.id !== booking.id));
//       setToast({ message: "Réservation annulée avec succès", type: "success" });
//     } catch {
//       setToast({
//         message: "Impossible d'annuler la réservation",
//         type: "error",
//       });
//     }
//   };

//   useEffect(() => {
//     if (!toast) return;
//     const timer = setTimeout(() => setToast(null), 3000);
//     return () => clearTimeout(timer);
//   }, [toast]);

//   return (
//     <main>
//       <h1>Mon profil</h1>

//       {toast && (
//         <div
//           style={{
//             position: "fixed",
//             top: 10,
//             right: 10,
//             padding: "10px 20px",
//             backgroundColor: toast.type === "success" ? "#4caf50" : "#f44336",
//             color: "white",
//             borderRadius: 4,
//             zIndex: 9999,
//           }}
//         >
//           {toast.message}
//         </div>
//       )}

//       <section>
//         <h2>Mes informations</h2>
//         <UserProfileUpdateForm userId={userId} />
//       </section>

//       <section>
//         <h2>Mes réservations</h2>
//         {loading && <p>Chargement des réservations...</p>}
//         {error && <p style={{ color: "red" }}>{error}</p>}
//         {!loading && bookings.length === 0 && (
//           <p>Aucune réservation trouvée.</p>
//         )}
//         {!loading &&
//           bookings.map((booking) => (
//             <UserBookingCard
//               key={booking.id}
//               booking={booking}
//               onCancel={handleCancelBooking}
//             />
//           ))}
//         {totalPages > 1 && (
//           <div style={{ marginTop: 20 }}>
//             <button
//               onClick={() => setPage((p) => Math.max(p - 1, 1))}
//               disabled={page === 1}
//               style={{ marginRight: 10 }}
//             >
//               Précédent
//             </button>
//             <span>
//               Page {page} sur {totalPages}
//             </span>
//             <button
//               onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
//               disabled={page === totalPages}
//               style={{ marginLeft: 10 }}
//             >
//               Suivant
//             </button>
//           </div>
//         )}
//       </section>
//     </main>
//   );
// };

// export default UserProfile;
// app/components/UserProfile/UserProfile.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import UserProfileUpdateForm from "../UserProfileUpdateForm/UserProfileUpdateForm";
import UserBookingCard from "../UserBookingCard/UserBookingCard";
import { Booking, PaginationInfo } from "@/types"; // Assure-toi que ce type est bien défini et complet

// Importe useUser pour accéder aux informations de l'utilisateur Clerk
import { useUser } from "@clerk/nextjs";

interface UserProfileProps {
  userId: string; // L'ID de l'utilisateur de Clerk (sera le `clerkUserId` dans ta DB)
  // Ajout de la nouvelle prop : la fonction d'action pour récupérer les réservations
  fetchBookingsAction: (
    userId: string
  ) => Promise<Booking[] | { bookings: Booking[]; pagination: PaginationInfo }>;
}

const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  fetchBookingsAction,
}) => {
  const { isLoaded, isSignedIn } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchAndSetUserBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // S'assurer que l'utilisateur Clerk est chargé et connecté
      if (!isLoaded || !isSignedIn) {
        setLoading(false);
        return;
      }

      // Appelle l'action serveur passée en prop, avec l'ID utilisateur Clerk
      const result = await fetchBookingsAction(userId);

      // Gère les deux types de retour possibles pour fetchBookingsAction (tableau ou objet paginé)
      if (Array.isArray(result)) {
        setBookings(result); // Si la fonction renvoie directement un tableau de réservations
        // Pas de totalPages car toutes les réservations sont ramenées
      } else if (result && "bookings" in result) {
        setBookings(result.bookings); // Si elle renvoie un objet avec bookings et pagination
        // setTotalPages(result.pagination.totalPages);
      } else {
        throw new Error("Format de données de réservations inattendu.");
      }
    } catch (e) {
      console.error("Erreur lors du chargement des réservations:", e);
      setError("Impossible de charger vos réservations.");
    } finally {
      setLoading(false);
    }
  }, [userId, fetchBookingsAction, isLoaded, isSignedIn]);

  useEffect(() => {
    fetchAndSetUserBookings();
  }, [fetchAndSetUserBookings]);

  const handleCancelBooking = async (booking: Booking) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?"))
      return;
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur lors de l'annulation");
      // Après annulation,  rafraîchit les réservations
      await fetchAndSetUserBookings(); // Recharge les réservations après annulation
      setToast({ message: "Réservation annulée avec succès", type: "success" });
    } catch (e) {
      console.error(e);
      setToast({
        message: "Impossible d'annuler la réservation",
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!isLoaded) {
    return (
      <main style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
        Chargement du profil...
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
        Veuillez vous connecter pour voir votre profil.
      </main>
    );
  }

  return (
    <main style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <h1>Mon profil</h1>

      {toast && (
        <div
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            padding: "10px 20px",
            backgroundColor: toast.type === "success" ? "#4caf50" : "#f44336",
            color: "white",
            borderRadius: 4,
            zIndex: 9999,
          }}
        >
          {toast.message}
        </div>
      )}

      <section>
        <h2>Mes informations</h2>

        <UserProfileUpdateForm userId={userId} />
      </section>

      <section>
        <h2 id="my-bookings">Mes réservations</h2>
        {loading && <p>Chargement de vos réservations...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && bookings.length === 0 && (
          <p>Aucune réservation trouvée.</p>
        )}
        {!loading &&
          bookings.length > 0 &&
          bookings.map((booking) => (
            <UserBookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
            />
          ))}

        {/* {totalPages > 1 && (
          <div style={{ marginTop: 20 }}>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              style={{ marginRight: 10 }}
            >
              Précédent
            </button>
            <span>
              Page {page} sur {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              style={{ marginLeft: 10 }}
            >
              Suivant
            </button>
          </div>
        )} */}
      </section>
    </main>
  );
};

export default UserProfile;
