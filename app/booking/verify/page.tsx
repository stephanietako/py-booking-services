// // // // app/booking/verify/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { Booking, Service, BookingOption, Client } from "@/types"; // Importez vos types

// export interface BookingWithDetails extends Booking {
//   service: Service;
//   bookingOptions: BookingOption[];
//   client: Client | null;
// }

// export default function VerifyBooking() {
//   const [bookingDetails, setBookingDetails] =
//     useState<BookingWithDetails | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const searchParams = new URLSearchParams(window.location.search);
//     const token = searchParams.get("token");

//     if (token) {
//       fetch("/api/bookings/verify-token", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ token }),
//       })
//         .then(async (response) => {
//           if (!response.ok) {
//             const err = await response.json();
//             console.error("Erreur lors de la vérification du token :", err);
//             throw new Error(
//               err.error || "Erreur lors de la vérification du token."
//             );
//           }
//           return response.json() as Promise<{ data: BookingWithDetails }>; // Modifie le type ici
//         })
//         .then((data) => {
//           console.log("Données de la réservation reçues :", data);
//           setBookingDetails(data.data); // Accède à la propriété 'data'
//           setLoading(false);
//         })
//         .catch((err) => {
//           console.error("Erreur lors du traitement de la réponse :", err);
//           setError(err.message);
//           setLoading(false);
//         });
//     } else {
//       setError("Token de vérification manquant dans l'URL.");
//       setLoading(false);
//     }
//   }, []);

//   if (loading) {
//     return <p>Vérification en cours...</p>;
//   }

//   if (error) {
//     return <p className="error">{error}</p>;
//   }

//   if (bookingDetails) {
//     console.log(
//       "Type de bookingDetails.startTime :",
//       typeof bookingDetails.startTime
//     );
//     console.log(
//       "Valeur de bookingDetails.startTime :",
//       bookingDetails.startTime
//     );
//     console.log(
//       "Type de bookingDetails.endTime :",
//       typeof bookingDetails.endTime
//     );
//     console.log("Valeur de bookingDetails.endTime :", bookingDetails.endTime);
//     console.log(
//       "Type de bookingDetails.boatAmount :",
//       typeof bookingDetails.boatAmount
//     );
//     console.log(
//       "Valeur de bookingDetails.boatAmount :",
//       bookingDetails.boatAmount
//     );
//     console.log("Structure complète de bookingDetails :", bookingDetails);

//     return (
//       <div
//         className="booking-details"
//         style={{ padding: "20px", background: "#f9f9f9" }}
//       >
//         <h1>Réservation Vérifiée !</h1>
//         <p>ID de la réservation : {bookingDetails.id}</p>
//         {bookingDetails.service && (
//           <p>Service : {bookingDetails.service.name}</p>
//         )}
//         <p>
//           Début :{" "}
//           {bookingDetails.startTime
//             ? new Date(bookingDetails.startTime).toLocaleString("fr-FR", {
//                 dateStyle: "full",
//                 timeStyle: "short",
//               })
//             : "Date de début invalide"}
//         </p>
//         <p>
//           Fin :{" "}
//           {bookingDetails.endTime
//             ? new Date(bookingDetails.endTime).toLocaleString("fr-FR", {
//                 timeStyle: "short",
//               })
//             : "Date de fin invalide"}
//         </p>
//         <p>
//           Prix de la location du bateau :{" "}
//           {typeof bookingDetails.boatAmount === "number"
//             ? new Intl.NumberFormat("fr-FR", {
//                 style: "currency",
//                 currency: bookingDetails.service?.currency || "EUR",
//               }).format(bookingDetails.boatAmount)
//             : "Prix de location invalide"}
//         </p>
//         {bookingDetails.client && (
//           <div>
//             <h3>Informations Client</h3>
//             <p>Nom : {bookingDetails.client.fullName}</p>
//             <p>Email : {bookingDetails.client.email}</p>
//             <p>Téléphone : {bookingDetails.client.phoneNumber}</p>
//           </div>
//         )}
//         {bookingDetails.userId && ( // Vérifiez si c'est un utilisateur connecté
//           <div>
//             <h3>Informations Utilisateur (si connecté)</h3>
//             <p>ID Utilisateur : {bookingDetails.userId}</p>
//           </div>
//         )}
//         {bookingDetails.bookingOptions &&
//           bookingDetails.bookingOptions.length > 0 && (
//             <div>
//               <h3>Options Sélectionnées (paiement à bord)</h3>
//               <ul>
//                 {bookingDetails.bookingOptions.map((option) => (
//                   <li key={option.id}>
//                     {option.label} x {option.quantity} ({" "}
//                     {new Intl.NumberFormat("fr-FR", {
//                       style: "currency",
//                       currency: bookingDetails.service?.currency || "EUR",
//                     }).format(option.unitPrice)}
//                     /unité )
//                   </li>
//                 ))}
//               </ul>
//               <p>
//                 Montant total des options à payer à bord :{" "}
//                 {new Intl.NumberFormat("fr-FR", {
//                   style: "currency",
//                   currency: bookingDetails.service?.currency || "EUR",
//                 }).format(bookingDetails.payableOnBoard)}
//               </p>
//             </div>
//           )}
//         {/* Vous pouvez afficher d'autres détails de la réservation ici */}

