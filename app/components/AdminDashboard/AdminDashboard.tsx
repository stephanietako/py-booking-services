"use client";

import { FC } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { checkAdmin } from "@/actions/checkAdmin";
import Wrapper from "../Wrapper/Wrapper";
import Link from "next/link";

type AdminDashboardProps = object;

const AdminDashboard: FC<AdminDashboardProps> = () => {
  const { user } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (user) {
        const provider =
          user.externalAccounts.length > 0 ? "google" : "password";
        const password =
          provider === "password"
            ? prompt("Entrez le mot de passe administrateur :") || ""
            : undefined;

        const result = await checkAdmin(
          user.emailAddresses[0].emailAddress,
          provider,
          password
        );

        if (result.isAdmin) {
          setIsAdmin(true);
        } else {
          alert(result.message);
          router.push("/unauthorized"); // Redirige vers une page non autorisée
        }
      }
    };

    verifyAdmin();
  }, [user, router]);

  if (!user || !isAdmin) {
    return <div>Chargement...</div>;
  }

  return (
    <Wrapper>
      <div className="admin_dashboard_container">
        <header className="admin_dashboard">
          <h1>Tableau de bord administrateur</h1>
          <p>
            Bienvenue, {user.firstName} {user.lastName}
          </p>
        </header>
        <main>
          <Link className="opening_hours" href="/admin/opening">
            Opening Hours
          </Link>
          <Link className="service" href="/admin/service">
            Gérer les services
          </Link>
        </main>
      </div>
    </Wrapper>
  );
};

export default AdminDashboard;
