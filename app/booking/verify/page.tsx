// "use client";
// import { useEffect, useState } from "react";
// import { Booking, Service, BookingOption, Client } from "@/types";
// import styles from "./styles.module.scss";
// import { toast } from "react-hot-toast";
// import Spinner from "@/app/components/Spinner/Spinner";

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
//   const [isRequesting, setIsRequesting] = useState(false);
//   const [requestSent, setRequestSent] = useState(false);

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
//             throw new Error(
//               err.error || "Erreur lors de la vérification du token."
//             );
//           }
//           return response.json() as Promise<{ data: BookingWithDetails }>;
//         })
//         .then((data) => {
//           setBookingDetails(data.data);
//           setLoading(false);
//         })
//         .catch((err) => {
//           setError(err.message);
//           setLoading(false);
//         });
//     } else {
//       setError("Token de vérification manquant dans l'URL.");
//       setLoading(false);
//     }
//   }, []);

//   const handleRequestBooking = async () => {
//     if (
//       bookingDetails?.id &&
//       bookingDetails.client &&
//       !isRequesting &&
//       !requestSent
//     ) {
//       setIsRequesting(true);
//       try {
//         let stripeUrl: string | null = null;

//         // 1. Créer le lien de paiement Stripe
//         const createStripeLinkResponse = await fetch(
//           `/api/admin/bookings/${bookingDetails.id}/payment-url`
//         );

//         if (createStripeLinkResponse.ok) {
//           const { url } = await createStripeLinkResponse.json();
//           stripeUrl = url;
//         }

//         // 2. Envoyer les détails de la réservation à l'administrateur (avec stripeUrl)
//         const sendDetailsResponse = await fetch(
//           `/api/admin/bookings/sendReservationDetails`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               bookingId: String(bookingDetails.id),
//               firstName: bookingDetails.client.fullName.split(" ")[0],
//               lastName: bookingDetails.client.fullName
//                 .split(" ")
//                 .slice(1)
//                 .join(" "),
//               email: bookingDetails.client.email,
//               phoneNumber: bookingDetails.client.phoneNumber,
//               reservationTime: new Date(
//                 bookingDetails.startTime
//               ).toLocaleString("fr-FR"),
//               stripeUrl,
//               bookingOptions: bookingDetails.bookingOptions,
//               withCaptain: bookingDetails.withCaptain,
//               mealOption: bookingDetails.mealOption,
//               boatAmount: bookingDetails.boatAmount,
//               service: bookingDetails.service,
//             }),
//           }
//         );

//         // 3. Envoyer l'email de confirmation de réception au client
//         const sendConfirmationResponse = await fetch(
//           `/api/send-request-confirmation`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               bookingId: bookingDetails.id,
//               clientEmail: bookingDetails.client.email,
//               clientName: bookingDetails.client.fullName,
//             }),
//           }
//         );

//         if (sendDetailsResponse.ok && sendConfirmationResponse.ok) {
//           toast.success(
//             "Votre demande de réservation a été envoyée. Vous allez être redirigé vers le paiement.",
//             { position: "top-center" }
//           );

//           setRequestSent(true); // ← signaler que la demande est envoyée
//           setIsRequesting(false);

//           // Redirection après 3 secondes
//           setTimeout(() => {
//             window.location.href = "/";
//           }, 3000);
//         } else {
//           toast.error(
//             "Une erreur est survenue lors de l'envoi de votre demande.",
//             { position: "top-center" }
//           );
//           setIsRequesting(false);
//         }
//       } catch (error) {
//         toast.error("Erreur inattendue : " + error, {
//           position: "top-center",
//         });
//         setIsRequesting(false);
//       }
//     }
//   };

//   if (loading) {
//     return <Spinner />;
//   }

//   if (error) {
//     return <p className={styles.errorMessage}>{error}</p>;
//   }

//   if (bookingDetails) {
//     const captainPrice = 350;

//     // Montant total des options à régler à bord (hors capitaine)
//     const totalOptionsPayableOnBoard = bookingDetails.bookingOptions.reduce(
//       (sum, bookingOption) =>
//         bookingOption.option.payableAtBoard
//           ? sum + bookingOption.quantity * bookingOption.option.unitPrice
//           : sum,
//       0
//     );

//     // On ajoute toujours le prix capitaine dans le total options à régler à bord
//     const totalPayableOnBoardWithCaptain =
//       totalOptionsPayableOnBoard + captainPrice;

//     // Montant total final (bateau + options + capitaine)
//     const finalTotalAmount =
//       bookingDetails.boatAmount + totalPayableOnBoardWithCaptain;

