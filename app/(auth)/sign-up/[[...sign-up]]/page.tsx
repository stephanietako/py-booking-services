// import { SignUp } from "@clerk/nextjs";

// export default function Page() {
//   return (
//     <div className="signup_page">
//       <SignUp />
//     </div>
//   );
// }
"use client";
import { useState } from "react";
import { SignUp } from "@clerk/nextjs"; // Import Clerk pour l'UI d'inscription

export default function SignUpForm() {
  const [termsAccepted, setTermsAccepted] = useState(false); // État pour gérer l'acceptation des CGU
  const [isFormVisible, setIsFormVisible] = useState(false); // Afficher ou non le formulaire d'inscription

  // Fonction appelée lorsque l'inscription est terminée
  const handleTermsAcceptance = () => {
    if (termsAccepted) {
      setIsFormVisible(true); // Afficher le formulaire Clerk une fois les CGU acceptées
    } else {
      alert("Vous devez accepter les conditions générales pour vous inscrire.");
    }
  };

  return (
    <div>
      {/* Affichage de la case à cocher pour accepter les CGU */}
      {!isFormVisible ? (
        <div>
          <h2>Inscription</h2>
          <label>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            J&apos;accepte les <a href="/terms">Conditions Générales</a>
          </label>

          <button onClick={handleTermsAcceptance}>Continuer</button>
        </div>
      ) : (
        // Si les CGU sont acceptées, afficher le formulaire d'inscription Clerk avec Google
        <div>
          <h2>Inscription</h2>
          <SignUp path="/sign-up" routing="path" />
        </div>
      )}
    </div>
  );
}
