import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getRole, addUserToDatabase } from "@/actions/actions";
import CardProfil from "../components/CardProfil/CardProfil";
import FormUpdate from "../components/FormUpdate/FormUpdate";
import ListUser from "../components/ListUser/ListUser";
import Wrapper from "../components/Wrapper/Wrapper";
import { SignOutButton } from "@clerk/nextjs";
import UsersBookings from "../components/UsersBookings/UsersBookings";

export default async function Dashboard() {
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

  const userRole = await getRole(userId);

  return (
    <Wrapper>
      <section className="dashboard_user_container__section">
        <div className="dashboard_user_container__bloc">
          <SignOutButton />
          <CardProfil userId={userId} />
        </div>
        <div className="dashboard_user_container__content">
          <FormUpdate userId={userId} />
          {userRole?.role?.name === "admin" && <ListUser />}
        </div>
        <br />
        <div>
          {/* Afficher les réservations si l'utilisateur est admin */}
          {userRole?.role?.name === "admin" && <UsersBookings />}{" "}
          {/* Appel de UsersBookings */}
        </div>
      </section>
    </Wrapper>
  );
}
