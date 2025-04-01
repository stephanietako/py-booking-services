// import { SignUp } from "@clerk/nextjs";

// export default function Page() {
//   return (
//     <div className="signup_page">
//       <SignUp />
//     </div>
//   );
// }
"use client";
import { SignUp } from "@clerk/nextjs";
import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";

export default function CustomSignUpForm() {
  const { signUp } = useSignUp();
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      alert("Vous devez accepter les CGU pour continuer.");
      return;
    }

    try {
      await signUp?.update({
        unsafeMetadata: { termsAcceptedAt: new Date().toISOString() },
      });
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
    }
  };

  return (
    <div className="signup_page">
      <SignUp afterSignUpUrl="/welcome" />
      <form onSubmit={handleSubmit}>
        <label>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={() => setTermsAccepted(!termsAccepted)}
          />
          J&apos;accepte les{" "}
          <a href="/conditions-generales" target="_blank">
            Conditions Générales d&apos;Utilisation
          </a>
        </label>
      </form>
    </div>
  );
}
