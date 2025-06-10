// app/users/dashboard/profile/page.tsx
// import React from "react";
// import { auth, currentUser } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";
// import { addUserToDatabase } from "@/actions/actions";

// import Wrapper from "../../../components/Wrapper/Wrapper";
// import UserProfile from "../../../components/UserProfile/UserProfile";

// export default async function ProfilePage() {
//   const { userId } = await auth();
//   if (!userId) redirect("/");

//   const user = await currentUser();
//   if (user) {
//     const fullName = `${user.firstName} ${user.lastName}`.trim();
//     const email = user.emailAddresses[0]?.emailAddress || "";
//     const image = user.imageUrl || "";

//     // Appelle directement addUserToDatabase, la fonction gère la création/mise à jour
//     await addUserToDatabase(email, fullName, image, userId);
//   }
//   return (
//     <Wrapper>
//       <UserProfile userId={userId} />
//     </Wrapper>
//   );
// }
// app/users/dashboard/profile/page.tsx
import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { addUserToDatabase } from "@/actions/actions";
import { getUserBookings } from "@/actions/bookings"; // <<< IMPORTANT : Importe ton action serveur ici

import Wrapper from "../../../components/Wrapper/Wrapper";
import UserProfile from "../../../components/UserProfile/UserProfile";

export default async function ProfilePage() {
  const { userId } = await auth(); // Récupère l'ID utilisateur de Clerk
  if (!userId) redirect("/"); // Redirige si non connecté

  const user = await currentUser(); // Récupère les détails de l'utilisateur Clerk
  if (user) {
    const fullName = `${user.firstName} ${user.lastName}`.trim();
    const email = user.emailAddresses[0]?.emailAddress || "";
    const image = user.imageUrl || "";

    // Appelle addUserToDatabase pour synchroniser ou lier l'utilisateur Clerk à ta base de données
    // C'est ici que les réservations "guest" sont liées si la logique est implémentée
    await addUserToDatabase(email, fullName, image, userId);
  }

  return (
    <Wrapper>
      <UserProfile
        userId={userId} // Passe l'ID utilisateur Clerk
        fetchBookingsAction={getUserBookings} // <<< IMPORTANT : Passe l'action serveur getUserBookings ici
      />
    </Wrapper>
  );
}
