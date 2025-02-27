//app/manage-booking/[id]/page.tsx

// "use client";

// import React, { FC, useEffect, useState } from "react";
// import {
//   deleteUserBooking,
//   getBookingById,
//   updateBookingTotal,
// } from "@/actions/bookings";
// import Wrapper from "@/app/components/Wrapper/Wrapper";
// import { Booking } from "@/types";
// import { useRouter, useParams } from "next/navigation";
// import { useUser } from "@clerk/nextjs";
// import toast from "react-hot-toast";
// import ServiceCompt from "@/app/components/ServicesCompt/ServiceCompt";

// export const dynamic = "force-dynamic";

// const ManageBookingPage: FC = () => {
//   // Récupérer les informations de l'utilisateur et l'état de chargement de Clerk
//   const { user, isSignedIn, isLoaded } = useUser();

//   // Récupérer l'ID de la réservation depuis l'URL
//   const { id } = useParams<{ id: string }>();

//   // États locaux pour gérer les données de la réservation, les erreurs, et les états de chargement
//   const [booking, setBooking] = useState<Booking | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [totalAmount, setTotalAmount] = useState<number>(0);

//   // Utilisé pour la navigation
//   const router = useRouter();

//   // Effet pour récupérer les données de la réservation lorsque le composant est monté ou que l'ID change
//   useEffect(() => {
//     // Si Clerk n'a pas fini de charger, ne rien faire
//     if (!isLoaded) {
//       return;
//     }

//     // Si l'utilisateur n'est pas connecté, afficher une erreur
//     if (!isSignedIn) {
//       setError("Vous devez être connecté pour voir cette réservation.");
//       setLoading(false);
//       return;
//     }

//     // Fonction pour récupérer les données de la réservation
//     const fetchBooking = async () => {
//       try {
//         // Récupérer les données de la réservation
//         const bookingData = await getBookingById(id, user.id);
//         setBooking(bookingData);

//         // Calculer le montant total de la réservation
//         const newTotal = await updateBookingTotal(id);
//         setTotalAmount(newTotal);
//       } catch (error) {
//         console.error("Erreur lors du chargement de la réservation:", error);
//         setError("Impossible de récupérer la réservation.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBooking();
//   }, [id, user, isSignedIn, isLoaded]);
//   /////////
//   useEffect(() => {
//     const bookingData = localStorage.getItem("bookingData");
//     if (bookingData) {
//       setBooking(JSON.parse(bookingData));
//     }
//   }, []);

//   if (!booking) {
//     return <p>Pas de réservation trouvée</p>;
//   }
//   // Fonction pour gérer la suppression de la réservation
//   const handleDeleteBooking = async () => {
//     if (!user) {
//       setError("Vous devez être connecté pour annuler cette réservation.");
//       return;
//     }

//     // Confirmer la suppression avec l'utilisateur
//     const confirmation = window.confirm(
//       "Voulez-vous vraiment annuler cette réservation ?"
//     );
//     if (!confirmation) return;

//     setDeleting(true);
//     const toastId = toast.loading("Annulation en cours...");

//     try {
//       // Supprimer la réservation
//       await deleteUserBooking(id, user.id);
//       router.push("/my-bookings");
//       toast.success("Réservation annulée avec succès !", { id: toastId });
//     } catch (error) {
//       console.error("Erreur lors de l'annulation :", error);
//       toast.error("Impossible d'annuler la réservation.", { id: toastId });
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // Afficher un message de chargement pendant la récupération des données
//   if (loading) {
//     return (
//       <Wrapper>
//         <p>Chargement...</p>
//       </Wrapper>
//     );
//   }

//   // Afficher un message d'erreur si une erreur s'est produite
//   if (error) {
//     return (
//       <Wrapper>
//         <p className="error">{error}</p>
//       </Wrapper>
//     );
//   }

//   // Afficher un message si la réservation n'est pas trouvée
//   if (!booking) {
//     return (
//       <Wrapper>
//         <p>Réservation introuvable.</p>
//       </Wrapper>
//     );
//   }