//         {!bookingDetails.stripePaymentLink && (
//           <p>
//             Le lien de paiement en ligne vous sera envoyé prochainement par
//             l&apos;administrateur.
//           </p>
//         )}
//       </div>
//     );
//   }

//   return null;
// }
/////////////////
///fonctionne pas
// "use client";

// import { useEffect, useState } from "react";
// import { Booking, Service, BookingOption, Client } from "@/types"; // Importez vos types

// export interface BookingWithDetails extends Booking {
//   service: Service;
//   bookingOptions: (BookingOption & {
//     option: { unitPrice: number; label: string; payableAtBoard: boolean };
//   })[];
//   client: Client | null;
// }

// export default function VerifyBooking() {
//   const [bookingDetails, setBookingDetails] =
//     useState<BookingWithDetails | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const searchParams = new URLSearchParams(window.location.search);
//     const token = searchParams.get("token");

//     if (token) {
//       fetch("/api/bookings/verify-token", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ token }),
//       })
//         .then(async (response) => {
//           if (!response.ok) {
//             const err = await response.json();
//             console.error("Erreur lors de la vérification du token :", err);
//             throw new Error(
//               err.error || "Erreur lors de la vérification du token."
//             );
//           }
//           return response.json() as Promise<{ booking: BookingWithDetails }>; // Accès direct à booking
//         })
//         .then((data) => {
//           console.log("Données de la réservation reçues :", data);
//           setBookingDetails(data.booking); // Utilise data.booking
//           setLoading(false);
//         })
//         .catch((err) => {
//           console.error("Erreur lors du traitement de la réponse :", err);
//           setError(err.message);
//           setLoading(false);
//         });
//     } else {
//       setError("Token de vérification manquant dans l'URL.");
//       setLoading(false);
//     }
//   }, []);

//   if (loading) {
//     return <p>Vérification en cours...</p>;
//   }

//   if (error) {
//     return <p className="error">{error}</p>;
//   }

//   if (bookingDetails) {
//     console.log("Structure complète de bookingDetails :", bookingDetails);

//     const totalPayableOnBoard = bookingDetails.bookingOptions.reduce(
//       (sum, bookingOption) =>
//         bookingOption.option.payableAtBoard
//           ? sum + bookingOption.quantity * bookingOption.option.unitPrice
//           : sum,
//       0
//     );

//     const totalAmount = bookingDetails.boatAmount + totalPayableOnBoard;

