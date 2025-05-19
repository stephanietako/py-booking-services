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
// app/booking/verify/page.tsx
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

//   console.log("Rendu de VerifyBooking avec bookingDetails :", bookingDetails); // Log au début

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
//       "Structure complète de bookingDetails dans le rendu :",
//       bookingDetails
//     ); // Log dans le rendu conditionnel

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

//   console.log("Rendu de VerifyBooking avec bookingDetails :", bookingDetails); // Log au début

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
//       "Structure complète de bookingDetails dans le rendu :",
//       bookingDetails
//     ); // Log dans le rendu conditionnel

//     const totalPayableOnBoard = bookingDetails.bookingOptions.reduce(
//       (sum, bookingOption) =>
//         bookingOption.option.payableAtBoard
//           ? sum + bookingOption.quantity * bookingOption.option.unitPrice
//           : sum,
//       0
//     );

//     const captainPrice = 350; // Récupérer le prix du capitaine (doit correspondre à la constante dans ServiceList)
//     const isWithCaptain = !bookingDetails.withCaptain; // La logique inverse est stockée dans la BDD
//     const mealOptionSelected = bookingDetails.mealOption;
//     const totalAmount =
//       bookingDetails.boatAmount +
//       totalPayableOnBoard +
//       (isWithCaptain ? captainPrice : 0);

//     return (
//       <div
//         className="booking-details"
//         style={{
//           padding: "20px",
//           background: "#f9f9f9",
//           borderRadius: "1rem",
//           boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
//         }}
//       >
//         <h1 style={{ color: "#007bff", marginBottom: "1rem" }}>
//           Réservation Vérifiée !
//         </h1>
//         <p>
//           <strong>ID de la réservation :</strong> {bookingDetails.id}
//         </p>
//         {bookingDetails.service && (
//           <p>
//             <strong>Service :</strong> {bookingDetails.service.name}
//           </p>
//         )}
//         <p>
//           <strong>Début :</strong>{" "}
//           {bookingDetails.startTime
//             ? new Date(bookingDetails.startTime).toLocaleString("fr-FR", {
//                 dateStyle: "full",
//                 timeStyle: "short",
//               })
//             : "Date de début invalide"}
//         </p>
//         <p>
//           <strong>Fin :</strong>{" "}
//           {bookingDetails.endTime
//             ? new Date(bookingDetails.endTime).toLocaleString("fr-FR", {
//                 timeStyle: "short",
//               })
//             : "Date de fin invalide"}
//         </p>
//         <p>
//           <strong>Prix de la location du bateau :</strong>{" "}
//           {typeof bookingDetails.boatAmount === "number"
//             ? new Intl.NumberFormat("fr-FR", {
//                 style: "currency",
//                 currency: bookingDetails.service?.currency || "EUR",
//               }).format(bookingDetails.boatAmount)
//             : "Prix de location invalide"}
//         </p>
//         <p>
//           <strong>État de la réservation :</strong> {bookingDetails.status}
//         </p>
//         <p>
//           <strong>Capitaine inclus :</strong> {isWithCaptain ? "Oui" : "Non"}
//         </p>
//         {isWithCaptain && (
//           <p>
//             <strong>Prix du capitaine :</strong>{" "}
//             {new Intl.NumberFormat("fr-FR", {
//               style: "currency",
//               currency: bookingDetails.service?.currency || "EUR",
//             }).format(captainPrice)}
//           </p>
//         )}
//         <p>
//           <strong>Repas traiteur demandé :</strong>{" "}
//           {mealOptionSelected ? "Oui" : "Non"}
//         </p>