//   // Afficher les détails de la réservation
//   return (
//     <Wrapper>
//       <div className="manage_booking">
//         <h1>Ma Reservation</h1>
//         <br />
//         <span className="manage_booking__text">
//           <h2>voici votre reservation, vous avez un imprévu ?</h2>
//           <p>
//             Pas de souci ! Vous pouvez annuler votre réservation ici. Gardez à
//             l’esprit qu’une fois annulée, elle ne pourra pas être rétablie.
//           </p>
//         </span>

//         <div className="manage_booking_container">
//           <ServiceCompt
//             name={booking.service.name}
//             description={
//               booking.service.description || "Aucune description disponible"
//             }
//             amount={totalAmount}
//             imageUrl={booking.service.imageUrl || "/assets/default.jpg"}
//             categories={booking.service.categories}
//             // reservedAt={booking.reservedAt}
//             startTime={booking.startTime}
//             endTime={booking.endTime}
//           />
//           <button
//             onClick={handleDeleteBooking}
//             className="btn_form"
//             disabled={deleting}
//           >
//             {deleting ? "Annulation en cours..." : "Annuler la réservation"}
//           </button>
//           <button>Confirmer la réservation</button>
//         </div>
//       </div>
//     </Wrapper>
//   );
// };

// export default ManageBookingPage;

// // La page ManageBookingPage est complémentaire à MyBookings et permet de gérer une réservation spécifique en montrant les détails du service et en offrant la possibilité d'annuler la réservation. Les deux pages fonctionnent ensemble pour créer une expérience utilisateur complète autour de la gestion des réservations.
// "use client";

// import React, { FC, useEffect, useState } from "react";
// import {
//   deleteUserBooking,
//   getBookingById,
//   updateBookingTotal,
// } from "@/actions/bookings";
// import Wrapper from "@/app/components/Wrapper/Wrapper";
// import { Booking } from "@/types";
// import { useRouter, useParams } from "next/navigation";
// import { useUser } from "@clerk/nextjs";
// import toast from "react-hot-toast";

// import ServiceCompt from "@/app/components/ServicesCompt/ServiceCompt";
// import { updateBooking } from "@/actions/bookings"; // Importer ta fonction updateBooking
// import { sendEmailToAdmin } from "@/actions/email";

// export const dynamic = "force-dynamic";

// const ManageBookingPage: FC = () => {
//   const { user, isSignedIn, isLoaded } = useUser();
//   const { id } = useParams<{ id: string }>();

//   const [booking, setBooking] = useState<Booking | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [totalAmount, setTotalAmount] = useState<number>(0);
//   const [confirming, setConfirming] = useState<boolean>(false); // État de confirmation

//   const router = useRouter();

//   useEffect(() => {
//     if (!isLoaded) return;
//     if (!isSignedIn) {
//       setError("Vous devez être connecté pour voir cette réservation.");
//       setLoading(false);
//       return;
//     }

//     const fetchBooking = async () => {
//       try {
//         const bookingData = await getBookingById(id, user.id);
//         setBooking(bookingData);
//         const newTotal = await updateBookingTotal(id);
//         setTotalAmount(newTotal);
//       } catch {
//         setError("Impossible de récupérer la réservation.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBooking();
//   }, [id, user, isSignedIn, isLoaded]);

//   if (loading)
//     return (
//       <Wrapper>
//         <p>Chargement...</p>
//       </Wrapper>
//     );
//   if (error)
//     return (
//       <Wrapper>
//         <p className="error">{error}</p>
//       </Wrapper>
//     );
//   if (!booking)
//     return (
//       <Wrapper>
//         <p>Réservation introuvable.</p>
//       </Wrapper>
//     );

//   // Fonction pour confirmer la réservation
//   const handleConfirmBooking = async () => {
//     if (!user) {
//       setError("Vous devez être connecté pour confirmer cette réservation.");
//       return;
//     }

//     setConfirming(true);
//     const toastId = toast.loading("Confirmation en cours...");

//     try {
//       // 1️⃣ Met à jour le statut en "PENDING"
//       await updateBooking(id, "PENDING");

//       // 2️⃣ Envoie un mail à l’admin pour l’informer
//       await sendEmailToAdmin({
//         bookingId: id,
//         userEmail: user.emailAddresses[0].emailAddress,
//       });

//       // 3️⃣ Affiche un message de succès
//       toast.success("Réservation envoyée en attente d'approbation !", {
//         id: toastId,
//       });

