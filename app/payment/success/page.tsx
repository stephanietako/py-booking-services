// app/payment/success/page.tsx
import PaymentSuccessDetails from "@/app/components/PaymentSuccessDetails/PaymentSuccessDetails";
import TokenGeneratorRedirect from "@/app/components/TokenGeneratorRedirect/TokenGeneratorRedirect";
import { Suspense } from "react";
import styles from "./styles.module.scss";

interface PaymentSuccessProps {
  searchParams: Promise<{
    token?: string;
    session_id?: string;
  }>;
}

export default async function PaymentSuccess({
  searchParams,
}: PaymentSuccessProps) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams.token;
  const sessionId = resolvedSearchParams.session_id;

  // Si un token est déjà présent dans l'URL, on affiche directement les détails.
  if (token) {
    return (
      <div className={styles.container}>
        <h1 className={styles.succes__title}>🎉 Paiement confirmé</h1>
        <p>Merci pour votre réservation !</p>
        <Suspense fallback={<p>Chargement des détails de la réservation...</p>}>
          <PaymentSuccessDetails token={token} />
        </Suspense>
      </div>
    );
  }

  // Si on a un session_id (mais pas encore de token),
  // on délègue la tâche de génération de token et de redirection au Client Component.
  if (sessionId) {
    return (
      <div className={styles.container}>
        <p>Un instant, nous finalisons votre paiement...</p>

        <TokenGeneratorRedirect sessionId={sessionId} />
      </div>
    );
  }

  // Si ni token ni session_id n'est présent, c'est un accès invalide à la page.
  return (
    <div className={styles.container}>
      <div className="error">
        <h1>❌ Lien de confirmation invalide</h1>
        <p>Le lien de confirmation est invalide ou a expiré.</p>
        <p>
          Veuillez contacter{" "}
          <a href="mailto:yachtingday@gmail.com">le support</a> si le problème
          persiste.
        </p>
      </div>
    </div>
  );
}