//         {bookingDetails.client && (
//           <div
//             style={{
//               marginTop: "1rem",
//               borderTop: "1px solid #ccc",
//               paddingTop: "1rem",
//             }}
//           >
//             <h3>Informations Client</h3>
//             <p>
//               <strong>Nom :</strong> {bookingDetails.client.fullName}
//             </p>
//             <p>
//               <strong>Email :</strong> {bookingDetails.client.email}
//             </p>
//             <p>
//               <strong>Téléphone :</strong> {bookingDetails.client.phoneNumber}
//             </p>
//           </div>
//         )}
//         {bookingDetails.userId && ( // Vérifiez si c'est un utilisateur connecté
//           <div
//             style={{
//               marginTop: "1rem",
//               borderTop: "1px solid #ccc",
//               paddingTop: "1rem",
//             }}
//           >
//             <h3>Informations Utilisateur (si connecté)</h3>
//             <p>
//               <strong>ID Utilisateur :</strong> {bookingDetails.userId}
//             </p>
//           </div>
//         )}
//         {bookingDetails.bookingOptions &&
//           bookingDetails.bookingOptions.length > 0 && (
//             <div
//               style={{
//                 marginTop: "1rem",
//                 borderTop: "1px solid #ccc",
//                 paddingTop: "1rem",
//               }}
//             >
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
//                 <strong>Montant total des options à payer à bord :</strong>{" "}
//                 {new Intl.NumberFormat("fr-FR", {
//                   style: "currency",
//                   currency: bookingDetails.service?.currency || "EUR",
//                 }).format(totalPayableOnBoard)}
//               </p>
//             </div>
//           )}
//         <p
//           style={{ marginTop: "1rem", fontSize: "1.2rem", fontWeight: "bold" }}
//         >
//           <strong>Montant total à payer :</strong>{" "}
//           {new Intl.NumberFormat("fr-FR", {
//             style: "currency",
//             currency: bookingDetails.service?.currency || "EUR",
//           }).format(totalAmount)}
//         </p>

//         {!bookingDetails.stripePaymentLink && (
//           <p style={{ marginTop: "1rem", color: "orange" }}>
//             Le lien de paiement en ligne vous sera envoyé prochainement par
//             l&apos;administrateur.
//           </p>
//         )}
//       </div>
//     );
//   }

//   return null;
// }
// "use client";

// import { useEffect, useState } from "react";
// import { Booking, Service, BookingOption, Client } from "@/types";
// import styles from "./styles.module.scss"; // Importe les styles

// export interface BookingWithDetails extends Booking {
//   service: Service;
//   bookingOptions: (BookingOption & {
//     option: { unitPrice: number; label: string; payableAtBoard: boolean };
//   })[];
//   client: Client | null;
//   mealOption: boolean;
// }

// export default function VerifyBooking() {
//   const [bookingDetails, setBookingDetails] =
//     useState<BookingWithDetails | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   console.log("Rendu de VerifyBooking avec bookingDetails :", bookingDetails);

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
//           return response.json() as Promise<{ data: BookingWithDetails }>;
//         })
//         .then((data) => {
//           console.log("Données de la réservation reçues :", data);
//           setBookingDetails(data.data);
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
//     return <p className={styles.loadingMessage}>Vérification en cours...</p>;
//   }

//   if (error) {
//     return <p className={styles.errorMessage}>{error}</p>;
//   }

//   if (bookingDetails) {
//     console.log(
//       "Structure complète de bookingDetails dans le rendu :",
//       bookingDetails
//     );

//     const totalPayableOnBoard = bookingDetails.bookingOptions.reduce(
//       (sum, bookingOption) =>
//         bookingOption.option.payableAtBoard
//           ? sum + bookingOption.quantity * bookingOption.option.unitPrice
//           : sum,
//       0
//     );

//     const captainPrice = 350;
//     const isWithCaptain = bookingDetails.withCaptain; // True si le capitaine EST inclus dans les détails de la réservation
//     let finalTotalAmount = bookingDetails.boatAmount + totalPayableOnBoard;
//     let captainIncluded = false;
//     const mealOptionSelected = bookingDetails.mealOption;

//     if (isWithCaptain) {
//       captainIncluded = true;
//     } else {
//       finalTotalAmount += captainPrice;
//     }

