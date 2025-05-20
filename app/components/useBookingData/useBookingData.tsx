// app/components/useBookingData.ts
// "use client";

// import { useEffect, useState } from "react";
// import { Booking } from "@/types";

// export default function useBookingData() {
//   const [booking, setBooking] = useState<Booking | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const token = process.env.NEXT_PUBLIC_API_TOKEN;
//     if (!token) {
//       setError("Token manquant.");
//       setLoading(false);
//       return;
//     }

//     fetch("/api/admin/bookings/verify-token", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ token }),
//     })
//       .then((res) => res.json())
//       .then((data) => setBooking(data))
//       .catch(() => setError("Erreur lors du chargement de la réservation."))
//       .finally(() => setLoading(false));
//   }, []);

//   return { booking, loading, error };
// }
