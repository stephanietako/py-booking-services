// //app/admin/page.tsx
// import { addUserToDatabase, getRole } from "@/actions/actions";
// import AdminDashboard from "../components/AdminDashboard/AdminDashboard";
// import { auth, currentUser } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";
// import { CustomUser } from "@/types";

// const AdminPage = async () => {
//   const { userId } = await auth();
//   if (!userId) redirect("/");

//   const user = (await currentUser()) as CustomUser;
//   if (user) {
//     const fullName = `${user.name} `.trim();
//     const email = user.emailAddresses[0]?.emailAddress || "";
//     const image = user.imageUrl || "";

//     const existingUser = await getRole(userId);
//     if (!existingUser) {
//       await addUserToDatabase(userId, fullName, email, image);
//     }
//   }

//   // Récupère le rôle de l'utilisateur directement depuis la base de données après l'ajout
//   const userRole = await getRole(userId);

//   return (
//     <>
//       {userRole?.role?.name === "admin" && <AdminDashboard userId={userId} />}
//     </>
//   );
// };

// export default AdminPage;
import { addUserToDatabase, getRole } from "@/actions/actions";
import AdminDashboard from "../components/AdminDashboard/AdminDashboard";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CustomUser } from "@/types";

const AdminPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
    return null; // Assurez-vous de retourner null après la redirection
  }

  const user = (await currentUser()) as CustomUser;
  if (!user) {
    redirect("/");
    return null; // Assurez-vous de retourner null après la redirection
  }

  const fullName = `${user.name} `.trim();
  const email = user.emailAddresses[0]?.emailAddress || "";
  const image = user.imageUrl || "";

  // Ajoutez l'utilisateur à la base de données si nécessaire
  await addUserToDatabase(userId, fullName, email, image);

  // Récupère le rôle de l'utilisateur directement depuis la base de données après l'ajout
  const userRole = await getRole(userId);

  if (userRole?.role?.name !== "admin") {
    redirect("/");
    return null; // Assurez-vous de retourner null après la redirection
  }

  return (
    <div>
      <AdminDashboard userId={userId} />
    </div>
  );
};

export default AdminPage;
