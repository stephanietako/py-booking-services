// "use client";
// // Page de confirmation de réservation à partir d’un token en URL (/manage-booking?token=abc123).
// // Récupère les infos et permet au client de soumettre ses coordonnées.
// import React, { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { useSearchParams } from "next/navigation";
// import toast from "react-hot-toast";
// import styles from "./styles.module.scss";
// import { getBookingById, getBookingIdFromToken } from "@/actions/bookings";
// import Wrapper from "@/app/components/Wrapper/Wrapper";
// import Spinner from "../Spinner/Spinner";
// import { Booking } from "@/types";

// const ManageBookingClient = () => {
//   const { user, isSignedIn, isLoaded } = useUser();
//   const searchParams = useSearchParams();

//   const [booking, setBooking] = useState<Booking | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Form fields
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");

//   // Fetch booking by token
//   useEffect(() => {
//     const fetchBooking = async () => {
//       try {
//         const token = searchParams.get("token");
//         if (!token) throw new Error("Lien de réservation invalide.");

//         const bookingId = await getBookingIdFromToken(token);
//         if (!bookingId) throw new Error("Réservation introuvable.");

//         const bookingDetails = await getBookingById(bookingId);
//         setBooking(bookingDetails);

//         // Préremplir si connecté
//         if (isSignedIn && user) {
//           const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`;
//           setFullName(fullName.trim());
//           setEmail(user.emailAddresses[0]?.emailAddress ?? "");
//         }
//       } catch (err) {
//         const message = err instanceof Error ? err.message : "Erreur inconnue";
//         setError(message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (isLoaded) {
//       fetchBooking();
//     }
//   }, [isLoaded, isSignedIn, searchParams, user]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!fullName || !email || !phone) {
//       toast.error("Merci de remplir tous les champs.");
//       return;
//     }

//     try {
//       const res = await fetch("/api/bookings/send-details", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           bookingId: booking.id,
//           fullName,
//           email,
//           phone,
//         }),
//       });

//       const result = await res.json();

//       if (!res.ok) {
//         throw new Error(result.error || "Erreur lors de l’envoi");
//       }

//       toast.success("Informations envoyées !");
//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : "Erreur inconnue");
//     }
//   };

//   if (loading) {
//     return (
//       <Wrapper>
//         <Spinner />
//       </Wrapper>
//     );
//   }

//   if (error || !booking) {
//     return (
//       <Wrapper>
//         <p className={styles.error}>{error || "Réservation introuvable."}</p>
//       </Wrapper>
//     );
//   }

//   return (
//     <Wrapper>
//       <form onSubmit={handleSubmit} className={styles.form}>
//         <h2 className={styles.title}>Confirmez votre réservation</h2>

//         <div className={styles.field}>
//           <label htmlFor="fullName">Nom complet</label>
//           <input
//             id="fullName"
//             type="text"
//             value={fullName}
//             onChange={(e) => setFullName(e.target.value)}
//             required
//           />
//         </div>

//         <div className={styles.field}>
//           <label htmlFor="email">Adresse email</label>
//           <input
//             id="email"
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>

//         <div className={styles.field}>
//           <label htmlFor="phone">Numéro de téléphone</label>
//           <input
//             id="phone"
//             type="tel"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//             required
//           />
//         </div>

//         <button type="submit" className={styles.submitBtn}>
//           Envoyer la demande
//         </button>
//       </form>
//     </Wrapper>
//   );
// };

// export default ManageBookingClient;