//       // 4️⃣ Met à jour l'affichage localement
//       setBooking((prevBooking) =>
//         prevBooking ? { ...prevBooking, status: "PENDING" } : prevBooking
//       );
//     } catch {
//       toast.error("Erreur lors de la confirmation de la réservation.", {
//         id: toastId,
//       });
//     } finally {
//       setConfirming(false);
//     }
//   };
//   // Fonction pour gérer la suppression de la réservation
//   const handleDeleteBooking = async () => {
//     if (!user) {
//       setError("Vous devez être connecté pour annuler cette réservation.");
//       return;
//     }

//     const confirmation = window.confirm(
//       "Voulez-vous vraiment annuler cette réservation ?"
//     );
//     if (!confirmation) return;

//     setDeleting(true);
//     const toastId = toast.loading("Annulation en cours...");

//     try {
//       await deleteUserBooking(id, user.id);
//       router.push("/my-bookings");
//       toast.success("Réservation annulée avec succès !", { id: toastId });
//     } catch {
//       toast.error("Impossible d'annuler la réservation.", { id: toastId });
//     } finally {
//       setDeleting(false);
//     }
//   };

//   return (
//     <Wrapper>
//       <div className="manage_booking">
//         <h1>Ma Reservation</h1>
//         <br />
//         <span className="manage_booking__text">
//           <h2>Voici votre réservation, vous avez un imprévu ?</h2>
//           <p>
//             Pas de souci ! Vous pouvez confirmer votre réservation ici. Une fois
//             confirmée, elle sera en attente de confirmation par
//             l&apos;administrateur.
//           </p>
//         </span>

//         <div className="manage_booking_container">
//           <ServiceCompt
//             name={booking.service.name}
//             description={
//               booking.service.description || "Aucune description disponible"
//             }
//             amount={totalAmount}
//             imageUrl={booking.service.imageUrl || "/assets/default.jpg"}
//             categories={booking.service.categories}
//             startTime={booking.startTime}
//             endTime={booking.endTime}
//           />
//           <button
//             onClick={handleDeleteBooking}
//             className="btn_form"
//             disabled={deleting}
//           >
//             {deleting ? "Annulation en cours..." : "Annuler la réservation"}
//           </button>

//           {/* Bouton pour confirmer la réservation */}
//           <div>
//             <button
//               onClick={handleConfirmBooking}
//               disabled={confirming || booking.status === "PENDING"}
//             >
//               {confirming
//                 ? "Confirmation en cours..."
//                 : "Confirmer la réservation"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </Wrapper>
//   );
// };

// export default ManageBookingPage;
///////////test
// "use client";

// import React, { FC, useEffect, useState } from "react";
// import {
//   deleteUserBooking,
//   getBookingById,
//   updateBookingTotal,
// } from "@/actions/bookings";
// import Wrapper from "@/app/components/Wrapper/Wrapper";
// import { Booking } from "@/types";
// import { useRouter, useParams } from "next/navigation";
// import { useUser } from "@clerk/nextjs";
// import toast from "react-hot-toast";
// import ServiceCompt from "@/app/components/ServicesCompt/ServiceCompt";

// export const dynamic = "force-dynamic";

// const ManageBookingPage: FC = () => {
//   const { user, isSignedIn, isLoaded } = useUser();
//   const { id } = useParams<{ id: string }>();

//   const [booking, setBooking] = useState<Booking | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [totalAmount, setTotalAmount] = useState<number>(0);
//   const [isRequestingConfirmation, setIsRequestingConfirmation] =
//     useState(false);

//   const router = useRouter();

//   useEffect(() => {
//     if (!isLoaded) return;
//     if (!isSignedIn) {
//       setError("Vous devez être connecté pour voir cette réservation.");
//       setLoading(false);
//       return;
//     }

//     const fetchBooking = async () => {
//       try {
//         const bookingData = await getBookingById(id, user.id);
//         setBooking(bookingData);
//         const newTotal = await updateBookingTotal(id);
//         setTotalAmount(newTotal);
//       } catch {
//         setError("Impossible de récupérer la réservation.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBooking();
//   }, [id, user, isSignedIn, isLoaded]);

