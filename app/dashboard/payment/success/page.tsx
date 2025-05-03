import React from "react";
import Link from "next/link";
const page = () => {
  return (
    <div>
      <h1>Paiement reussi !!!</h1>
      <button>
        <Link href="/">Retour sur la page d&apos;accueil</Link>
      </button>
    </div>
  );
};

export default page;
