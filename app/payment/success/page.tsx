// // app/payment/success/page.tsx
// import PaymentSuccessDetails from "@/app/components/PaymentSuccessDetails/PaymentSuccessDetails";
// import { Suspense } from "react";
// import { redirect } from "next/navigation";
// import styles from "./styles.module.scss";

// interface PaymentSuccessProps {
//   searchParams: Promise<{
//     token?: string;
//     session_id?: string;
//     booking_id?: string;
//   }>;
// }

// export default async function PaymentSuccess({
//   searchParams,
// }: PaymentSuccessProps) {
//   const resolvedSearchParams = await searchParams;
//   const token = resolvedSearchParams.token;
//   const sessionId = resolvedSearchParams.session_id;
//   const bookingId = resolvedSearchParams.booking_id;

//   // Si on a un token, on affiche directement les détails
//   if (token) {
//     return (
//       <div className={styles.container}>
//         <h1 className={styles.succes__title}>🎉 Paiement confirmé</h1>
//         <p>Merci pour votre réservation !</p>
//         <Suspense fallback={<p>Chargement des détails de la réservation...</p>}>
//           <PaymentSuccessDetails token={token} />
//         </Suspense>
//       </div>
//     );
//   }

//   // Si on a session_id mais pas de token, on génère le token
//   if (sessionId) {
//     try {
//       // Utiliser l'URL complète pour l'appel interne
//       const baseUrl =
//         process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

//       const response = await fetch(
//         `${baseUrl}/api/bookings/generate-success-token`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             // Ajouter un header pour les appels internes si nécessaire
//             "x-internal-call": "true",
//           },
//           body: JSON.stringify({
//             sessionId,
//             bookingId: bookingId || null,
//           }),
//         }
//       );

//       if (response.ok) {
//         const { token: newToken } = await response.json();
//         redirect(`/payment/success?token=${newToken}`);
//       } else {
//         console.error("Erreur génération token:", await response.text());
//         redirect("/payment/error?reason=token_generation_failed");
//       }
//     } catch (error) {
//       console.error("Erreur génération token:", error);
//       redirect("/payment/error?reason=server_error");
//     }
//   }

//   // Si ni token ni session_id, erreur
//   return (
//     <div className={styles.container}>
//       <div className="error">
//         <h1>❌ Lien de confirmation invalide</h1>
//         <p>Le lien de confirmation est invalide ou a expiré.</p>
//         <p>
//           Veuillez contacter{" "}
//           <a href="mailto:support@votre-site.com">le support</a> si le problème
//           persiste.
//         </p>
//       </div>
//     </div>
//   );
// }

// app/payment/success/page.tsx
// CE FICHIER EST UN SERVER COMPONENT (pas de "use client";)
import PaymentSuccessDetails from "@/app/components/PaymentSuccessDetails/PaymentSuccessDetails";
import TokenGeneratorRedirect from "@/app/components/TokenGeneratorRedirect/TokenGeneratorRedirect"; // Importe le NOUVEAU Client Component
import { Suspense } from "react";
import styles from "./styles.module.scss"; // Assure-toi que ce fichier CSS existe

interface PaymentSuccessProps {
  searchParams: {
    // Pour les Server Components, searchParams n'est PAS une Promise
    token?: string;
    session_id?: string;
  };
}

export default async function PaymentSuccess({
  searchParams,
}: PaymentSuccessProps) {
  const token = searchParams.token;
  const sessionId = searchParams.session_id;

  // Cas 1 : Le token est déjà présent dans l'URL (par exemple, si on vient de l'email)
  // Dans ce cas, on affiche directement les détails de la réservation.
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

  // Cas 2 : On a un session_id (venant de Stripe) mais pas encore de token.
  // On rend le Client Component qui va générer le token et rediriger.
  if (sessionId) {
    return (
      <div className={styles.container}>
        <p>Un instant, nous finalisons votre paiement...</p>
        {/* Le Client Component gérera le fetch et la redirection */}
        <TokenGeneratorRedirect sessionId={sessionId} />
      </div>
    );
  }

  // Cas 3 : Ni token, ni session_id (accès invalide à la page).
  return (
    <div className={styles.container}>
      <div className="error">
        <h1>❌ Lien de confirmation invalide</h1>
        <p>Le lien de confirmation est invalide ou a expiré.</p>
        <p>
          Veuillez contacter{" "}
          <a href="mailto:support@votre-site.com">le support</a> si le problème
          persiste.
        </p>
      </div>
    </div>
  );
}
