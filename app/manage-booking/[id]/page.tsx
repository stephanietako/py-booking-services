// app/manage-booking/[id]/page.tsx
"use client";

import React, { FC, useEffect } from "react";
import { getBookingById } from "@/actions/bookings";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const ManageBookingPage: FC = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/");
      return;
    }

    const fetchToken = async () => {
      try {
        const { token } = await getBookingById(id, user.id);
        if (token) {
          router.replace(`/manage-booking?token=${token}`);
        } else {
          console.error("Une erreur s'est produite");
        }
      } catch {
        console.error("Une erreur s'est produite");
      }
    };

    fetchToken();
  }, [id, user, isSignedIn, isLoaded, router]);

  return <p>Redirection...</p>;
};

export default ManageBookingPage;
