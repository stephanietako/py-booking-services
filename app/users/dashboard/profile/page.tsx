// app/users/dashboard/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import BookingList from "@/app/components/BookingList/BookingList";
import ProfileForm from "@/app/components/ProfileForm/ProfileForm";

export default function ProfileFormPage() {
  const { user } = useUser();
  const [isClient, setIsClient] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    setIsClient(true);
    // Récupérer les bookings de l'utilisateur
    if (user?.id) {
      // Appel à votre API pour récupérer les bookings
      // setBookings(result);
    }
  }, [user?.id]);

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
        <BookingList initialBookings={bookings} />
      </div>
    </Wrapper>
  );
}
