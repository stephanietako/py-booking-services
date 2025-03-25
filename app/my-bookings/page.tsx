// "use client";
// import { useEffect, useState, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import { getUserBookings, deleteUserBooking } from "@/actions/bookings";
// import { Booking, Option } from "@/types";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import Wrapper from "../components/Wrapper/Wrapper";
// import OptionManager from "../components/OptionManager/OptionManager";
// import ServiceCompt from "../components/ServicesCompt/ServiceCompt";
// import { useBookingStore } from "@/store"; // Import du store Zustand

// const MyBookings = () => {
//   const { user } = useUser();
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState<string | null>(null);

//   const router = useRouter();

//   const { totalAmounts, setTotalAmount, setOptions } = useBookingStore();

//   useEffect(() => {
//     if (!user) return;

//     const fetchBookings = async () => {
//       setLoading(true);
//       try {
//         const data = await getUserBookings(user.id);
//         setBookings(data);

//         // Mise à jour des montants dans Zustand
//         data.forEach((booking) => {
//           setTotalAmount(booking.id, booking.totalAmount);
//           setOptions(booking.id, booking.options || []); // Assurer la gestion des options
//         });
//       } catch (error) {
//         console.error("Erreur lors du chargement des réservations :", error);
//         setError("Impossible de charger les réservations.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, [user, setTotalAmount, setOptions]);

//   const handleTotalUpdate = useCallback(
//     (bookingId: string, total: number, updatedOptions: Option[]) => {
//       setTotalAmount(bookingId, total);
//       setOptions(bookingId, updatedOptions);

//       setBookings((prevBookings) =>
//         prevBookings.map((booking) =>
//           booking.id === bookingId
//             ? { ...booking, totalAmount: total, options: updatedOptions }
//             : booking
//         )
//       );
//     },
//     [setTotalAmount, setOptions]
//   );

//   const handleDeleteBooking = async (bookingId: string) => {
//     if (!user) {
//       toast.error("Utilisateur non authentifié.");
//       return;
//     }

//     const confirmation = confirm(
//       "Voulez-vous vraiment annuler cette réservation ?"
//     );
//     if (!confirmation) return;

//     setDeleting(bookingId);
//     const toastId = toast.loading("Annulation en cours...");

//     try {
//       await deleteUserBooking(bookingId, user.id);
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
//     <Wrapper>
//       <div className="booking">
//         <h1>Mes réservations</h1>

//         {loading && <p>Chargement en cours...</p>}
//         {error && <p className="error">{error}</p>}
//         {!loading && bookings.length === 0 && <p>Aucune réservation</p>}

//         {!loading && bookings.length > 0 && (
//           <ul className="booking_item">
//             {bookings.map((booking) => (
//               <li key={booking.id} className="booking_item__content">
//                 <ServiceCompt
//                   name={booking.service.name}
//                   description={
//                     booking.service.description ||
//                     "Aucune description disponible"
//                   }
//                   imageUrl={booking.service.imageUrl || "/assets/default.jpg"}
//                   categories={booking.service.categories}
//                   startTime={booking.startTime}
//                   endTime={booking.endTime}
//                   options={booking.options || []}
//                   totalAmount={totalAmounts[booking.id] ?? booking.totalAmount}
//                 />
//                 <div className="booking_option">
//                   <OptionManager
//                     bookingId={booking.id}
//                     serviceAmount={
//                       totalAmounts[booking.id] ?? booking.totalAmount
//                     }
//                     onTotalUpdate={(total, updatedOptions) =>
//                       handleTotalUpdate(booking.id, total, updatedOptions)
//                     }
//                   />
//                   <span className="booking_option__btn">
//                     <button
//                       onClick={() => handleDeleteBooking(booking.id)}
//                       disabled={deleting === booking.id}
//                     >
//                       {deleting === booking.id ? "Annulation..." : "Annuler"}
//                     </button>
//                     <button
//                       onClick={() =>
//                         router.push(`/manage-booking/${booking.id}`)
//                       }
//                     >
//                       Voir la réservation
//                     </button>
//                   </span>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </Wrapper>
//   );
// };

// export default MyBookings;
////////////////////////////////////
// "use client";
// import { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { getUserBookings, deleteUserBooking } from "@/actions/bookings";
// import { Booking, Option } from "@/types";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import Wrapper from "../components/Wrapper/Wrapper";
// import OptionManager from "../components/OptionManager/OptionManager";
// import ServiceCompt from "../components/ServicesCompt/ServiceCompt";
// import { useBookingStore } from "@/store"; // Zustand

