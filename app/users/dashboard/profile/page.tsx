// app/users/dashboard/profile/page.tsx
import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getRole, addUserToDatabase } from "@/actions/actions";
import { getBookings } from "@/actions/bookings"; // Assurez-vous que cette action filtre par userId

import CardProfil from "../../../components/CardProfil/CardProfil";
import UserProfileUpdateForm from "../../../components/UserProfileUpdateForm/UserProfileUpdateForm";
import Wrapper from "../../../components/Wrapper/Wrapper";
import { SignOutButton } from "@clerk/nextjs";
import BookingList from "../../../components/BookingList/BookingList";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const user = await currentUser();
  if (user) {
    const fullName = `${user.firstName} ${user.lastName}`.trim();
    const email = user.emailAddresses[0]?.emailAddress || "";
    const image = user.imageUrl || "";

    const existingUser = await getRole(userId);
    if (!existingUser) {
      await addUserToDatabase(userId, fullName, email, image);
    }
  }

  const initialBookings = await getBookings(userId); // Récupère uniquement les réservations de l'utilisateur

  return (
    <Wrapper>
      <section>
        <div className="dashboard_user_container__section">
          <div className="dashboard_user_container__bloc">
            <SignOutButton />
            <CardProfil userId={userId} />
          </div>
          <div className="dashboard_user_container__content">
            <UserProfileUpdateForm userId={userId} />
          </div>
          <br />
          <div>
            <BookingList initialBookings={initialBookings} />
          </div>
        </div>
      </section>
    </Wrapper>
  );
}