//   if (loading)
//     return (
//       <Wrapper>
//         <p>Chargement...</p>
//       </Wrapper>
//     );
//   if (error)
//     return (
//       <Wrapper>
//         <p className="error">{error}</p>
//       </Wrapper>
//     );
//   if (!booking)
//     return (
//       <Wrapper>
//         <p>Réservation introuvable.</p>
//       </Wrapper>
//     );

//   // ✅ Fonction pour demander la confirmation de la réservation
//   // const handleRequestConfirmation = async () => {
//   //   console.log("📩 Tentative d'envoi d'email...");

//   //   if (!user) {
//   //     console.error("⛔ Utilisateur non connecté !");
//   //     toast.error("Vous devez être connecté.");
//   //     return;
//   //   }

//   //   console.log("📌 Booking ID :", booking.id);
//   //   console.log("📌 Clerk User ID :", user.primaryEmailAddress?.id); // Affichage pour debug

//   //   setIsRequestingConfirmation(true);
//   //   const toastId = toast.loading("Envoi de la demande...");

//   //   try {
//   //     const response = await fetch("/api/bookings/request-confirmation", {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify({
//   //         bookingId: booking.id,
//   //         userId: user.primaryEmailAddress?.id,
//   //       }),
//   //     });

//   //     const result = await response.json();

//   //     console.log("✅ Réponse API :", result);

//   //     if (!response.ok) throw new Error(result.error || "Erreur inconnue");

//   //     toast.success(result.message, { id: toastId });

//   //     // ✅ MAJ du statut en PENDING
//   //     setBooking((prev) => (prev ? { ...prev, status: "PENDING" } : prev));
//   //   } catch (error) {
//   //     console.error("❌ Erreur lors de l'envoi de l'email :", error);
//   //     toast.error(error || "Erreur inconnue", { id: toastId });
//   //   } finally {
//   //     setIsRequestingConfirmation(false);
//   //   }
//   // };
//   const handleRequestConfirmation = async () => {
//     console.log("📩 Tentative d'envoi d'email...");

//     if (!user) {
//       console.error("⛔ Utilisateur non connecté !");
//       toast.error("Vous devez être connecté.");
//       return;
//     }

//     console.log("📌 Booking ID :", booking.id);
//     console.log("📌 Clerk User ID :", user.id); // On vérifie que c'est bien l'ID Clerk

//     setIsRequestingConfirmation(true);
//     const toastId = toast.loading("Envoi de la demande...");

//     try {
//       const response = await fetch("/api/bookings/request-confirmation", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ bookingId: booking.id, userId: user.id }), // <- Envoi de ClerkUserId
//       });

//       const result = await response.json();

//       console.log("✅ Réponse API :", result);

//       if (!response.ok) throw new Error(result.error || "Erreur inconnue");

//       toast.success(result.message, { id: toastId });

//       // ✅ MAJ du statut en PENDING
//       setBooking((prev) => (prev ? { ...prev, status: "PENDING" } : prev));
//     } catch (error) {
//       console.error("❌ Erreur lors de l'envoi de l'email :", error);
//       toast.error(error || "Erreur inconnue", { id: toastId });
//     } finally {
//       setIsRequestingConfirmation(false);
//     }
//   };

//   // ✅ Fonction pour annuler la réservation
//   const handleDeleteBooking = async () => {
//     if (!user) {
//       setError("Vous devez être connecté pour annuler cette réservation.");
//       return;
//     }

//     const confirmation = window.confirm(
//       "Voulez-vous vraiment annuler cette réservation ?"
//     );
//     if (!confirmation) return;

//     setDeleting(true);
//     const toastId = toast.loading("Annulation en cours...");

//     try {
//       await deleteUserBooking(id, user.id);
//       router.push("/my-bookings");
//       toast.success("Réservation annulée avec succès !", { id: toastId });
//     } catch {
//       toast.error("Impossible d'annuler la réservation.", { id: toastId });
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // ✅ Fonction pour payer la réservation (si approuvée)
//   const handlePayNow = () => {
//     toast.success("Redirection vers la page de paiement...");
//     router.push(`/payment/${id}`);
//   };