// const MyBookings = () => {
//   const { user } = useUser();
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState<string | null>(null); // ✅ Réintégré pour la suppression
//   const router = useRouter();

//   const { totalAmounts, setTotalAmount, setOptions } = useBookingStore();

//   useEffect(() => {
//     if (!user?.id) return;

//     const fetchBookings = async () => {
//       setLoading(true);
//       try {
//         const data = await getUserBookings(user.id);
//         setBookings(data);

//         data.forEach((booking) => {
//           setTotalAmount(booking.id, booking.totalAmount);
//           setOptions(booking.id, booking.options || []);
//         });
//       } catch (error) {
//         console.error("Erreur lors du chargement des réservations :", error);
//         setError("Impossible de charger les réservations.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, [user?.id, setTotalAmount, setOptions]);

//   const handleTotalUpdate = (
//     bookingId: string,
//     total: number,
//     updatedOptions: Option[]
//   ) => {
//     setTotalAmount(bookingId, total);
//     setOptions(bookingId, updatedOptions);
//     setBookings((prevBookings) =>
//       prevBookings.map((booking) =>
//         booking.id === bookingId
//           ? { ...booking, totalAmount: total, options: updatedOptions }
//           : booking
//       )
//     );
//   };

//   // ✅ Réintégré et utilisé `handleDeleteBooking`
//   const handleDeleteBooking = async (bookingId: string) => {
//     if (!user?.id) {
//       toast.error("Utilisateur non authentifié.");
//       return;
//     }

//     if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

//     setDeleting(bookingId);
//     const toastId = toast.loading("Annulation en cours...");

//     try {
//       await deleteUserBooking(bookingId, user.id);
//       setBookings((prev) => prev.filter((booking) => booking.id !== bookingId)); // ✅ Suppression après succès
//       toast.success("Réservation annulée avec succès !", { id: toastId });
//     } catch (error) {
//       console.error("Erreur lors de l'annulation :", error);
//       toast.error("Impossible d'annuler la réservation.", { id: toastId });
//     } finally {
//       setDeleting(null);
//     }
//   };

//   return (
//     <Wrapper>
//       <div className="booking">
//         <h1>Mes réservations</h1>

//         {loading && <p>Chargement en cours...</p>}
//         {error && <p className="error">{error}</p>}
//         {!loading && bookings.length === 0 && <p>Aucune réservation</p>}

//         {!loading && bookings.length > 0 && (
//           <ul className="booking_item">
//             {bookings.map((booking) => (
//               <li key={booking.id} className="booking_item__content">
//                 <ServiceCompt
//                   name={booking.service.name}
//                   description={
//                     booking.service.description ||
//                     "Aucune description disponible"
//                   }
//                   imageUrl={booking.service.imageUrl || "/assets/default.jpg"}
//                   categories={booking.service.categories}
//                   startTime={booking.startTime}
//                   endTime={booking.endTime}
//                   options={booking.options || []}
//                   totalAmount={totalAmounts[booking.id] ?? booking.totalAmount}
//                 />
//                 <div className="booking_option">
//                   <OptionManager
//                     bookingId={booking.id}
//                     serviceAmount={
//                       totalAmounts[booking.id] ?? booking.totalAmount
//                     }
//                     onTotalUpdate={(total, updatedOptions) =>
//                       handleTotalUpdate(booking.id, total, updatedOptions)
//                     }
//                   />
//                   <span className="booking_option__btn">
//                     {/* ✅ Ajout du bouton pour supprimer la réservation */}
//                     <button
//                       onClick={() => handleDeleteBooking(booking.id)}
//                       disabled={deleting === booking.id}
//                     >
//                       {deleting === booking.id ? "Annulation..." : "Annuler"}
//                     </button>
//                     <button
//                       onClick={() =>
//                         router.push(`/manage-booking/${booking.id}`)
//                       }
//                     >
//                       Voir la réservation
//                     </button>
//                   </span>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </Wrapper>
//   );
// };

// export default MyBookings;
////////////////////////////////
// "use client";
// import { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { getUserBookings, deleteUserBooking } from "@/actions/bookings";
// import { Booking, Option } from "@/types";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import Wrapper from "../components/Wrapper/Wrapper";
// import OptionManager from "../components/OptionManager/OptionManager";
// import ServiceCompt from "../components/ServicesCompt/ServiceCompt";
// import { useBookingStore } from "@/store"; // Zustand

// const MyBookings = () => {
//   const { user } = useUser();
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState<string | null>(null);
//   const router = useRouter();

