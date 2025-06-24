"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import BookingList from "@/app/components/BookingList/BookingList";
import ProfileForm from "@/app/components/ProfileForm/ProfileForm";
import type { Booking } from "@/types";

export default function ProfileFormPage() {
  const { user } = useUser();
  const [isClient, setIsClient] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Récupérer les bookings de l'utilisateur
    const fetchUserBookings = async () => {
      if (!user?.id) return;

      setLoadingBookings(true);
      setError(null);

      try {
        const response = await fetch(`/api/bookings/user/${user.id}`);

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des réservations");
        }

        const userBookings = await response.json();
        setBookings(userBookings);
      } catch (err) {
        console.error("Erreur lors de la récupération des bookings:", err);
        setError("Impossible de charger vos réservations");
      } finally {
        setLoadingBookings(false);
      }
    };

    if (isClient && user?.id) {
      fetchUserBookings();
    }
  }, [user?.id, isClient]);

  if (!isClient) {
    return (
      <Wrapper>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            minHeight: "50vh",
          }}
        >
          <p>Chargement du profil...</p>
        </div>
      </Wrapper>
    );
  }

  if (!user?.id) return <p>Vous devez être connecté.</p>;

  return (
    <Wrapper>
      <div style={{ margin: "10rem 2rem" }}>
        <h1>Mon profil</h1>
        <ProfileForm />

        <div style={{ marginTop: "2rem" }}>
          <h2>Mes réservations</h2>
          {loadingBookings ? (
            <p>Chargement des réservations...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : bookings.length === 0 ? (
            <p>Aucune réservation trouvée.</p>
          ) : (
            <BookingList />
          )}
        </div>
      </div>
    </Wrapper>
  );
}
