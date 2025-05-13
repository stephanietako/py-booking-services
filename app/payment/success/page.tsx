// app/users/payment/success/page.tsx
import PaymentSuccessDetails from "@/app/components/PaymentSuccessDetails/PaymentSuccessDetails";
import { Suspense } from "react";
import styles from "./styles.module.scss";

export default function PaymentSuccess() {
  return (
    <div className={styles.container}>
      <h1 className={styles.succes__title}>🎉 Paiement confirmé</h1>
      <p>Merci pour votre réservation !</p>
      <Suspense fallback={<p>Chargement des détails de la réservation...</p>}>
        <PaymentSuccessDetails />
      </Suspense>
    </div>
  );
}