//     return (
//       <div className={styles.bookingDetailsContainer}>
//         <h1 className={styles.title}>Réservation Vérifiée !</h1>
//         <p>
//           <span className={styles.label}>ID de la réservation :</span>{" "}
//           <span className={styles.value}>{bookingDetails.id}</span>
//         </p>
//         {bookingDetails.service && (
//           <p>
//             <span className={styles.label}>Service :</span>{" "}
//             <span className={styles.value}>{bookingDetails.service.name}</span>
//           </p>
//         )}
//         <p>
//           <span className={styles.label}>Début :</span>{" "}
//           <span className={styles.value}>
//             {bookingDetails.startTime
//               ? new Date(bookingDetails.startTime).toLocaleString("fr-FR", {
//                   dateStyle: "full",
//                   timeStyle: "short",
//                 })
//               : "Date de début invalide"}
//           </span>
//         </p>
//         <p>
//           <span className={styles.label}>Fin :</span>{" "}
//           <span className={styles.value}>
//             {bookingDetails.endTime
//               ? new Date(bookingDetails.endTime).toLocaleString("fr-FR", {
//                   timeStyle: "short",
//                 })
//               : "Date de fin invalide"}
//           </span>
//         </p>
//         <p>
//           <span className={styles.label}>Prix de la location du bateau :</span>{" "}
//           <span className={styles.value}>
//             {typeof bookingDetails.boatAmount === "number"
//               ? new Intl.NumberFormat("fr-FR", {
//                   style: "currency",
//                   currency: bookingDetails.service?.currency || "EUR",
//                 }).format(bookingDetails.boatAmount)
//               : "Prix de location invalide"}
//           </span>
//         </p>
//         <p>
//           <span className={styles.label}>État de la réservation :</span>{" "}
//           <span className={styles.value}>{bookingDetails.status}</span>
//         </p>
//         <p>
//           <span className={styles.label}>Capitaine inclus :</span>{" "}
//           <span className={styles.value}>
//             {captainIncluded ? "Oui" : "Non"}
//           </span>
//         </p>
//         {!isWithCaptain && (
//           <p className={styles.captainPrice}>
//             <span className={styles.label}>Prix du capitaine :</span>{" "}
//             <span className={styles.value}>
//               {new Intl.NumberFormat("fr-FR", {
//                 style: "currency",
//                 currency: bookingDetails.service?.currency || "EUR",
//               }).format(captainPrice)}
//             </span>
//           </p>
//         )}
//         <p>
//           <span className={styles.label}>Repas traiteur demandé :</span>{" "}
//           <span className={styles.value}>
//             {mealOptionSelected ? "Oui" : "Non"}
//           </span>
//         </p>

//         {bookingDetails.client && (
//           <div className={styles.clientInfo}>
//             <h3 className={styles.sectionTitle}>Informations Client</h3>
//             <p>
//               <span className={styles.label}>Nom :</span>{" "}
//               <span className={styles.value}>
//                 {bookingDetails.client.fullName}
//               </span>
//             </p>
//             <p>
//               <span className={styles.label}>Email :</span>{" "}
//               <span className={styles.value}>
//                 {bookingDetails.client.email}
//               </span>
//             </p>
//             <p>
//               <span className={styles.label}>Téléphone :</span>{" "}
//               <span className={styles.value}>
//                 {bookingDetails.client.phoneNumber}
//               </span>
//             </p>
//           </div>
//         )}
//         {bookingDetails.userId && (
//           <div className={styles.userInfo}>
//             <h3 className={styles.sectionTitle}>
//               Informations Utilisateur (si connecté)
//             </h3>
//             <p>
//               <span className={styles.label}>ID Utilisateur :</span>{" "}
//               <span className={styles.value}>{bookingDetails.userId}</span>
//             </p>
//           </div>
//         )}
//         {bookingDetails.bookingOptions &&
//           bookingDetails.bookingOptions.length > 0 && (
//             <div className={styles.optionsSelected}>
//               <h3 className={styles.sectionTitle}>
//                 Options Sélectionnées (paiement à bord)
//               </h3>
//               <ul className={styles.optionsList}>
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
//                 <span className={styles.label}>
//                   Montant total des options à payer à bord :
//                 </span>{" "}
//                 <span className={styles.value}>
//                   {new Intl.NumberFormat("fr-FR", {
//                     style: "currency",
//                     currency: bookingDetails.service?.currency || "EUR",
//                   }).format(totalPayableOnBoard)}
//                 </span>
//               </p>
//             </div>
//           )}
//         <p className={styles.totalAmount}>
//           <span className={styles.label}>Montant total à payer :</span>{" "}
//           <span className={styles.value}>
//             {new Intl.NumberFormat("fr-FR", {
//               style: "currency",
//               currency: bookingDetails.service?.currency || "EUR",
//             }).format(finalTotalAmount)}
//           </span>
//         </p>

