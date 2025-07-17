// app/components/TokenGeneratorRedirect/TokenGeneratorRedirect.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface TokenGeneratorRedirectProps {
  sessionId: string;
}

export default function TokenGeneratorRedirect({
  sessionId,
}: TokenGeneratorRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const generateTokenAndRedirect = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "https://www.yachting-day.com";

        //  Appel API pour générer le token
        const response = await fetch(
          `${baseUrl}/api/bookings/generate-success-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-call": "true",
            },
            body: JSON.stringify({ sessionId }), // Envoie le sessionId reçu de Stripe
          }
        );

        if (response.ok) {
          const { token: newToken } = await response.json();
          //  Redirection côté client avec le token généré
          router.replace(`/payment/success?token=${newToken}`);
        } else {
          console.error(
            "Erreur lors de la génération du token :",
            await response.text()
          );
          // Redirection en cas d'erreur de génération de token
          router.replace("/payment/error?reason=token_generation_failed");
        }
      } catch (error) {
        console.error(
          "Erreur inattendue lors de la génération du token :",
          error
        );
        // Redirection en cas d'erreur inattendue
        router.replace("/payment/error?reason=server_error");
      }
    };

    if (sessionId) {
      generateTokenAndRedirect();
    }
  }, [sessionId, router]); // Déclenche la logique quand sessionId ou router changent

  return (
    <div
      style={{
        textAlign: "center",
        padding: "50px",
        fontSize: "1.2em",
        color: "#555",
      }}
    >
      <p>Un instant, nous finalisons votre paiement...</p>
    </div>
  );
}
