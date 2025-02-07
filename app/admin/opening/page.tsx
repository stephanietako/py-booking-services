import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getRole } from "@/actions/actions";
import Opening from "@/app/components/Opening/Opening";
export const dynamic = "force-dynamic";

const OpeningPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
    return null; // Rediriger si l'utilisateur n'est pas authentifié
  }

  const userRole = await getRole(userId);

  if (userRole?.role?.name !== "admin") {
    redirect("/");
    return null; // Rediriger si l'utilisateur n'est pas un admin
  }

  return (
    <div>
      <Opening />
    </div>
  );
};

export default OpeningPage;
