// app/admin/dashboard/page.tsx
import { addUserToDatabase, getRole } from "@/actions/actions";
import AdminDashboard from "../../components/AdminDashboard/AdminDashboard";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CustomUser } from "@/types";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const AdminPage = async () => {
  try {
    const { userId } = await auth();
    if (!userId) {
      redirect("/");
      return null;
    }

    const userRole = await getRole(userId);
    if (userRole?.name !== "admin") {
      redirect("/");
      return null;
    }

    const user = (await currentUser()) as CustomUser | null;
    if (user) {
      const fullName = [user.name].filter(Boolean).join(" ").trim();
      const email = user.emailAddresses?.[0]?.emailAddress || "";
      const image = user.imageUrl || "";

      const existingUser = await getRole(userId);
      if (!existingUser) {
        await addUserToDatabase(userId, fullName, email, image);
      }
    }

    const userFromDb = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (userFromDb && !userFromDb.stripeCustomerId) {
      try {
        const stripeCustomer = await stripe.customers.create({
          email: user?.emailAddresses?.[0]?.emailAddress,
        });

        await prisma.user.update({
          where: { clerkUserId: userId },
          data: { stripeCustomerId: stripeCustomer.id },
        });

        console.log("stripeCustomerId mis à jour dans la base de données");
      } catch (error) {
        console.error("Erreur lors de la création du client Stripe:", error);
        // Ne pas bloquer la page, gestion soft
      }
    } else {
      console.log(
        "Utilisateur déjà présent avec un stripeCustomerId:",
        userFromDb?.stripeCustomerId
      );
    }

    return (
      <div>
        <AdminDashboard userId={userId} />
      </div>
    );
  } catch (error) {
    console.error("Erreur page admin:", error);
    return <p>Erreur serveur. Veuillez réessayer plus tard.</p>;
  }
};

export default AdminPage;