//     return (
//       <div
//         className="booking-details"
//         style={{ padding: "20px", background: "#f9f9f9" }}
//       >
//         <h1>Réservation Vérifiée !</h1>
//         <p>ID de la réservation : {bookingDetails.id}</p>
//         {bookingDetails.service && (
//           <p>Service : {bookingDetails.service.name}</p>
//         )}
//         <p>
//           Début :{" "}
//           {bookingDetails.startTime
//             ? new Date(bookingDetails.startTime).toLocaleString("fr-FR", {
//                 dateStyle: "full",
//                 timeStyle: "short",
//               })
//             : "Date de début invalide"}
//         </p>
//         <p>
//           Fin :{" "}
//           {bookingDetails.endTime
//             ? new Date(bookingDetails.endTime).toLocaleString("fr-FR", {
//                 timeStyle: "short",
//               })
//             : "Date de fin invalide"}
//         </p>
//         <p>
//           Prix de la location du bateau :{" "}
//           {typeof bookingDetails.boatAmount === "number"
//             ? new Intl.NumberFormat("fr-FR", {
//                 style: "currency",
//                 currency: bookingDetails.service?.currency || "EUR",
//               }).format(bookingDetails.boatAmount)
//             : "Prix de location invalide"}
//         </p>
//         {bookingDetails.client && (
//           <div>
//             <h3>Informations Client</h3>
//             <p>Nom : {bookingDetails.client.fullName}</p>
//             <p>Email : {bookingDetails.client.email}</p>
//             <p>Téléphone : {bookingDetails.client.phoneNumber}</p>
//           </div>
//         )}
//         {bookingDetails.userId && ( // Vérifiez si c'est un utilisateur connecté
//           <div>
//             <h3>Informations Utilisateur (si connecté)</h3>
//             <p>ID Utilisateur : {bookingDetails.userId}</p>
//           </div>
//         )}
//         {bookingDetails.bookingOptions &&
//           bookingDetails.bookingOptions.length > 0 && (
//             <div>
//               <h3>Options Sélectionnées (paiement à bord)</h3>
//               <ul>
//                 {bookingDetails.bookingOptions.map((bookingOption) => (
//                   <li key={bookingOption.id}>
//                     {bookingOption.option.label} x {bookingOption.quantity} ({" "}
//                     {new Intl.NumberFormat("fr-FR", {
//                       style: "currency",
//                       currency: bookingDetails.service?.currency || "EUR",
//                     }).format(bookingOption.option.unitPrice)}
//                     /unité )
//                   </li>
//                 ))}
//               </ul>
//               <p>
//                 Montant total des options à payer à bord :{" "}
//                 {new Intl.NumberFormat("fr-FR", {
//                   style: "currency",
//                   currency: bookingDetails.service?.currency || "EUR",
//                 }).format(totalPayableOnBoard)}
//               </p>
//             </div>
//           )}
//         <p>
//           Montant total à payer :{" "}
//           {new Intl.NumberFormat("fr-FR", {
//             style: "currency",
//             currency: bookingDetails.service?.currency || "EUR",
//           }).format(totalAmount)}
//         </p>

//         {!bookingDetails.stripePaymentLink && (
//           <p>
//             Le lien de paiement en ligne vous sera envoyé prochainement par
//             l&apos;administrateur.
//           </p>
//         )}
//       </div>
//     );
//   }

//   return null;
// }
"use client";

import { useEffect, useState } from "react";
import { Booking, Service, BookingOption, Client } from "@/types"; // Importez vos types

export interface BookingWithDetails extends Booking {
  service: Service;
  bookingOptions: (BookingOption & {
    option: { unitPrice: number; label: string; payableAtBoard: boolean };
  })[];
  client: Client | null;
}

