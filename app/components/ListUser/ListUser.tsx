"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import DeleteButton from "../DeleteButton/DeleteButton";
import { User } from "@/types";
import styles from "./styles.module.scss";

const ListUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users`, { method: "GET" });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des utilisateurs");
      }

      const json = await response.json();
      setUsers(json.users);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs", error);
      setMessage("Erreur lors de la récupération des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.title}>Liste des utilisateurs</h2>
      {message && <div className={styles.message}>{message}</div>}
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <span>Chargement...</span>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Image</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={styles.users_infos}>
                <td className={styles.name}>{user.name}</td>
                <td className={styles.email}>{user.email}</td>
                <td className={styles.image}>
                  <div className={styles.image}>
                    <Image
                      src={user.image || "/default-avatar.png"}
                      alt={user.name ?? "Profil"}
                      width={44}
                      height={44}
                      unoptimized
                    />
                  </div>
                </td>
                <td className={styles.role}>
                  {user.role?.name || "Non défini"}
                </td>
                <td className={styles.actions}>
                  <Link
                    className={styles.btn}
                    href={`/dashboard/edit/${user.clerkUserId}`}
                  >
                    Modifier
                  </Link>

                  <DeleteButton
                    id={user.id as string}
                    className={`${styles.btn} ${styles["btn--danger"]}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListUser;