//     return (
//       <div className={styles.bookingDetailsContainer}>
//         <h1 className={styles.title}>Réservation Vérifiée !</h1>
//         <div className={styles.twoColumns}>
//           <div className={styles.leftBlock}>
//             <p>
//               <span className={styles.label}>ID de la réservation :</span>{" "}
//               <span className={styles.value}>{bookingDetails.id}</span>
//             </p>
//             {bookingDetails.service && (
//               <p>
//                 <span className={styles.label}>Service :</span>{" "}
//                 <span className={styles.value}>
//                   {bookingDetails.service.name}
//                 </span>
//               </p>
//             )}
//             <p>
//               <span className={styles.label}>Début :</span>{" "}
//               <span className={styles.value}>
//                 {bookingDetails.startTime
//                   ? new Date(bookingDetails.startTime).toLocaleString("fr-FR", {
//                       dateStyle: "full",
//                       timeStyle: "short",
//                     })
//                   : "Date de début invalide"}
//               </span>
//             </p>
//             <p>
//               <span className={styles.label}>Fin :</span>{" "}
//               <span className={styles.value}>
//                 {bookingDetails.endTime
//                   ? new Date(bookingDetails.endTime).toLocaleString("fr-FR", {
//                       timeStyle: "short",
//                     })
//                   : "Date de fin invalide"}
//               </span>
//             </p>
//             <p>
//               <span className={styles.label}>État de la réservation :</span>{" "}
//               <span className={styles.value}>{bookingDetails.status}</span>
//             </p>
//             <p>
//               <span className={styles.label}>Capitaine inclus :</span>{" "}
//               <span className={styles.value}>
//                 {bookingDetails.withCaptain ? "Oui" : "Non"}
//               </span>
//             </p>
//             <p>
//               <span className={styles.label}>Prix du capitaine :</span>{" "}
//               <span className={styles.value}>
//                 {new Intl.NumberFormat("fr-FR", {
//                   style: "currency",
//                   currency: bookingDetails.service?.currency || "EUR",
//                 }).format(captainPrice)}{" "}
//                 (inclus dans le total des options à régler à bord)
//               </span>
//             </p>
//             <p>
//               <span className={styles.label}>Repas traiteur demandé :</span>{" "}
//               <span className={styles.value}>
//                 {bookingDetails.mealOption ? "Oui" : "Non"}
//               </span>
//             </p>
//           </div>
//           <div className={styles.rightBlock}>
//             {bookingDetails.client && (
//               <div className={styles.clientInfo}>
//                 <h3 className={styles.sectionTitle}>Informations Client</h3>
//                 <p>
//                   <span className={styles.label}>Nom :</span>{" "}
//                   <span className={styles.value}>
//                     {bookingDetails.client.fullName}
//                   </span>
//                 </p>
//                 <p>
//                   <span className={styles.label}>Email :</span>{" "}
//                   <span className={styles.value}>
//                     {bookingDetails.client.email}
//                   </span>
//                 </p>
//                 <p>
//                   <span className={styles.label}>Téléphone :</span>{" "}
//                   <span className={styles.value}>
//                     {bookingDetails.client.phoneNumber}
//                   </span>
//                 </p>
//               </div>
//             )}
//             {bookingDetails.bookingOptions &&
//               bookingDetails.bookingOptions.length > 0 && (
//                 <div className={styles.optionsSelected}>
//                   <h3 className={styles.sectionTitle}>
//                     Options Sélectionnées (paiement à bord)
//                   </h3>
//                   <ul className={styles.optionsList}>
//                     {bookingDetails.bookingOptions.map((bookingOption) => (
//                       <li key={bookingOption.id}>
//                         {bookingOption.option.label} x {bookingOption.quantity}{" "}
//                         ({" "}
//                         {new Intl.NumberFormat("fr-FR", {
//                           style: "currency",
//                           currency: bookingDetails.service?.currency || "EUR",
//                         }).format(bookingOption.option.unitPrice)}
//                         /unité )
//                       </li>
//                     ))}
//                     <li>
//                       <strong>Capitaine :</strong>{" "}
//                       {new Intl.NumberFormat("fr-FR", {
//                         style: "currency",
//                         currency: bookingDetails.service?.currency || "EUR",
//                       }).format(captainPrice)}
//                     </li>
//                   </ul>
//                   <p>
//                     <span className={styles.label}>
//                       Montant total des options à régler à bord :
//                     </span>{" "}
//                     <span className={styles.value}>
//                       {new Intl.NumberFormat("fr-FR", {
//                         style: "currency",
//                         currency: bookingDetails.service?.currency || "EUR",
//                       }).format(totalPayableOnBoardWithCaptain)}
//                     </span>
//                   </p>
//                 </div>
//               )}

