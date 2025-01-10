import React from "react";
import { addUserToDatabase, getRole } from "@/actions/actions";
import { SignOutButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CardProfil from "../components/CardProfil/CardProfil";
import FormUpdate from "../components/FormUpdate/FormUpdate";
import ListUser from "../components/ListUser/ListUser";
import { CustomUser } from "@/type";
import Wrapper from "../components/Wrapper/Wrapper";

export default async function dashBoardUser() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const user = (await currentUser()) as CustomUser;

  if (userId && user) {
    const fullName = `${user.firstName} ${user.lastName}` || "";
    const email = user.emailAddresses[0]?.emailAddress || "";
    const image = user.imageUrl || "";
    const description = user.description || "";
    await addUserToDatabase(userId, fullName, email, image, description);
  }

  const userRole = await getRole(userId as string);

  return (
    <Wrapper>
      <section className="dashboard_user_container__section">
        <div className="dashboard_user_container__bloc">
          <div className="btn">
            <SignOutButton />
          </div>
          <CardProfil userId={userId as string} />
        </div>
        <div className="dashboard_user_container__content">
          <FormUpdate userId={userId as string} />
          {/* // si ce n'est pas un admin alors il ne devrait et il ne faut pas qu'il puisse voir la liste des utilisateurs */}
          {userRole?.role?.name === "admin" && <ListUser />}
        </div>
      </section>
    </Wrapper>
  );
}
