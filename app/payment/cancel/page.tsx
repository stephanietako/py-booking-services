// app/payment/cancel/page.tsx
import React from "react";
import Link from "next/link";
import styles from "./styles.module.scss";

export default function PaymentCancelPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>❌ Paiement annulé</h1>
      <p className={styles.message}>
        Le processus de paiement a été interrompu. Si c’était une erreur, vous
        pouvez réessayer.
      </p>
      <Link href="/" className={styles.button}>
        Retour à l’accueil
      </Link>
    </div>
  );
}