//   const { totalAmounts, setTotalAmount, setOptions, resetStore } =
//     useBookingStore();

//   useEffect(() => {
//     if (!user?.id) return;

//     // ✅ Réinitialiser Zustand avant de charger les nouvelles réservations
//     resetStore();

//     const fetchBookings = async () => {
//       setLoading(true);
//       try {
//         const data = await getUserBookings(user.id);
//         setBookings(data);

//         // ✅ Vérifier que les options ne sont pas dupliquées
//         data.forEach((booking) => {
//           setTotalAmount(booking.id, booking.totalAmount);
//           setOptions(booking.id, booking.options || []);
//         });
//       } catch (error) {
//         console.error("Erreur lors du chargement des réservations :", error);
//         setError("Impossible de charger les réservations.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, [user?.id, setTotalAmount, setOptions, resetStore]);

//   const handleTotalUpdate = (
//     bookingId: string,
//     total: number,
//     updatedOptions: Option[]
//   ) => {
//     setTotalAmount(bookingId, total);
//     setOptions(bookingId, updatedOptions);
//     setBookings((prevBookings) =>
//       prevBookings.map((booking) =>
//         booking.id === bookingId
//           ? { ...booking, totalAmount: total, options: updatedOptions }
//           : booking
//       )
//     );
//   };

//   // ✅ Ajout de la suppression de réservation avec toast et router
//   const handleDeleteBooking = async (bookingId: string) => {
//     if (!user?.id) {
//       toast.error("Utilisateur non authentifié.");
//       return;
//     }

//     if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

//     setDeleting(bookingId);
//     const toastId = toast.loading("Annulation en cours...");

//     try {
//       await deleteUserBooking(bookingId, user.id);
//       setBookings((prev) => prev.filter((booking) => booking.id !== bookingId)); // ✅ Suppression après succès
//       toast.success("Réservation annulée avec succès !", { id: toastId });

//       // ✅ Rediriger l'utilisateur vers une autre page après la suppression
//       router.push("/my-bookings");
//     } catch (error) {
//       console.error("Erreur lors de l'annulation :", error);
//       toast.error("Impossible d'annuler la réservation.", { id: toastId });
//     } finally {
//       setDeleting(null);
//     }
//   };

//   return (
//     <Wrapper>
//       <div className="booking">
//         <h1>Mes réservations</h1>

//         {loading && <p>Chargement en cours...</p>}
//         {error && <p className="error">{error}</p>}
//         {!loading && bookings.length === 0 && <p>Aucune réservation</p>}

//         {!loading && bookings.length > 0 && (
//           <ul className="booking_item">
//             {bookings.map((booking) => (
//               <li key={booking.id} className="booking_item__content">
//                 <ServiceCompt
//                   name={booking.service.name}
//                   description={
//                     booking.service.description ||
//                     "Aucune description disponible"
//                   }
//                   imageUrl={booking.service.imageUrl || "/assets/default.jpg"}
//                   categories={booking.service.categories}
//                   startTime={booking.startTime}
//                   endTime={booking.endTime}
//                   options={booking.options || []}
//                   totalAmount={totalAmounts[booking.id] ?? booking.totalAmount}
//                 />
//                 <div className="booking_option">
//                   <OptionManager
//                     bookingId={booking.id}
//                     serviceAmount={
//                       totalAmounts[booking.id] ?? booking.totalAmount
//                     }
//                     onTotalUpdate={(total, updatedOptions) =>
//                       handleTotalUpdate(booking.id, total, updatedOptions)
//                     }
//                   />
//                   <span className="booking_option__btn">
//                     {/* ✅ Ajout du bouton pour supprimer la réservation */}
//                     <button
//                       onClick={() => handleDeleteBooking(booking.id)}
//                       disabled={deleting === booking.id}
//                     >
//                       {deleting === booking.id ? "Annulation..." : "Annuler"}
//                     </button>
//                     <button
//                       onClick={() =>
//                         router.push(`/manage-booking/${booking.id}`)
//                       }
//                     >
//                       Voir la réservation
//                     </button>
//                   </span>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </Wrapper>
//   );
// };

// export default MyBookings;
// "use client";

// import { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { getUserBookings, deleteUserBooking } from "@/actions/bookings";
// import { Booking, Option } from "@/types";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import Wrapper from "../components/Wrapper/Wrapper";
// import OptionManager from "../components/OptionManager/OptionManager";
// import ServiceCompt from "../components/ServicesCompt/ServiceCompt";
// import { useBookingStore } from "@/store"; // Zustand

