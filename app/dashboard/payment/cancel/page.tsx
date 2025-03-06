import React from "react";
import Link from "next/link";
const page = () => {
  return (
    <div>
      <h1>Echec de paiement !!!</h1>
      <button>
        <Link href="/my-booking">Retour sur le my booking</Link>
      </button>
    </div>
  );
};

export default page;