export default function VerifyBooking() {
  const [bookingDetails, setBookingDetails] =
    useState<BookingWithDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  console.log("Rendu de VerifyBooking avec bookingDetails :", bookingDetails); // Log au début

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");

    if (token) {
      fetch("/api/bookings/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const err = await response.json();
            console.error("Erreur lors de la vérification du token :", err);
            throw new Error(
              err.error || "Erreur lors de la vérification du token."
            );
          }
          return response.json() as Promise<{ data: BookingWithDetails }>; // Modifie le type ici
        })
        .then((data) => {
          console.log("Données de la réservation reçues :", data);
          setBookingDetails(data.data); // Accède à la propriété 'data'
          setLoading(false);
        })
        .catch((err) => {
          console.error("Erreur lors du traitement de la réponse :", err);
          setError(err.message);
          setLoading(false);
        });
    } else {
      setError("Token de vérification manquant dans l'URL.");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <p>Vérification en cours...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (bookingDetails) {
    console.log(
      "Structure complète de bookingDetails dans le rendu :",
      bookingDetails
    ); // Log dans le rendu conditionnel

    const totalPayableOnBoard = bookingDetails.bookingOptions.reduce(
      (sum, bookingOption) =>
        bookingOption.option.payableAtBoard
          ? sum + bookingOption.quantity * bookingOption.option.unitPrice
          : sum,
      0
    );

    const totalAmount = bookingDetails.boatAmount + totalPayableOnBoard;

    return (
      <div
        className="booking-details"
        style={{ padding: "20px", background: "#f9f9f9" }}
      >
        <h1>Réservation Vérifiée !</h1>
        <p>ID de la réservation : {bookingDetails.id}</p>
        {bookingDetails.service && (
          <p>Service : {bookingDetails.service.name}</p>
        )}
        <p>
          Début :{" "}
          {bookingDetails.startTime
            ? new Date(bookingDetails.startTime).toLocaleString("fr-FR", {
                dateStyle: "full",
                timeStyle: "short",
              })
            : "Date de début invalide"}
        </p>
        <p>
          Fin :{" "}
          {bookingDetails.endTime
            ? new Date(bookingDetails.endTime).toLocaleString("fr-FR", {
                timeStyle: "short",
              })
            : "Date de fin invalide"}
        </p>
        <p>
          Prix de la location du bateau :{" "}
          {typeof bookingDetails.boatAmount === "number"
            ? new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: bookingDetails.service?.currency || "EUR",
              }).format(bookingDetails.boatAmount)
            : "Prix de location invalide"}
        </p>
        {bookingDetails.client && (
          <div>
            <h3>Informations Client</h3>
            <p>Nom : {bookingDetails.client.fullName}</p>
            <p>Email : {bookingDetails.client.email}</p>
            <p>Téléphone : {bookingDetails.client.phoneNumber}</p>
          </div>
        )}
        {bookingDetails.userId && ( // Vérifiez si c'est un utilisateur connecté
          <div>
            <h3>Informations Utilisateur (si connecté)</h3>
            <p>ID Utilisateur : {bookingDetails.userId}</p>
          </div>
        )}
        {bookingDetails.bookingOptions &&
          bookingDetails.bookingOptions.length > 0 && (
            <div>
              <h3>Options Sélectionnées (paiement à bord)</h3>
              <ul>
                {bookingDetails.bookingOptions.map((bookingOption) => (
                  <li key={bookingOption.id}>
                    {bookingOption.option.label} x {bookingOption.quantity} ({" "}
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: bookingDetails.service?.currency || "EUR",
                    }).format(bookingOption.option.unitPrice)}
                    /unité )
                  </li>
                ))}
              </ul>
              <p>
                Montant total des options à payer à bord :{" "}
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: bookingDetails.service?.currency || "EUR",
                }).format(totalPayableOnBoard)}
              </p>
            </div>
          )}
        <p>
          Montant total à payer :{" "}
          {new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: bookingDetails.service?.currency || "EUR",
          }).format(totalAmount)}
        </p>

        {!bookingDetails.stripePaymentLink && (
          <p>
            Le lien de paiement en ligne vous sera envoyé prochainement par
            l&apos;administrateur.
          </p>
        )}
      </div>
    );
  }

  return null;
}
