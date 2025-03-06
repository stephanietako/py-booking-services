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
// import { createStripePortalSession } from "@/actions/actionsStripe";

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
//   const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
//     null
//   );

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
//       setConfirmationMessage(
//         "Votre réservation est en attente de confirmation."
//       );
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
//   const handlePayNow = async () => {
//     if (!booking || !booking.stripeCustomerId) {
//       toast.error("Aucun client Stripe associé à cette réservation.");
//       return;
//     }

//     try {
//       toast.success("Création de la session du portail Stripe...");

//       // Appel à la server action
//       const domainUrl = window.location.origin; // L'URL du domaine (côté client)
//       const sessionUrl = await createStripePortalSession(
//         booking.stripeCustomerId,
//         domainUrl
//       ); // Appel à l'action du serveur

//       // Rediriger l'utilisateur vers le portail Stripe
//       window.location.href = sessionUrl;
//     } catch (error) {
//       console.error(
//         "❌ Erreur lors de la redirection vers le portail Stripe :",
//         error
//       );
//       toast.error("Erreur inconnue");
//     }
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

//           {/* Afficher la notification si la réservation est en attente */}
//           {confirmationMessage && (
//             <div className="confirmation_message">{confirmationMessage}</div>
//           )}

//           {/* Afficher le bouton de demande de confirmation seulement si la réservation est en attente */}
//           {booking.status === "PENDING" &&
//             !booking.approvedByAdmin &&
//             !confirmationMessage && (
//               <button
//                 onClick={handleRequestConfirmation}
//                 disabled={isRequestingConfirmation}
//               >
//                 {isRequestingConfirmation
//                   ? "Demande en cours..."
//                   : "Demander confirmation"}
//               </button>
//             )}

//           {/*  Bouton Payer maintenant */}
//           {booking.approvedByAdmin && (
//             <>
//               ²<p>✅ Réservation approuvée</p>
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

/////////////////

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
// import {
//   createCustomerPortal,
//   getStripeSession,
// } from "@/actions/actionsStripe";

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
//   const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
//     null
//   );

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
//       setConfirmationMessage(
//         "Votre réservation est en attente de confirmation."
//       );
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
//   /// Fonction pour payer la réservation (si approuvée)
//   const handlePayNow = async () => {
//     if (!user) {
//       toast.error("Vous devez être connecté pour effectuer un paiement.");
//       return;
//     }

//     const stripeCustomerId = booking.stripeCustomerId;
//     if (!stripeCustomerId) {
//       toast.error("L'utilisateur n'a pas de client Stripe associé.");
//       return;
//     }

//     const priceId = booking.service.priceId;
//     if (!priceId) {
//       toast.error("Aucun priceId disponible pour ce service.");
//       return;
//     }

//     try {
//       const sessionUrl = await getStripeSession({
//         priceId, // ✅ Maintenant TypeScript est sûr que c'est un string
//         domainUrl: window.location.origin,
//         customerId: stripeCustomerId,
//       });

//       if (sessionUrl) {
//         window.location.href = sessionUrl;
//       } else {
//         toast.error("Impossible de créer la session de paiement.");
//       }
//     } catch (error) {
//       toast.error("Erreur lors de la création de la session de paiement.");
//       console.error("Erreur Stripe session : ", error);
//     }
//   };

//   // Fonction pour accéder au portail Stripe
//   const handleOpenStripePortal = async () => {
//     if (!user) {
//       toast.error("Vous devez être connecté pour accéder au portail.");
//       return;
//     }

//     try {
//       // ✅ Récupérer l'URL du portail
//       const portalUrl = await createCustomerPortal(user.id);

//       if (portalUrl) {
//         window.location.href = portalUrl; // ✅ Redirige vers Stripe
//       } else {
//         toast.error("Impossible d'accéder au portail Stripe.");
//       }
//     } catch (error) {
//       toast.error("Impossible d'accéder au portail Stripe.");
//       console.error("Erreur lors de l'ouverture du portail Stripe :", error);
//     }
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

//           {/* Afficher la notification si la réservation est en attente */}
//           {confirmationMessage && (
//             <div className="confirmation_message">{confirmationMessage}</div>
//           )}

//           {/* Afficher le bouton de demande de confirmation seulement si la réservation est en attente */}
//           {booking.status === "PENDING" &&
//             !booking.approvedByAdmin &&
//             !confirmationMessage && (
//               <button
//                 onClick={handleRequestConfirmation}
//                 disabled={isRequestingConfirmation}
//               >
//                 {isRequestingConfirmation
//                   ? "Demande en cours..."
//                   : "Demander confirmation"}
//               </button>
//             )}
//           {/* Bouton pour accéder au portail Stripe */}
//           <button onClick={handleOpenStripePortal} className="btn_form">
//             Accéder à mon portail Stripe
//           </button>
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
//////////////////////
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
import { createStripeCheckoutSession } from "@/actions/actionsStripe";

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

  const handlePayNow = async () => {
    if (!booking || !booking.stripeCustomerId) {
      toast.error("Aucun client Stripe associé à cette réservation.");
      return;
    }

    try {
      toast.success("Création de la session de paiement Stripe...");

      // Appel à l'action du serveur pour créer une session de paiement
      const domainUrl = "http://localhost:3000"; // L'URL du domaine
      const sessionUrl = await createStripeCheckoutSession(
        booking.stripeCustomerId,
        totalAmount, // Montant total de la réservation
        "usd", // Devise (change si nécessaire)
        booking.service.name, // Nom du service
        domainUrl,
        booking.id // Ajout de l'ID de la réservation comme sixième argument
      );

      // Rediriger vers la session de paiement Stripe
      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        toast.error("Erreur inconnue : URL de session non valide.");
      }
    } catch (error) {
      console.error(
        "❌ Erreur lors de la redirection vers Stripe Checkout :",
        error
      );
      toast.error("Erreur inconnue");
    }
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
              <p>Vous pouvez maintenant accéder à votre portail de paiement.</p>
              <p>
                Si vous avez des questions, n&apos;hésitez pas à nous contacter.
              </p>
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