// const MyBookings = () => {
//   const { user } = useUser();
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState<string | null>(null);
//   const router = useRouter();

//   const { totalAmounts, setTotalAmount, setOptions, calculateTotal } =
//     useBookingStore();

//   useEffect(() => {
//     if (!user?.id) return;

//     // Chargement des réservations de l'utilisateur
//     const fetchBookings = async () => {
//       setLoading(true);
//       try {
//         const data = await getUserBookings(user.id);
//         setBookings(data);

//         // Mettre à jour le store avec les données récupérées
//         data.forEach((booking) => {
//           // Calculer le total initial en vérifiant si options existent
//           const initialTotal = calculateTotal(
//             booking.service.amount,
//             booking.options || []
//           );
//           setTotalAmount(booking.id, initialTotal);
//           setOptions(booking.id, booking.options || []);
//         });
//       } catch (error) {
//         console.error("Erreur lors du chargement des réservations :", error);
//         setError("Impossible de charger les réservations.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, [user?.id, setTotalAmount, setOptions, calculateTotal]);

//   const handleTotalUpdate = (
//     bookingId: string,
//     total: number, // Ajoutez un paramètre `total`
//     updatedOptions: Option[] // Ajoutez un paramètre `updatedOptions`
//   ) => {
//     // Assurez-vous de calculer le total de manière correcte si nécessaire
//     setTotalAmount(bookingId, total);
//     setOptions(bookingId, updatedOptions);

//     setBookings((prevBookings) =>
//       prevBookings.map((booking) =>
//         booking.id === bookingId
//           ? { ...booking, totalAmount: total, options: updatedOptions }
//           : booking
//       )
//     );
//   };

//   const handleDeleteBooking = async (bookingId: string) => {
//     if (!user?.id) {
//       toast.error("Utilisateur non authentifié.");
//       return;
//     }

//     if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

//     setDeleting(bookingId);
//     const toastId = toast.loading("Annulation en cours...");

//     try {
//       await deleteUserBooking(bookingId, user.id);
//       setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
//       toast.success("Réservation annulée avec succès !", { id: toastId });
//       router.push("/my-bookings");
//     } catch (error) {
//       console.error("Erreur lors de l'annulation :", error);
//       toast.error("Impossible d'annuler la réservation.", { id: toastId });
//     } finally {
//       setDeleting(null);
//     }
//   };

//   return (
//     <Wrapper>
//       <div className="booking">
//         <h1>Mes réservations</h1>

//         {loading && <p>Chargement en cours...</p>}
//         {error && <p className="error">{error}</p>}
//         {!loading && bookings.length === 0 && <p>Aucune réservation</p>}

//         {!loading && bookings.length > 0 && (
//           <ul className="booking_item">
//             {bookings.map((booking) => (
//               <li key={booking.id} className="booking_item__content">
//                 <ServiceCompt
//                   name={booking.service.name}
//                   description={
//                     booking.service.description ||
//                     "Aucune description disponible"
//                   }
//                   imageUrl={booking.service.imageUrl || "/assets/default.jpg"}
//                   categories={booking.service.categories}
//                   startTime={booking.startTime}
//                   endTime={booking.endTime}
//                   options={booking.options || []}
//                   totalAmount={totalAmounts[booking.id] ?? booking.totalAmount}
//                 />
//                 <div className="booking_option">
//                   <OptionManager
//                     bookingId={booking.id}
//                     serviceAmount={
//                       totalAmounts[booking.id] ?? booking.totalAmount
//                     }
//                     onTotalUpdate={
//                       (total: number, updatedOptions: Option[]) =>
//                         handleTotalUpdate(booking.id, total, updatedOptions) // Passez `total` et `updatedOptions`
//                     }
//                   />

//                   <span className="booking_option__btn">
//                     <button
//                       onClick={() => handleDeleteBooking(booking.id)}
//                       disabled={deleting === booking.id}
//                     >
//                       {deleting === booking.id ? "Annulation..." : "Annuler"}
//                     </button>
//                     <button
//                       onClick={() =>
//                         router.push(`/manage-booking/${booking.id}`)
//                       }
//                     >
//                       Voir la réservation
//                     </button>
//                   </span>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </Wrapper>
//   );
// };

// export default MyBookings;
// "use client";
// import { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { getUserBookings, deleteUserBooking } from "@/actions/bookings";
// import { Booking, Option } from "@/types";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import Wrapper from "../components/Wrapper/Wrapper";
// import OptionManager from "../components/OptionManager/OptionManager";
// import ServiceCompt from "../components/ServicesCompt/ServiceCompt";
// import { useBookingStore } from "@/store"; // Zustand

