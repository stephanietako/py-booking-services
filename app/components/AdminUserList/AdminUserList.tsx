"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "@/types";
import styles from "./styles.module.scss";

const AdminUserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [page, setPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users?page=${page}&limit=1000`); // + large batch pour filtrer localement
      if (!response.ok)
        throw new Error("Erreur lors du chargement des utilisateurs");
      const data = await response.json();
      setUsers(data.users);
      setFilteredUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error(err);
      setMessage("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const filtered = users.filter(
      (u) =>
        u.name?.toLowerCase().includes(lower) ||
        u.email?.toLowerCase().includes(lower)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    fetchUsers(page);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Utilisateurs inscrits</h2>

      <input
        type="text"
        placeholder="Rechercher un nom ou un email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />

      {message && <p className="text-red-600">{message}</p>}
      {loading ? (
        <p className="text-gray-600">Chargement...</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Nom</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Image</th>
                <th className={styles.th}>Rôle</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className={styles.row}>
                  <td className={styles.td}>{u.name}</td>
                  <td className={styles.td}>{u.email}</td>
                  <td className={styles.td}>
                    <Image
                      src={u.image || "/default-avatar.png"}
                      alt={u.name || "avatar"}
                      width={40}
                      height={40}
                      className={styles.image}
                      unoptimized
                    />
                  </td>
                  <td className={styles.td}>{u.role?.name || "N/A"}</td>
                  <td className={`${styles.td} ${styles.actions}`}>
                    <Link
                      href={`/admin/dashboard/edit/${u.clerkUserId}`}
                      className={styles.link}
                    >
                      Modifier
                    </Link>

                    <button
                      onClick={() => handleDelete(u.clerkUserId)}
                      className={styles.deleteButton}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td className={styles.td} colSpan={5}>
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUserList;
