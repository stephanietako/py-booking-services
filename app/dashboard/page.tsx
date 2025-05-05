import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getRole, addUserToDatabase } from "@/actions/actions";
import { getBookings } from "@/actions/bookings";

import CardProfil from "../components/CardProfil/CardProfil";
import UserProfileUpdateForm from "../components/UserProfileUpdateForm/UserProfileUpdateForm";
import ListUser from "../components/ListUser/ListUser";
import Wrapper from "../components/Wrapper/Wrapper";
import { SignOutButton } from "@clerk/nextjs";
import BookingList from "../components/BookingList/BookingList";

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

  const initialBookings = await getBookings(
    userRole?.role?.name === "admin" ? undefined : userId
  );

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
            {userRole?.role?.name === "admin" && <ListUser />}
          </div>
          <br />
          <div>
            {userRole?.role?.name === "admin" && (
              <BookingList initialBookings={initialBookings} />
            )}
          </div>
        </div>
      </section>
    </Wrapper>
  );
}

// 🎯 Objectif de la page Dashboard
// Actuellement, elle sert à :

// Afficher les informations du profil (CardProfil)

// Permettre à l'utilisateur de modifier sa description (UserProfileUpdateForm)

// Afficher la liste des utilisateurs (si admin)

// Afficher toutes les réservations (si admin)

// Se déconnecter (SignOutButton)

///////////////////////////
// ✅ Utilité pour l'utilisateur “classique” (non-admin)
// Pour un utilisateur standard, la page propose :

// Voir son profil

// Modifier sa description

// 🟡 Verdict :
// Utile, mais très limité.

// Il manque quelque chose de centralisé pour voir ses propres réservations.

// Aujourd’hui, l’utilisateur n’a pas vraiment d’action concrète à faire en dehors de modifier sa description.
// ✅ Utilité pour un admin
// L’admin peut :

// Voir son profil

// Voir la liste des utilisateurs

// Voir toutes les réservations

// 🟢 Verdict :
// Pertinente pour la gestion.

// Elle agit comme un petit panneau d’administration.

////////////
// 💡 Recommandations pour améliorer l’utilité :
// Pour tous les utilisateurs :

// Ajouter une section “Mes réservations” (comme UsersBookings mais filtrée par l’utilisateur actuel uniquement).

// Ajouter une action claire : “Créer une nouvelle réservation” (bouton ou lien).

// Pour les admins :

// Donner des outils supplémentaires : édition de rôles, suppression d’utilisateurs, etc.

// Pour tous :

// Ajouter un tableau de bord synthétique : “Nombre total de réservations”, “Montant total”, etc.

// Meilleure mise en forme des messages : confirmation de modification, erreurs, etc.