//         {!bookingDetails.stripePaymentLink && (
//           <p className={styles.paymentNote}>
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
import { Booking, Service, BookingOption, Client } from "@/types";
import styles from "./styles.module.scss"; // Importe les styles

export interface BookingWithDetails extends Booking {
  service: Service;
  bookingOptions: (BookingOption & {
    option: { unitPrice: number; label: string; payableAtBoard: boolean };
  })[];
  client: Client | null;
  mealOption: boolean;
}

export default function VerifyBooking() {
  const [bookingDetails, setBookingDetails] =
    useState<BookingWithDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  console.log("Rendu de VerifyBooking avec bookingDetails :", bookingDetails);

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
          return response.json() as Promise<{ data: BookingWithDetails }>;
        })
        .then((data) => {
          console.log("Données de la réservation reçues :", data);
          setBookingDetails(data.data);
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
    return <p className={styles.loadingMessage}>Vérification en cours...</p>;
  }

  if (error) {
    return <p className={styles.errorMessage}>{error}</p>;
  }

  if (bookingDetails) {
    console.log(
      "Structure complète de bookingDetails dans le rendu :",
      bookingDetails
    );

    const totalPayableOnBoard = bookingDetails.bookingOptions.reduce(
      (sum, bookingOption) =>
        bookingOption.option.payableAtBoard
          ? sum + bookingOption.quantity * bookingOption.option.unitPrice
          : sum,
      0
    );

    const captainPrice = 350;
    const isWithCaptain = bookingDetails.withCaptain; // True si le capitaine EST inclus dans les détails de la réservation
    let finalTotalAmount = bookingDetails.boatAmount + totalPayableOnBoard;
    let captainIncluded = false;
    const mealOptionSelected = bookingDetails.mealOption;

    if (isWithCaptain) {
      captainIncluded = true;
    } else {
      finalTotalAmount += captainPrice;
    }

    return (
      <div className={styles.bookingDetailsContainer}>
        <h1 className={styles.title}>Réservation Vérifiée !</h1>
        <div className={styles.twoColumns}>
          <div className={styles.leftBlock}>
            <p>
              <span className={styles.label}>ID de la réservation :</span>{" "}
              <span className={styles.value}>{bookingDetails.id}</span>
            </p>
            {bookingDetails.service && (
              <p>
                <span className={styles.label}>Service :</span>{" "}
                <span className={styles.value}>
                  {bookingDetails.service.name}
                </span>
              </p>
            )}
            <p>
              <span className={styles.label}>Début :</span>{" "}
              <span className={styles.value}>
                {bookingDetails.startTime
                  ? new Date(bookingDetails.startTime).toLocaleString("fr-FR", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })
                  : "Date de début invalide"}
              </span>
            </p>
            <p>
              <span className={styles.label}>Fin :</span>{" "}
              <span className={styles.value}>
                {bookingDetails.endTime
                  ? new Date(bookingDetails.endTime).toLocaleString("fr-FR", {
                      timeStyle: "short",
                    })
                  : "Date de fin invalide"}
              </span>
            </p>
            <p>
              <span className={styles.label}>
                Prix de la location du bateau :
              </span>{" "}
              <span className={styles.value}>
                {typeof bookingDetails.boatAmount === "number"
                  ? new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: bookingDetails.service?.currency || "EUR",
                    }).format(bookingDetails.boatAmount)
                  : "Prix de location invalide"}
              </span>
            </p>
            <p>
              <span className={styles.label}>État de la réservation :</span>{" "}
              <span className={styles.value}>{bookingDetails.status}</span>
            </p>
            <p>
              <span className={styles.label}>Capitaine inclus :</span>{" "}
              <span className={styles.value}>
                {captainIncluded ? "Oui" : "Non"}
              </span>
            </p>
            {!isWithCaptain && (
              <p className={styles.captainPrice}>
                <span className={styles.label}>Prix du capitaine :</span>{" "}
                <span className={styles.value}>
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: bookingDetails.service?.currency || "EUR",
                  }).format(captainPrice)}
                </span>
              </p>
            )}
            <p>
              <span className={styles.label}>Repas traiteur demandé :</span>{" "}
              <span className={styles.value}>
                {mealOptionSelected ? "Oui" : "Non"}
              </span>
            </p>
          </div>
          <div className={styles.rightBlock}>
            {bookingDetails.client && (
              <div className={styles.clientInfo}>
                <h3 className={styles.sectionTitle}>Informations Client</h3>
                <p>
                  <span className={styles.label}>Nom :</span>{" "}
                  <span className={styles.value}>
                    {bookingDetails.client.fullName}
                  </span>
                </p>
                <p>
                  <span className={styles.label}>Email :</span>{" "}
                  <span className={styles.value}>
                    {bookingDetails.client.email}
                  </span>
                </p>
                <p>
                  <span className={styles.label}>Téléphone :</span>{" "}
                  <span className={styles.value}>
                    {bookingDetails.client.phoneNumber}
                  </span>
                </p>
              </div>
            )}
            {bookingDetails.bookingOptions &&
              bookingDetails.bookingOptions.length > 0 && (
                <div className={styles.optionsSelected}>
                  <h3 className={styles.sectionTitle}>
                    Options Sélectionnées (paiement à bord)
                  </h3>
                  <ul className={styles.optionsList}>
                    {bookingDetails.bookingOptions.map((bookingOption) => (
                      <li key={bookingOption.id}>
                        {bookingOption.option.label} x {bookingOption.quantity}{" "}
                        ({" "}
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: bookingDetails.service?.currency || "EUR",
                        }).format(bookingOption.option.unitPrice)}
                        /unité )
                      </li>
                    ))}
                  </ul>
                  <p>
                    <span className={styles.label}>
                      Montant total des options à payer à bord :
                    </span>{" "}
                    <span className={styles.value}>
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: bookingDetails.service?.currency || "EUR",
                      }).format(totalPayableOnBoard)}
                    </span>
                  </p>
                </div>
              )}
            <p className={styles.totalAmount}>
              <span className={styles.label}>Montant total à payer :</span>{" "}
              <span className={styles.value}>
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: bookingDetails.service?.currency || "EUR",
                }).format(finalTotalAmount)}
              </span>
            </p>

            {/* {!bookingDetails.stripePaymentLink && (
              <p className={styles.paymentNote}>
                Le lien de paiement en ligne vous sera envoyé prochainement par
                l&apos;administrateur.
              </p>
            )} */}

            {bookingDetails.userId && (
              <div className={styles.userInfo}>
                <h3 className={styles.sectionTitle}>
                  Informations Utilisateur (si connecté)
                </h3>
                <p>
                  <span className={styles.label}>ID Utilisateur :</span>{" "}
                  <span className={styles.value}>{bookingDetails.userId}</span>
                </p>
              </div>
            )}
            {!bookingDetails.stripePaymentLink && (
              <p className={styles.paymentNote}>
                Le lien de paiement en ligne vous sera envoyé prochainement par
                l&apos;administrateur.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
