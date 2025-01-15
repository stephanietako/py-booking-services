"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import DeleteButton from "../DeleteButton/DeleteButton";
import { User } from "@/type";

const ListUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState<string>("");

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`/api/getAllUsers`, { method: "GET" });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des utilisateurs");
      }

      const data: User[] = await response.json();

      setUsers(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs", error);
      setMessage("Erreur lors de la récupération des utilisateurs");
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <>
      {message && <p className="message">{message}</p>}
      <table>
        <thead>
          <tr>
            <td className="table_all_users">Nom</td>
            <td className="table_all_users">Email</td>
            <td className="table_all_users">Image</td>
            <td className="table_all_users">Role</td>
            <td className="table_all_users">Actions</td>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="users_infos">
              <td className="name">{user.name}</td>
              <td className="email">{user.email}</td>
              <td className="image">
                {user.image && (
                  <Image
                    src={user.image || "/default-avatar.png"}
                    alt={user.name ?? "Profil"}
                    width={50}
                    height={50}
                    unoptimized // Désactive l'optimisation stricte de Next.js
                  />
                )}
              </td>
              <td className="role">{user.role?.name || "Non défini"}</td>
              <td className="actions">
                <Link
                  className="modif_users_link"
                  href={`/dashboardUser/edit/${user.clerkUserId}`}
                >
                  Modifier
                </Link>
                <DeleteButton id={user.id as string} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default ListUser;
