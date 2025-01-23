//app/components/AdminDashboard.tsx

"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Wrapper from "../Wrapper/Wrapper";
import Link from "next/link";
import { CustomUser } from "@/type";
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
      <div className="admin_dashboard_container">
        <header className="admin_dashboard">
          <h1>Tableau de bord administrateur</h1>
          <p>
            Bienvenue, {data?.firstName} {data?.lastName}
          </p>
        </header>
        <main>
          <Link className="opening_hours" href="/admin/adminPage">
            Heures d&apos;ouverture
          </Link>
          <Link className="service" href="/admin/service">
            Création et gestion d&apos;un service
          </Link>
        </main>
      </div>
    </Wrapper>
  );
};

export default AdminDashboard;
