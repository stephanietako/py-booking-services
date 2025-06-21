// app/payment/success/page.tsx
import PaymentSuccessDetails from "@/app/components/PaymentSuccessDetails/PaymentSuccessDetails";
import { Suspense } from "react";
import styles from "./styles.module.scss";

interface PaymentSuccessProps {
  searchParams: Promise<{
    session_id?: string;
    booking_id?: string;
  }>;
}

export default async function PaymentSuccess({
  searchParams,
}: PaymentSuccessProps) {
  const resolvedSearchParams = await searchParams;
  const sessionId = resolvedSearchParams.session_id;
  const bookingId = resolvedSearchParams.booking_id;

  return (
    <div className={styles.container}>
      <h1 className={styles.succes__title}>🎉 Paiement confirmé</h1>
      <p>Merci pour votre réservation !</p>

      {sessionId && bookingId ? (
        <Suspense fallback={<p>Chargement des détails de la réservation...</p>}>
          <PaymentSuccessDetails sessionId={sessionId} bookingId={bookingId} />
        </Suspense>
      ) : (
        <p>Informations de réservation manquantes</p>
      )}
    </div>
  );
}