// const MyBookings = () => {
//   const { user } = useUser();
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState<string | null>(null);
//   const router = useRouter();

//   const { totalAmounts, setTotalAmount, setOptions, resetStore } =
//     useBookingStore();

//   useEffect(() => {
//     if (!user?.id) return;

//     resetStore(); // Réinitialisation du store avant de charger les réservations
//     console.log("Store réinitialisé");

//     const fetchBookings = async () => {
//       setLoading(true);
//       try {
//         const data = await getUserBookings(user.id);
//         setBookings(data);
//       } catch (error) {
//         console.error("Erreur lors du chargement des réservations :", error);
//         setError("Impossible de charger les réservations.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, [user?.id, setTotalAmount, setOptions, resetStore]);

//   const handleTotalUpdate = (
//     bookingId: string,
//     total: number,
//     updatedOptions: Option[]
//   ) => {
//     // Mettre à jour le total de manière stable, sans répétition des montants.
//     setTotalAmount(bookingId, total); // Mise à jour du total dans le store

//     // Mettre à jour les options sans les dupliquer
//     setOptions(bookingId, updatedOptions); // Mise à jour des options dans le store

//     // Mettre à jour l'état local de bookings
//     setBookings((prevBookings) =>
//       prevBookings.map((b) =>
//         b.id === bookingId
//           ? { ...b, totalAmount: total, options: updatedOptions }
//           : b
//       )
//     );
//   };

//   const handleDeleteBooking = async (bookingId: string) => {
//     if (!user?.id) {
//       toast.error("Utilisateur non authentifié.");
//       return;
//     }

//     if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

//     setDeleting(bookingId);
//     const toastId = toast.loading("Annulation en cours...");

//     try {
//       await deleteUserBooking(bookingId, user.id);
//       setBookings((prev) => prev.filter((booking) => booking.id !== bookingId)); // ✅ Suppression après succès
//       toast.success("Réservation annulée avec succès !", { id: toastId });

//       // ✅ Rediriger l'utilisateur vers une autre page après la suppression
//       router.push("/my-bookings");
//     } catch (error) {
//       console.error("Erreur lors de l'annulation :", error);
//       toast.error("Impossible d'annuler la réservation.", { id: toastId });
//     } finally {
//       setDeleting(null);
//     }
//   };

//   return (
//     <Wrapper>
//       <div className="booking">
//         <h1>Mes réservations</h1>

//         {loading && <p>Chargement en cours...</p>}
//         {error && <p className="error">{error}</p>}
//         {!loading && bookings.length === 0 && <p>Aucune réservation</p>}

//         {!loading && bookings.length > 0 && (
//           <ul className="booking_item">
//             {bookings.map((booking) => (
//               <li key={booking.id} className="booking_item__content">
//                 <ServiceCompt
//                   name={booking.service.name}
//                   description={
//                     booking.service.description ||
//                     "Aucune description disponible"
//                   }
//                   imageUrl={booking.service.imageUrl || "/assets/default.jpg"}
//                   categories={booking.service.categories}
//                   startTime={booking.startTime}
//                   endTime={booking.endTime}
//                   options={booking.options || []}
//                   totalAmount={totalAmounts[booking.id] ?? booking.totalAmount} // Utilisation du store
//                 />
//                 <div className="booking_option">
//                   <OptionManager
//                     bookingId={booking.id}
//                     serviceAmount={
//                       totalAmounts[booking.id] ?? booking.totalAmount
//                     } // Utilisation du store
//                     onTotalUpdate={(total, updatedOptions) =>
//                       handleTotalUpdate(booking.id, total, updatedOptions)
//                     }
//                   />
//                   <span className="booking_option__btn">
//                     {/* ✅ Ajout du bouton pour supprimer la réservation */}
//                     <button
//                       onClick={() => handleDeleteBooking(booking.id)}
//                       disabled={deleting === booking.id}
//                     >
//                       {deleting === booking.id ? "Annulation..." : "Annuler"}
//                     </button>
//                     <button
//                       onClick={() =>
//                         router.push(`/manage-booking/${booking.id}`)
//                       }
//                     >
//                       Voir la réservation
//                     </button>
//                   </span>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </Wrapper>
//   );
// };

// export default MyBookings;
// MyBookings.jsx
// MyBookings.tsx
// MyBookings.tsx
// "use client";
// import React, { useEffect, useState, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import { getUserBookings } from "@/actions/bookings";
// import BookingItemCompt from "../components/ BookingItemCompt /BookingItemCompt";
// import Wrapper from "../components/Wrapper/Wrapper";
// import { Booking } from "@/types";

