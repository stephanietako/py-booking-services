// BookingDetailsDisplay.tsx
import { BookingWithDetails, BookingStatus } from "@/types";
import styles from "./styles.module.scss";

const bookingStatusLabels: Record<BookingStatus, string> = {
  PENDING: "En attente de validation",
  APPROVED: "Réservation approuvée",
  REJECTED: "Réservation refusée",
  PAID: "Réservation payée",
  CANCELLED: "Réservation annulée",
};

function getReadableBookingStatus(status: BookingStatus): string {
  return bookingStatusLabels[status] || "Statut inconnu";
}

interface BookingDetailsDisplayProps {
  bookingDetails: BookingWithDetails;
  isRequesting: boolean;
  requestSent: boolean;
  onRequestBooking: () => void;
  onDeleteBooking: () => void;
}

export default function BookingDetailsDisplay({
  bookingDetails,
  isRequesting,
  requestSent,
  onRequestBooking,
  onDeleteBooking,
}: BookingDetailsDisplayProps) {
  const captainPrice = 350;

  const totalOptionsPayableOnBoard = bookingDetails.bookingOptions.reduce(
    (sum, bookingOption) =>
      bookingOption.option.payableAtBoard
        ? sum + bookingOption.quantity * bookingOption.option.unitPrice
        : sum,
    0
  );

  const totalPayableOnBoardWithCaptain =
    bookingDetails.withCaptain === false
      ? totalOptionsPayableOnBoard + captainPrice
      : totalOptionsPayableOnBoard;
  const finalTotalAmount =
    bookingDetails.boatAmount + totalPayableOnBoardWithCaptain;
  ////////
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
          {bookingDetails.description && (
            <p>
              <span className={styles.label}>Commentaire client :</span>{" "}
              <span className={styles.value}>{bookingDetails.description}</span>
            </p>
          )}
          <p>
            <span className={styles.label}>État de la réservation :</span>{" "}
            <span className={styles.value}>
              {getReadableBookingStatus(bookingDetails.status as BookingStatus)}
            </span>
          </p>
          <p>
            <span className={styles.label}>Capitaine inclus :</span>{" "}
            <span className={styles.value}>
              {!bookingDetails.withCaptain ? "Oui" : "Non"}
            </span>
          </p>
          <p>
            <span className={styles.label}>Prix du capitaine :</span>{" "}
            <span className={styles.value}>
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: bookingDetails.service?.currency || "EUR",
              }).format(captainPrice)}{" "}
              (inclus dans le total des options à régler à bord si capitaine
              sollicité)
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
          {/* Section MODIFIÉE pour afficher les infos client ou utilisateur */}
          {bookingDetails.client ? (
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
          ) : bookingDetails.user ? (
            <div className={styles.clientInfo}>
              {" "}
              {/* Utilisation de clientInfo pour le style uniforme */}
              <h3 className={styles.sectionTitle}>Informations Utilisateur</h3>
              <p>
                <span className={styles.label}>Nom :</span>{" "}
                <span className={styles.value}>{bookingDetails.user.name}</span>
              </p>
              <p>
                <span className={styles.label}>Email :</span>{" "}
                <span className={styles.value}>
                  {bookingDetails.user.email}
                </span>
              </p>
              {bookingDetails.user.phoneNumber && ( // Le numéro de téléphone est optionnel pour l'utilisateur
                <p>
                  <span className={styles.label}>Téléphone :</span>{" "}
                  <span className={styles.value}>
                    {bookingDetails.user.phoneNumber}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <p>Aucune information client/utilisateur disponible.</p> // Au cas où ni l'un ni l'autre ne serait lié
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
                      {bookingOption.option.label} x {bookingOption.quantity} ({" "}
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: bookingDetails.service?.currency || "EUR",
                      }).format(bookingOption.option.unitPrice)}
                      /unité )
                    </li>
                  ))}

                  {bookingDetails.withCaptain === false && (
                    <li>
                      <strong>Capitaine :</strong>{" "}
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: bookingDetails.service?.currency || "EUR",
                      }).format(captainPrice)}
                    </li>
                  )}
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
          onClick={onRequestBooking}
          disabled={isRequesting || requestSent}
          aria-label="Soumettre ma demande de réservation"
        >
          {isRequesting
            ? "Demande en cours..."
            : requestSent
              ? "Demande envoyée"
              : "Soumettre ma demande"}
        </button>
      </span>
      <br />
      <span className={styles.btn__deleteButton}>
        <button
          className={styles.__deleteButton}
          onClick={onDeleteBooking}
          disabled={isRequesting || requestSent}
          aria-label="Supprimer ma réservation"
        >
          Supprimer ma réservation
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