//   return (
//     <Wrapper>
//       <div className="manage_booking">
//         <h1>Ma Réservation</h1>
//         <br />
//         <span className="manage_booking__text">
//           <h2>Voici votre réservation, vous avez un imprévu ?</h2>
//           <p>
//             Pas de souci ! Vous pouvez demander la confirmation de votre
//             réservation ici. Une fois confirmée, elle sera en attente de
//             validation par l&apos;administrateur.
//           </p>
//         </span>

//         <div className="manage_booking_container">
//           <ServiceCompt
//             name={booking.service.name}
//             description={
//               booking.service.description || "Aucune description disponible"
//             }
//             amount={totalAmount}
//             imageUrl={booking.service.imageUrl || "/assets/default.jpg"}
//             categories={booking.service.categories}
//             startTime={booking.startTime}
//             endTime={booking.endTime}
//           />
//           {/* Bouton Annuler la réservation */}
//           <button
//             onClick={handleDeleteBooking}
//             className="btn_form"
//             disabled={deleting}
//           >
//             {deleting ? "Annulation en cours..." : "Annuler la réservation"}
//           </button>
//           {booking.status === "PENDING" && !booking.approvedByAdmin && (
//             <button
//               onClick={handleRequestConfirmation}
//               disabled={isRequestingConfirmation}
//             >
//               {isRequestingConfirmation
//                 ? "Demande en cours..."
//                 : "Demander confirmation"}
//             </button>
//           )}

//           {/*  Bouton Payer maintenant */}

//           {booking.approvedByAdmin && (
//             <>
//               <p>✅ Réservation approuvée</p>
//               <button onClick={handlePayNow} className="btn_form">
//                 Payer maintenant
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </Wrapper>
//   );
// };

// export default ManageBookingPage;
// "use client";

// import React, { FC, useEffect, useState } from "react";
// import {
//   deleteUserBooking,
//   getBookingById,
//   updateBookingTotal,
// } from "@/actions/bookings";
// import Wrapper from "@/app/components/Wrapper/Wrapper";
// import { Booking } from "@/types";
// import { useRouter, useParams } from "next/navigation";
// import { useUser } from "@clerk/nextjs";
// import toast from "react-hot-toast";
// import ServiceCompt from "@/app/components/ServicesCompt/ServiceCompt";

// export const dynamic = "force-dynamic";

// const ManageBookingPage: FC = () => {
//   const { user, isSignedIn, isLoaded } = useUser();
//   const { id } = useParams<{ id: string }>();

//   const [booking, setBooking] = useState<Booking | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [totalAmount, setTotalAmount] = useState<number>(0);
//   const [isRequestingConfirmation, setIsRequestingConfirmation] =
//     useState(false);

//   const router = useRouter();

//   useEffect(() => {
//     if (!isLoaded) return;
//     if (!isSignedIn) {
//       setError("Vous devez être connecté pour voir cette réservation.");
//       setLoading(false);
//       return;
//     }

//     const fetchBooking = async () => {
//       try {
//         const bookingData = await getBookingById(id, user.id);
//         setBooking(bookingData);
//         const newTotal = await updateBookingTotal(id);
//         setTotalAmount(newTotal);
//       } catch {
//         setError("Impossible de récupérer la réservation.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBooking();
//   }, [id, user, isSignedIn, isLoaded]);

//   if (loading)
//     return (
//       <Wrapper>
//         <p>Chargement...</p>
//       </Wrapper>
//     );
//   if (error)
//     return (
//       <Wrapper>
//         <p className="error">{error}</p>
//       </Wrapper>
//     );
//   if (!booking)
//     return (
//       <Wrapper>
//         <p>Réservation introuvable.</p>
//       </Wrapper>
//     );

//   // Fonction pour demander la confirmation de la réservation
//   const handleRequestConfirmation = async () => {
//     console.log("📩 Tentative d'envoi d'email...");

//     if (!user) {
//       console.error("⛔ Utilisateur non connecté !");
//       toast.error("Vous devez être connecté.");
//       return;
//     }

//     console.log("📌 Booking ID :", booking.id);
//     console.log("📌 Clerk User ID :", user.id); // On vérifie que c'est bien l'ID Clerk

//     setIsRequestingConfirmation(true);
//     const toastId = toast.loading("Envoi de la demande...");

//     try {
//       const response = await fetch("/api/bookings/request-confirmation", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ bookingId: booking.id, userId: user.id }), // <- Envoi de ClerkUserId
//       });

