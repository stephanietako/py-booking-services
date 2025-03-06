// // app/admin/page.tsx
// import { addUserToDatabase, getRole } from "@/actions/actions";
// import AdminDashboard from "../components/AdminDashboard/AdminDashboard";
// import { auth, currentUser } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";
// import { CustomUser } from "@/types";
// import { stripe } from "@/lib/stripe";
// import { prisma } from "@/lib/prisma";

// export const dynamic = "force-dynamic";

// const AdminPage = async () => {
//   const { userId } = await auth();

//   // Si l'utilisateur n'est pas authentifié, redirige immédiatement
//   if (!userId) {
//     redirect("/"); // redirection vers la page d'accueil
//     return null; // Retourne null pour ne rien afficher pendant la redirection
//   }

//   const user = (await currentUser()) as CustomUser;

//   // Si l'utilisateur existe, on récupère ou ajoute ses informations dans la base de données
//   if (user) {
//     const fullName = `${user.name} `.trim();
//     const email = user.emailAddresses[0]?.emailAddress || "";
//     const image = user.imageUrl || "";

//     const existingUser = await getRole(userId);
//     if (!existingUser) {
//       await addUserToDatabase(userId, fullName, email, image);
//     }
//   }

//   // if (!user?.stripeCustomerId) {
//   //   const stripecustomer = await stripe.customers.create({
//   //     email: user?.email as string,
//   //   });

//   //   await prisma.user.update({
//   //     where: {
//   //       clerkUserId: userId,
//   //     },
//   //     data: {
//   //       stripeCustomerId: stripecustomer.id as string,
//   //     },
//   //   });
//   // }
//   // Vérifie si l'utilisateur a un stripeCustomerId
//   const userFromDb = await prisma.user.findUnique({
//     where: { clerkUserId: userId },
//   });

// if (userFromDb && !userFromDb.stripeCustomerId) {
//   // Crée le client Stripe si le stripeCustomerId est manquant
//   const stripeCustomer = await stripe.customers.create({
//     email: user.email,
//   });

//   // Mets à jour la base de données avec le stripeCustomerId
//   await prisma.user.update({
//     where: {
//       clerkUserId: userId,
//     },
//     data: {
//       stripeCustomerId: stripeCustomer.id, // Assure-toi que cet ID est bien un string
//     },
//   });
// }

//   // Récupère le rôle de l'utilisateur directement depuis la base de données après l'ajout
//   const userRole = await getRole(userId);

//   // Si l'utilisateur n'a pas le rôle 'admin', on le redirige vers la page d'accueil
//   if (userRole?.role?.name !== "admin") {
//     redirect("/"); // redirection vers la page d'accueil
//     return null; // Retourne null pour ne rien afficher pendant la redirection
//   }

//   // Si l'utilisateur est un admin, on affiche le tableau de bord
//   return (
//     <div>
//       <AdminDashboard userId={userId} />
//     </div>
//   );
// };

// export default AdminPage;
// app/admin/page.tsx
import { addUserToDatabase, getRole } from "@/actions/actions";
import AdminDashboard from "../components/AdminDashboard/AdminDashboard";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CustomUser } from "@/types";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const AdminPage = async () => {
  const { userId } = await auth();

  // Si l'utilisateur n'est pas authentifié, redirige immédiatement
  if (!userId) {
    redirect("/"); // redirection vers la page d'accueil
    return null; // Retourne null pour ne rien afficher pendant la redirection
  }

  const user = (await currentUser()) as CustomUser;

  // Si l'utilisateur existe, on récupère ou ajoute ses informations dans la base de données
  if (user) {
    const fullName = `${user.name} `.trim();
    const email = user.emailAddresses[0]?.emailAddress || "";
    const image = user.imageUrl || "";

    const existingUser = await getRole(userId);
    if (!existingUser) {
      await addUserToDatabase(userId, fullName, email, image);
    }
  }

  // Récupère les informations de l'utilisateur dans la base de données
  const userFromDb = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (userFromDb && !userFromDb.stripeCustomerId) {
    try {
      // Créer un client Stripe pour cet utilisateur si le stripeCustomerId est vide
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
      });

      console.log("Stripe Customer créé avec succès:", stripeCustomer.id); // Vérifie que le client Stripe est bien créé

      // Mettre à jour le stripeCustomerId dans la base de données
      await prisma.user.update({
        where: { clerkUserId: userId },
        data: { stripeCustomerId: stripeCustomer.id },
      });

      console.log("stripeCustomerId mis à jour dans la base de données");
    } catch (error) {
      console.error("Erreur lors de la création du client Stripe:", error);
      throw new Error("Erreur lors de la création du client Stripe.");
    }
  } else {
    console.log(
      "Utilisateur déjà présent avec un stripeCustomerId:",
      userFromDb?.stripeCustomerId
    );
  }

  // Récupère le rôle de l'utilisateur directement depuis la base de données après l'ajout
  const userRole = await getRole(userId);

  // Si l'utilisateur n'a pas le rôle 'admin', on le redirige vers la page d'accueil
  if (userRole?.role?.name !== "admin") {
    redirect("/"); // redirection vers la page d'accueil
    return null; // Retourne null pour ne rien afficher pendant la redirection
  }

  // Si l'utilisateur est un admin, on affiche le tableau de bord
  return (
    <div>
      <AdminDashboard userId={userId} />
    </div>
  );
};

export default AdminPage;
