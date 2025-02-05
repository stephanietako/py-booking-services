// app/admin/page.tsx
import { addUserToDatabase, getRole } from "@/actions/actions";
import AdminDashboard from "../components/AdminDashboard/AdminDashboard";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CustomUser } from "@/types";

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
