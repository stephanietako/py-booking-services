import { addUserToDatabase, getRole } from "@/actions/actions";
import AdminDashboard from "../components/AdminDashboard/AdminDashboard";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CustomUser } from "@/type";

const AdminPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const user = (await currentUser()) as CustomUser;

  if (userId && user) {
    const fullName = `${user.firstName} ${user.lastName}` || "";
    const email = user.emailAddresses[0]?.emailAddress || "";
    const image = user.imageUrl || "";

    await addUserToDatabase(userId, fullName, email, image);
  }

  const userRole = await getRole(userId as string);
  return (
    <>
      {userRole?.role?.name === "admin" && <AdminDashboard userId={userId} />}
    </>
  );
};

export default AdminPage;
