// app/users/dashboard/profile/page.tsx
import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getRole, addUserToDatabase } from "@/actions/actions";

import Wrapper from "../../../components/Wrapper/Wrapper";
import UserProfile from "../../../components/UserProfile/UserProfile";

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

  return (
    <Wrapper>
      <UserProfile userId={userId} />
    </Wrapper>
  );
}