// const MyBookings: React.FC = () => {
//   const { user } = useUser();
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchBookings = useCallback(async () => {
//     if (!user?.id) return;
//     console.log("Fetching bookings for user:", user.id);
//     setLoading(true);
//     try {
//       const data = await getUserBookings(user.id);
//       setBookings(data);
//     } catch (error) {
//       console.error("Erreur lors du chargement des réservations :", error);
//       setError("Impossible de charger les réservations.");
//     } finally {
//       setLoading(false);
//     }
//   }, [user?.id]);

//   useEffect(() => {
//     if (!user?.id || bookings.length > 0) return; // Ne pas appeler la requête si les réservations existent déjà
//     fetchBookings();
//   }, [user?.id, bookings.length, fetchBookings]);

//   // Fonction pour gérer l'annulation d'une réservation
//   const handleCancelBooking = (booking: Booking) => {
//     console.log("Annulation de la réservation :", booking.id);
//     // Implémenter ici la logique pour annuler la réservation
//     // Par exemple, tu pourrais appeler une API pour annuler la réservation
//     // et mettre à jour l'état des réservations après l'annulation.
//     setBookings((prevBookings) =>
//       prevBookings.filter((b) => b.id !== booking.id)
//     );
//   };

//   return (
//     <Wrapper>
//       <div className="booking">
//         <h1>Mes réservations</h1>

//         {loading && <p>Chargement en cours...</p>}
//         {error && <p className="error">{error}</p>}
//         {!loading && bookings.length === 0 && <p>Aucune réservation.</p>}

//         {!loading && bookings.length > 0 && (
//           <ul>
//             {bookings.map((booking) => (
//               <li key={booking.id}>
//                 {/* Passer onCancel à BookingItemCompt */}
//                 <BookingItemCompt
//                   booking={booking}
//                   onCancel={handleCancelBooking}
//                 />
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </Wrapper>
//   );
// };

// export default MyBookings;
// "use client";
// import { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { getUserBookings, deleteUserBooking } from "@/actions/bookings";
// import { Booking, Option } from "@/types";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import Wrapper from "../components/Wrapper/Wrapper";
// import OptionManager from "../components/OptionManager/OptionManager";
// import ServiceCompt from "../components/ServicesCompt/ServiceCompt";
// import { useBookingStore } from "@/store/store";

// const MyBookings = () => {
//   const { user } = useUser();
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState<string | null>(null);
//   const router = useRouter();

//   const { totalAmounts, setTotalAmount, setOptions, resetStore } =
//     useBookingStore();

//   useEffect(() => {
//     if (!user?.id) return;

//     // ✅ Réinitialiser Zustand avant de charger les nouvelles réservations
//     resetStore();

//     const fetchBookings = async () => {
//       setLoading(true);
//       try {
//         const data = await getUserBookings(user.id);
//         setBookings(data);

//         // ✅ Vérifier que les options ne sont pas dupliquées
//         data.forEach((booking) => {
//           setTotalAmount(booking.id, booking.totalAmount);
//           setOptions(booking.id, booking.options || []);
//         });
//       } catch (error) {
//         console.error("Erreur lors du chargement des réservations :", error);
//         setError("Impossible de charger les réservations.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, [user?.id, setTotalAmount, setOptions, resetStore]);

//   const handleTotalUpdate = (
//     bookingId: string,
//     total: number,
//     updatedOptions: Option[]
//   ) => {
//     setTotalAmount(bookingId, total);
//     setOptions(bookingId, updatedOptions);
//     setBookings((prevBookings) =>
//       prevBookings.map((booking) =>
//         booking.id === bookingId
//           ? { ...booking, totalAmount: total, options: updatedOptions }
//           : booking
//       )
//     );
//   };

//   // ✅ Ajout de la suppression de réservation avec toast et router
//   const handleDeleteBooking = async (bookingId: string) => {
//     if (!user?.id) {
//       toast.error("Utilisateur non authentifié.");
//       return;
//     }

//     if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

//     setDeleting(bookingId);
//     const toastId = toast.loading("Annulation en cours...");

//     try {
//       await deleteUserBooking(bookingId, user.id);
//       setBookings((prev) => prev.filter((booking) => booking.id !== bookingId)); // ✅ Suppression après succès
//       toast.success("Réservation annulée avec succès !", { id: toastId });

//       // ✅ Rediriger l'utilisateur vers une autre page après la suppression
//       router.push("/my-bookings");
//     } catch (error) {
//       console.error("Erreur lors de l'annulation :", error);
//       toast.error("Impossible d'annuler la réservation.", { id: toastId });
//     } finally {
//       setDeleting(null);
//     }
//   };

//   return (
//     <Wrapper>
//       <div className="booking">
//         <h1>Mes réservations</h1>

//         {loading && <p>Chargement en cours...</p>}
//         {error && <p className="error">{error}</p>}
//         {!loading && bookings.length === 0 && <p>Aucune réservation</p>}

//         {!loading && bookings.length > 0 && (
//           <ul className="booking_item">
//             {bookings.map((booking) => (
//               <li key={booking.id} className="booking_item__content">
//                 <ServiceCompt
//                   name={booking.service.name}
//                   description={
//                     booking.service.description ||
//                     "Aucune description disponible"
//                   }
//                   imageUrl={booking.service.imageUrl || "/assets/default.jpg"}
//                   categories={booking.service.categories}
//                   startTime={booking.startTime}
//                   endTime={booking.endTime}
//                   options={booking.options || []}
//                   totalAmount={totalAmounts[booking.id] ?? booking.totalAmount}
//                 />
//                 <div className="booking_option">
//                   <OptionManager
//                     bookingId={booking.id}
//                     serviceAmount={
//                       totalAmounts[booking.id] ?? booking.totalAmount
//                     }
//                     onTotalUpdate={(total, updatedOptions) =>
//                       handleTotalUpdate(booking.id, total, updatedOptions)
//                     }
//                   />
//                   <span className="booking_option__btn">
//                     {/* ✅ Ajout du bouton pour supprimer la réservation */}
//                     <button
//                       onClick={() => handleDeleteBooking(booking.id)}
//                       disabled={deleting === booking.id}
//                     >
//                       {deleting === booking.id ? "Annulation..." : "Annuler"}
//                     </button>
//                     <button
//                       onClick={() =>
//                         router.push(`/manage-booking/${booking.id}`)
//                       }
//                     >
//                       Voir la réservation
//                     </button>
//                   </span>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </Wrapper>
//   );
// };

// export default MyBookings;
// "use client";

//  import { useEffect, useState } from "react";
//  import { useUser } from "@clerk/nextjs";
//  import { getUserBookings, deleteUserBooking } from "@/actions/bookings";
//  import { Booking } from "@/types";
//  import toast from "react-hot-toast";
//  import { useRouter } from "next/navigation";
//  import Wrapper from "../components/Wrapper/Wrapper";
//  import OptionManager from "../components/OptionManager/OptionManager";
//  import ServiceCompt from "../components/ServicesCompt/ServiceCompt";
//  //import DashboardUser from "../components/DashboardUser/DashboardUser";
//  //import DashboardUser from "../components/DashboardUser/DashboardUser";

//  // Liste des réservations utilisateur
//  const MyBookings = () => {
//    const { user } = useUser();
//    const [bookings, setBookings] = useState<Booking[]>([]);
//    const [loading, setLoading] = useState(true);
//    const [error, setError] = useState<string | null>(null);
//    const [deleting, setDeleting] = useState<string | null>(null);
//    const [totalAmounts, setTotalAmounts] = useState<{ [key: string]: number }>(
//      {}
//    );

//    const router = useRouter();

//    useEffect(() => {
//      if (!user) return;

//      const fetchBookings = async () => {
//        setLoading(true);
//        try {
//          const data = await getUserBookings(user.id);
//          console.log("Réservations récupérées :", data);
//          setBookings(data);
//        } catch (error) {
//          console.error("Erreur lors du chargement des réservations :", error);
//          setError("Impossible de charger les réservations.");
//        } finally {
//          setLoading(false);
//        }
//      };

//      fetchBookings();
//    }, [user]);

//    const handleTotalUpdate = (bookingId: string, total: number) => {
//      setTotalAmounts((prev) => ({ ...prev, [bookingId]: total }));
//    };

//    const handleDeleteBooking = async (bookingId: string) => {
//      if (!user) {
//        toast.error("Utilisateur non authentifié.");
//        return;
//      }

//      const confirmation = confirm(
//        "Voulez-vous vraiment annuler cette réservation ?"
//      );
//      if (!confirmation) return;

//      setDeleting(bookingId);
//      const toastId = toast.loading("Annulation en cours...");

//      try {
//        await deleteUserBooking(bookingId, user.id);
//        setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
//        toast.success("Réservation annulée avec succès !", { id: toastId });
//      } catch (error) {
//        console.error("Erreur lors de l'annulation :", error);
//        toast.error("Impossible d'annuler la réservation.", { id: toastId });
//      } finally {
//        setDeleting(null);
//      }
//    };

//    return (
//      <Wrapper>
//        <div className="booking">
//          <h1>Mes réservations</h1>

//          {loading && <p>Chargement en cours...</p>}
//          {error && <p className="error">{error}</p>}
//          {!loading && bookings.length === 0 && <p>Aucune réservation</p>}

//          {!loading && bookings.length > 0 && (
//            <ul>
//            <ul className="booking_item">
//              {bookings.map((booking) => (
//                <li key={booking.id} className="booking_item">
//                <li key={booking.id} className="booking_item__content">
//                  <ServiceCompt
//                    name={booking.service.name}
//                    description={
//                    endTime={booking.endTime}
//                  />

//                  <div className="booking_transaction">
//                  <div className="booking_option">
//                    <OptionManager
//                      bookingId={booking.id}
//                      serviceAmount={booking.service.amount}
//                      onTotalUpdate={(total) =>
//                        handleTotalUpdate(booking.id, total)
//                      }
//                    />

//                    <button
//                      onClick={() => handleDeleteBooking(booking.id)}
//                      disabled={deleting === booking.id}
//                    >
//                      {deleting === booking.id ? "Annulation..." : "Annuler"}
//                    </button>
//                    <button
//                      onClick={() => router.push(`/manage-booking/${booking.id}`)}
//                    >
//                      Voir la réservation
//                    </button>
//                    <span className="booking_option__btn">
//                      <button
//                        onClick={() => handleDeleteBooking(booking.id)}
//                        disabled={deleting === booking.id}
//                      >
//                        {deleting === booking.id ? "Annulation..." : "Annuler"}
//                      </button>
//                      <button
//                        onClick={() =>
//                          router.push(`/manage-booking/${booking.id}`)
//                        }
//                      >
//                        Voir la réservation
//                      </button>
//                    </span>
//                  </div>
//                </li>
//              ))}
//            </ul>
//          )}
//        </div>
//      </Wrapper>
//    );
//  };

//  export default MyBookings;
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  getUserBookings,
  generateBookingToken,
  updateBookingTotal,
} from "@/actions/bookings";
import Link from "next/link";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import styles from "./styles.module.scss"; // Ajoute un fichier SCSS pour styliser
import { Booking } from "@/types";

const MyBookingPage = () => {
  const { user, isSignedIn } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchBookings = async () => {
  //     if (!user || !isSignedIn) return;

  //     try {
  //       const userBookings = await getUserBookings(user.id);
  //       const bookingsWithTokens = await Promise.all(
  //         userBookings.map(async (booking) => ({
  //           ...booking,
  //           token: await generateBookingToken(booking.id, user.id),
  //         }))
  //       );

  //       setBookings(bookingsWithTokens);
  //     } catch (err) {
  //       console.error("Erreur lors de la récupération des réservations :", err);
  //       setError("Impossible de récupérer vos réservations.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchBookings();
  // }, [user, isSignedIn]);
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || !isSignedIn) return;

      try {
        const userBookings = await getUserBookings(user.id);

        // 🔥 Met à jour le total de chaque réservation
        const bookingsWithTokens = await Promise.all(
          userBookings.map(async (booking) => {
            const updatedTotal = await updateBookingTotal(booking.id); // ✅ Recalcule le total
            return {
              ...booking,
              totalAmount: updatedTotal, // ✅ Met à jour le montant correct
              token: await generateBookingToken(booking.id, user.id),
            };
          })
        );

        setBookings(bookingsWithTokens);
      } catch (err) {
        console.error("Erreur lors de la récupération des réservations :", err);
        setError("Impossible de récupérer vos réservations.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, isSignedIn]);

  if (loading) {
    return (
      <Wrapper>
        <p>Chargement des réservations...</p>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper>
        <p className="error">{error}</p>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <h1>Mes Réservations</h1>

      {bookings.length === 0 ? (
        <p>Vous n&apos;avez aucune réservation.</p>
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
                <strong>Statut :</strong> {booking.status}
              </p>
              <p>
                <strong>Montant :</strong>{" "}
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }).format(booking.totalAmount)}
              </p>
              <Link
                href={`/manage-booking?token=${booking.token}`}
                className={styles.manageButton}
              >
                Gérer
              </Link>
            </div>
          ))}
        </div>
      )}
    </Wrapper>
  );
};

export default MyBookingPage;
