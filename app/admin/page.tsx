import { addUserToDatabase, getRole } from "@/actions/actions";
import AdminDashboard from "../components/AdminDashboard/AdminDashboard";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CustomUser } from "@/type";
import Wrapper from "../components/Wrapper/Wrapper";

const AdminPage = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const user = (await currentUser()) as CustomUser;
  if (user) {
    const fullName = `${user.firstName} ${user.lastName}`.trim();
    const email = user.emailAddresses[0]?.emailAddress || "";
    const image = user.imageUrl || "";

    const existingUser = await getRole(userId);
    if (!existingUser) {
      await addUserToDatabase(userId, fullName, email, image);
    }
  }

  // Récupère le rôle de l'utilisateur directement depuis la base de données après l'ajout
  const userRole = await getRole(userId);

  return (
    <Wrapper>
      {userRole?.role?.name === "admin" && <AdminDashboard userId={userId} />}
    </Wrapper>
  );
};

export default AdminPage;