//             <div className={styles.intermediatePrice}>
//               <p>
//                 <span className={styles.label}>
//                   Prix de la location du bateau (à régler en ligne après
//                   soumission) :
//                 </span>{" "}
//                 <span className={styles.value}>
//                   {new Intl.NumberFormat("fr-FR", {
//                     style: "currency",
//                     currency: bookingDetails.service?.currency || "EUR",
//                   }).format(bookingDetails.boatAmount)}
//                 </span>
//               </p>
//             </div>

//             <hr className={styles.separator} />

//             <p className={styles.totalAmount}>
//               <span className={styles.label}>Montant total à régler :</span>{" "}
//               <span className={styles.value}>
//                 {new Intl.NumberFormat("fr-FR", {
//                   style: "currency",
//                   currency: bookingDetails.service?.currency || "EUR",
//                 }).format(finalTotalAmount)}
//               </span>
//             </p>

//             {bookingDetails.userId && (
//               <div className={styles.userInfo}>
//                 <h3 className={styles.sectionTitle}>
//                   Informations Utilisateur (si connecté)
//                 </h3>
//                 <p>
//                   <span className={styles.label}>ID Utilisateur :</span>{" "}
//                   <span className={styles.value}>{bookingDetails.userId}</span>
//                 </p>
//               </div>
//             )}
//             {!bookingDetails.stripePaymentLink && (
//               <p className={styles.paymentNote}>
//                 Le lien de paiement en ligne vous sera envoyé prochainement par
//                 l&apos;administrateur.
//               </p>
//             )}
//           </div>
//         </div>
//         <span className={styles.btn__requestButton}>
//           <button
//             className={styles.__requestButton}
//             onClick={handleRequestBooking}
//             disabled={isRequesting || requestSent}
//           >
//             {isRequesting
//               ? "Demande en cours..."
//               : requestSent
//                 ? "Demande envoyée"
//                 : "Soumettre ma demande"}
//           </button>
//         </span>

//         <br />
//         <span className={styles.infoText}>
//           <p>
//             Après validation, vous recevrez un email avec un lien pour effectuer
//             votre paiement.
//           </p>
//         </span>
//       </div>
//     );
//   }

//   return null;
// }
"use client";
import { useEffect, useState } from "react";
import { Booking, Service, BookingOption, Client } from "@/types";
import styles from "./styles.module.scss";
import { toast } from "react-hot-toast";
import Spinner from "@/app/components/Spinner/Spinner";

export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID";

export interface BookingWithDetails extends Booking {
  service: Service;
  bookingOptions: (BookingOption & {
    option: { unitPrice: number; label: string; payableAtBoard: boolean };
  })[];
  client: Client | null;
  mealOption: boolean;
}

const bookingStatusLabels: Record<BookingStatus, string> = {
  PENDING: "En attente de validation",
  APPROVED: "Réservation approuvée",
  REJECTED: "Réservation refusée",
  PAID: "Réservation payée",
};

function getReadableBookingStatus(status: BookingStatus): string {
  return bookingStatusLabels[status] || "Statut inconnu";
}

