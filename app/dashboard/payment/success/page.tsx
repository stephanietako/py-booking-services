import React from "react";
import Link from "next/link";
const page = () => {
  return (
    <div>
      <h1>Paiement reussi !!!</h1>
      <button>
        <Link href="/my-bookings">Retour sur le my booking</Link>
      </button>
    </div>
  );
};

export default page;