//       const result = await response.json();

//       console.log("✅ Réponse API :", result);

//       if (!response.ok) throw new Error(result.error || "Erreur inconnue");

//       toast.success(result.message, { id: toastId });

//       // ✅ MAJ du statut en PENDING
//       setBooking((prev) => (prev ? { ...prev, status: "PENDING" } : prev));
//     } catch (error) {
//       console.error("❌ Erreur lors de l'envoi de l'email :", error);
//       toast.error(error || "Erreur inconnue", { id: toastId });
//     } finally {
//       setIsRequestingConfirmation(false);
//     }
//   };

//   // Fonction pour annuler la réservation
//   const handleDeleteBooking = async () => {
//     if (!user) {
//       setError("Vous devez être connecté pour annuler cette réservation.");
//       return;
//     }

//     const confirmation = window.confirm(
//       "Voulez-vous vraiment annuler cette réservation ?"
//     );
//     if (!confirmation) return;

//     setDeleting(true);
//     const toastId = toast.loading("Annulation en cours...");

//     try {
//       await deleteUserBooking(id, user.id);
//       router.push("/my-bookings");
//       toast.success("Réservation annulée avec succès !", { id: toastId });
//     } catch {
//       toast.error("Impossible d'annuler la réservation.", { id: toastId });
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // Fonction pour payer la réservation (si approuvée)
//   const handlePayNow = () => {
//     toast.success("Redirection vers la page de paiement...");
//     router.push(`/payment/${id}`);
//   };

//   return (
//     <Wrapper>
//       <div className="manage_booking">
//         <h1>Ma Réservation</h1>
//         <br />
//         <span className="manage_booking__text">
//           <h2>Voici votre réservation, vous avez un imprévu ?</h2>
//           <p>
//             Pas de souci ! Vous pouvez demander la confirmation de votre
//             réservation ici. Une fois confirmée, elle sera en attente de
//             validation par l&apos;administrateur.
//           </p>
//         </span>

//         <div className="manage_booking_container">
//           <ServiceCompt
//             name={booking.service.name}
//             description={
//               booking.service.description || "Aucune description disponible"
//             }
//             amount={totalAmount}
//             imageUrl={booking.service.imageUrl || "/assets/default.jpg"}
//             categories={booking.service.categories}
//             startTime={booking.startTime}
//             endTime={booking.endTime}
//           />
//           {/* Bouton Annuler la réservation */}
//           <button
//             onClick={handleDeleteBooking}
//             className="btn_form"
//             disabled={deleting}
//           >
//             {deleting ? "Annulation en cours..." : "Annuler la réservation"}
//           </button>
//           {booking.status === "PENDING" && !booking.approvedByAdmin && (
//             <button
//               onClick={handleRequestConfirmation}
//               disabled={isRequestingConfirmation}
//             >
//               {isRequestingConfirmation
//                 ? "Demande en cours..."
//                 : "Demander confirmation"}
//             </button>
//           )}

//           {/*  Bouton Payer maintenant */}

//           {booking.approvedByAdmin && (
//             <>
//               <p>✅ Réservation approuvée</p>
//               <button onClick={handlePayNow} className="btn_form">
//                 Payer maintenant
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </Wrapper>
//   );
// };

// export default ManageBookingPage;
"use client";
import React, { FC, useEffect, useState } from "react";
import {
  deleteUserBooking,
  getBookingById,
  updateBookingTotal,
} from "@/actions/bookings";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import { Booking } from "@/types";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import ServiceCompt from "@/app/components/ServicesCompt/ServiceCompt";

export const dynamic = "force-dynamic";

