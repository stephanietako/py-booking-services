//app/components/AdminDashboard.tsx

"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Wrapper from "../Wrapper/Wrapper";
import Link from "next/link";
import { CustomUser } from "@/types";
//ADMIN
type AdminDashboardProps = {
  userId: string;
};

const AdminDashboard: FC<AdminDashboardProps> = ({ userId }) => {
  const router = useRouter();
  const [data, setData] = useState<CustomUser | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`/api/getUser`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        if (!res.ok) {
          throw new Error("error fetching user data");
        }

        const userData = await res.json();
        if (userData.role?.name !== "admin") {
          router.push("/");
        }
        setData(userData);
      } catch (error) {
        console.error("Impossible de récupérer les données", error);
        setError("error fetching user data");
      }
    };

    fetchUserData();
  }, [userId, router]);

  if (error) {
    return <p className="error_text">{error}</p>;
  }

  return (
    <Wrapper>
      <section>
        <div className="admin_dashboard_container">
          <header className="admin_dashboard">
            <h1>Tableau de bord administrateur</h1>
            <h2>
              Bienvenue, {data?.name?.split(" ")[0]} {data?.name?.split(" ")[1]}
            </h2>
          </header>

          <main>
            <Link className="opening_hours" href="/admin/opening">
              Heures d&apos;ouverture
            </Link>
            <Link className="service" href="/admin/service">
              Création et gestion d&apos;un service
            </Link>
          </main>
        </div>
      </section>
    </Wrapper>
  );
};

export default AdminDashboard;