export default function VerifyBooking() {
  const [bookingDetails, setBookingDetails] =
    useState<BookingWithDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

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
            throw new Error(
              err.error || "Erreur lors de la vérification du token."
            );
          }
          return response.json() as Promise<{ data: BookingWithDetails }>;
        })
        .then((data) => {
          setBookingDetails(data.data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setError("Token de vérification manquant dans l'URL.");
      setLoading(false);
    }
  }, []);

  const handleRequestBooking = async () => {
    if (
      bookingDetails?.id &&
      bookingDetails.client &&
      !isRequesting &&
      !requestSent
    ) {
      setIsRequesting(true);
      try {
        let stripeUrl: string | null = null;

        // 1. Créer le lien de paiement Stripe
        const createStripeLinkResponse = await fetch(
          `/api/admin/bookings/${bookingDetails.id}/payment-url`
        );

        if (createStripeLinkResponse.ok) {
          const { url } = await createStripeLinkResponse.json();
          stripeUrl = url;
        }

        // 2. Envoyer les détails de la réservation à l'administrateur (avec stripeUrl)
        const sendDetailsResponse = await fetch(
          `/api/admin/bookings/sendReservationDetails`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bookingId: String(bookingDetails.id),
              firstName: bookingDetails.client.fullName.split(" ")[0],
              lastName: bookingDetails.client.fullName
                .split(" ")
                .slice(1)
                .join(" "),
              email: bookingDetails.client.email,
              phoneNumber: bookingDetails.client.phoneNumber,
              reservationTime: new Date(
                bookingDetails.startTime
              ).toLocaleString("fr-FR"),
              stripeUrl,
              bookingOptions: bookingDetails.bookingOptions,
              withCaptain: bookingDetails.withCaptain,
              mealOption: bookingDetails.mealOption,
              boatAmount: bookingDetails.boatAmount,
              service: bookingDetails.service,
            }),
          }
        );

        // 3. Envoyer l'email de confirmation de réception au client
        const sendConfirmationResponse = await fetch(
          `/api/send-request-confirmation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bookingId: bookingDetails.id,
              clientEmail: bookingDetails.client.email,
              clientName: bookingDetails.client.fullName,
            }),
          }
        );

        if (sendDetailsResponse.ok && sendConfirmationResponse.ok) {
          toast.success(
            "Votre demande de réservation a été envoyée. Vous allez être redirigé vers le paiement.",
            { position: "top-center" }
          );

          setRequestSent(true); // ← signaler que la demande est envoyée
          setIsRequesting(false);

          // Redirection après 3 secondes
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        } else {
          toast.error(
            "Une erreur est survenue lors de l'envoi de votre demande.",
            { position: "top-center" }
          );
          setIsRequesting(false);
        }
      } catch (error) {
        toast.error("Erreur inattendue : " + error, {
          position: "top-center",
        });
        setIsRequesting(false);
      }
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <p className={styles.errorMessage}>{error}</p>;
  }

  if (bookingDetails) {
    const captainPrice = 350;

    // Montant total des options à régler à bord (hors capitaine)
    const totalOptionsPayableOnBoard = bookingDetails.bookingOptions.reduce(
      (sum, bookingOption) =>
        bookingOption.option.payableAtBoard
          ? sum + bookingOption.quantity * bookingOption.option.unitPrice
          : sum,
      0
    );

    // On ajoute toujours le prix capitaine dans le total options à régler à bord
    const totalPayableOnBoardWithCaptain =
      totalOptionsPayableOnBoard + captainPrice;

    // Montant total final (bateau + options + capitaine)
    const finalTotalAmount =
      bookingDetails.boatAmount + totalPayableOnBoardWithCaptain;

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
              <span className={styles.label}>État de la réservation :</span>{" "}
              <span className={styles.value}>
                {getReadableBookingStatus(
                  bookingDetails.status as BookingStatus
                )}
              </span>
            </p>
            <p>
              <span className={styles.label}>Capitaine inclus :</span>{" "}
              <span className={styles.value}>
                {bookingDetails.withCaptain ? "Oui" : "Non"}
              </span>
            </p>
            <p>
              <span className={styles.label}>Prix du capitaine :</span>{" "}
              <span className={styles.value}>
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: bookingDetails.service?.currency || "EUR",
                }).format(captainPrice)}{" "}
                (inclus dans le total des options à régler à bord)
              </span>
            </p>
            <p>
              <span className={styles.label}>Repas traiteur demandé :</span>{" "}
              <span className={styles.value}>
                {bookingDetails.mealOption ? "Oui" : "Non"}
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
                    <li>
                      <strong>Capitaine :</strong>{" "}
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: bookingDetails.service?.currency || "EUR",
                      }).format(captainPrice)}
                    </li>
                  </ul>
                  <p>
                    <span className={styles.label}>
                      Montant total des options à régler à bord :
                    </span>{" "}
                    <span className={styles.value}>
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: bookingDetails.service?.currency || "EUR",
                      }).format(totalPayableOnBoardWithCaptain)}
                    </span>
                  </p>
                </div>
              )}

            <div className={styles.intermediatePrice}>
              <p>
                <span className={styles.label}>
                  Prix de la location du bateau (à régler en ligne après
                  soumission) :
                </span>{" "}
                <span className={styles.value}>
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: bookingDetails.service?.currency || "EUR",
                  }).format(bookingDetails.boatAmount)}
                </span>
              </p>
            </div>

            <hr className={styles.separator} />

            <p className={styles.totalAmount}>
              <span className={styles.label}>Montant total à régler :</span>{" "}
              <span className={styles.value}>
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: bookingDetails.service?.currency || "EUR",
                }).format(finalTotalAmount)}
              </span>
            </p>

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
        <span className={styles.btn__requestButton}>
          <button
            className={styles.__requestButton}
            onClick={handleRequestBooking}
            disabled={isRequesting || requestSent}
          >
            {isRequesting
              ? "Demande en cours..."
              : requestSent
                ? "Demande envoyée"
                : "Soumettre ma demande"}
          </button>
        </span>

        <br />
        <span className={styles.infoText}>
          <p>
            Après validation, vous recevrez un email avec un lien pour effectuer
            votre paiement.
          </p>
        </span>
      </div>
    );
  }

  return null;
}
