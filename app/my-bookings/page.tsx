// filepath: /Volumes/T7/PY_WEBSITE/py-booking-app/app/my-bookings/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import ReservationForm from "../components/ReservationForm/ReservationForm";

const Page = () => {
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_API_TOKEN; // Récupère le token depuis les variables d'environnement

    if (!token) {
      console.error(
        "Le token est manquant dans les variables d'environnement."
      );
      return;
    }

    fetch("/api/bookings/verify-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }), // Utilise le token depuis l'environnement
    })
      .then((res) => res.json())
      .then((data) => setBooking(data))
      .catch((err) =>
        console.error("Erreur lors de la récupération des données :", err)
      );
  }, []);

  if (!booking) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <ReservationForm booking={booking} />
    </div>
  );
};

export default Page;
