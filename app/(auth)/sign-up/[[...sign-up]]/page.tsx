// import { SignUp } from "@clerk/nextjs";

// export default function Page() {
//   return (
//     <div className="signup_page">
//       <SignUp />
//     </div>
//   );
// }
//app/(auth)/sign-up/[[...sign-up]]/page.tsx
// "use client";
// import React, { useState } from "react";
// import { SignUp } from "@clerk/nextjs";
// import { useSignUp } from "@clerk/nextjs";

// export default function CustomSignUpForm() {
//   const { signUp } = useSignUp();
//   const [termsAccepted, setTermsAccepted] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!termsAccepted) {
//       setError("Vous devez accepter les CGU pour continuer.");
//       return;
//     }

//     try {
//       if (signUp) {
//         // Valider les données avant de les stocker
//         const termsAcceptedAt = new Date().toISOString();
//         if (!isValidISODate(termsAcceptedAt)) {
//           throw new Error("Date invalide.");
//         }

//         await signUp.update({
//           unsafeMetadata: { termsAcceptedAt },
//         });
//         setError(null); // Si l'inscription réussit, on réinitialise l'erreur
//       } else {
//         setError("Erreur lors de l'inscription. Veuillez réessayer.");
//       }
//     } catch (error) {
//       if (error instanceof Error) {
//         console.error("Erreur lors de l'inscription:", error.message);
//         setError("Une erreur est survenue : " + error.message);
//       } else {
//         console.error("Erreur lors de l'inscription:", error);
//         setError("Une erreur inconnue est survenue.");
//       }
//     }
//   };

//   // Fonction de validation de la date ISO
//   function isValidISODate(date: string): boolean {
//     return !isNaN(Date.parse(date));
//   }

//   return (
//     <div className="signup_page">
//       <SignUp afterSignUpUrl="/" />
//       <form onSubmit={handleSubmit}>
//         <label>
//           <input
//             type="checkbox"
//             checked={termsAccepted}
//             onChange={() => setTermsAccepted(!termsAccepted)}
//           />
//           J&apos;accepte les{" "}
//           <a href="/conditions-generales" target="_blank">
//             Conditions Générales d&apos;Utilisation
//           </a>
//         </label>
//         {error && <div style={{ color: "red" }}>{error}</div>}
//         <button type="submit">S&apos;inscrire</button>
//       </form>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs"; // Clerk pour l'inscription
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { signUp, isLoaded } = useSignUp();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      alert("Vous devez accepter les conditions générales pour vous inscrire.");
      return;
    }

    try {
      if (!isLoaded || !signUp) {
        throw new Error("SignUp is not loaded properly.");
      }

      const response = await signUp.create({
        emailAddress: "user@example.com", // Récupérer depuis le formulaire
        password: "password123", // Récupérer depuis le formulaire
      });

      if (response.status === "complete") {
        // Mise à jour en BDD via une API route
        await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: response.emailAddress,
            termsAcceptedAt: new Date().toISOString(),
          }),
        });

        router.push("/dashboard"); // Rediriger après inscription
      }
    } catch (error) {
      console.error("Erreur d'inscription :", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
        />
        J&apos;accepte les <a href="/terms">Conditions Générales</a>
      </label>

      <button type="submit" disabled={!isLoaded}>
        S&apos;inscrire
      </button>
    </form>
  );
}