const ManageBookingPage: FC = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { id } = useParams<{ id: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isRequestingConfirmation, setIsRequestingConfirmation] =
    useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null
  );

  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setError("Vous devez être connecté pour voir cette réservation.");
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const bookingData = await getBookingById(id, user.id);
        setBooking(bookingData);
        const newTotal = await updateBookingTotal(id);
        setTotalAmount(newTotal);
      } catch {
        setError("Impossible de récupérer la réservation.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, user, isSignedIn, isLoaded]);

  if (loading)
    return (
      <Wrapper>
        <p>Chargement...</p>
      </Wrapper>
    );
  if (error)
    return (
      <Wrapper>
        <p className="error">{error}</p>
      </Wrapper>
    );
  if (!booking)
    return (
      <Wrapper>
        <p>Réservation introuvable.</p>
      </Wrapper>
    );

  // Fonction pour demander la confirmation de la réservation
  const handleRequestConfirmation = async () => {
    console.log("📩 Tentative d'envoi d'email...");

    if (!user) {
      console.error("⛔ Utilisateur non connecté !");
      toast.error("Vous devez être connecté.");
      return;
    }

    console.log("📌 Booking ID :", booking.id);
    console.log("📌 Clerk User ID :", user.id); // On vérifie que c'est bien l'ID Clerk

    setIsRequestingConfirmation(true);
    const toastId = toast.loading("Envoi de la demande...");

    try {
      const response = await fetch("/api/bookings/request-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, userId: user.id }), // <- Envoi de ClerkUserId
      });

      const result = await response.json();

      console.log("✅ Réponse API :", result);

      if (!response.ok) throw new Error(result.error || "Erreur inconnue");

      toast.success(result.message, { id: toastId });

      // ✅ MAJ du statut en PENDING
      setBooking((prev) => (prev ? { ...prev, status: "PENDING" } : prev));
      setConfirmationMessage(
        "Votre réservation est en attente de confirmation."
      );
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de l'email :", error);
      toast.error(error || "Erreur inconnue", { id: toastId });
    } finally {
      setIsRequestingConfirmation(false);
    }
  };

  // Fonction pour annuler la réservation
  const handleDeleteBooking = async () => {
    if (!user) {
      setError("Vous devez être connecté pour annuler cette réservation.");
      return;
    }

    const confirmation = window.confirm(
      "Voulez-vous vraiment annuler cette réservation ?"
    );
    if (!confirmation) return;

    setDeleting(true);
    const toastId = toast.loading("Annulation en cours...");

    try {
      await deleteUserBooking(id, user.id);
      router.push("/my-bookings");
      toast.success("Réservation annulée avec succès !", { id: toastId });
    } catch {
      toast.error("Impossible d'annuler la réservation.", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  // Fonction pour payer la réservation (si approuvée)
  const handlePayNow = () => {
    toast.success("Redirection vers la page de paiement...");
    router.push(`/payment/${id}`);
  };

  return (
    <Wrapper>
      <div className="manage_booking">
        <h1>Ma Réservation</h1>
        <br />
        <span className="manage_booking__text">
          <h2>Voici votre réservation, vous avez un imprévu ?</h2>
          <p>
            Pas de souci ! Vous pouvez demander la confirmation de votre
            réservation ici. Une fois confirmée, elle sera en attente de
            validation par l&apos;administrateur.
          </p>
        </span>

        <div className="manage_booking_container">
          <ServiceCompt
            name={booking.service.name}
            description={
              booking.service.description || "Aucune description disponible"
            }
            amount={totalAmount}
            imageUrl={booking.service.imageUrl || "/assets/default.jpg"}
            categories={booking.service.categories}
            startTime={booking.startTime}
            endTime={booking.endTime}
          />
          {/* Bouton Annuler la réservation */}
          <button
            onClick={handleDeleteBooking}
            className="btn_form"
            disabled={deleting}
          >
            {deleting ? "Annulation en cours..." : "Annuler la réservation"}
          </button>

          {/* Afficher la notification si la réservation est en attente */}
          {confirmationMessage && (
            <div className="confirmation_message">{confirmationMessage}</div>
          )}

          {/* Afficher le bouton de demande de confirmation seulement si la réservation est en attente */}
          {booking.status === "PENDING" &&
            !booking.approvedByAdmin &&
            !confirmationMessage && (
              <button
                onClick={handleRequestConfirmation}
                disabled={isRequestingConfirmation}
              >
                {isRequestingConfirmation
                  ? "Demande en cours..."
                  : "Demander confirmation"}
              </button>
            )}

          {/*  Bouton Payer maintenant */}
          {booking.approvedByAdmin && (
            <>
              <p>✅ Réservation approuvée</p>
              <button onClick={handlePayNow} className="btn_form">
                Payer maintenant
              </button>
            </>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default ManageBookingPage;
