// app/components/AdminUserClientList/AdminUserClientList.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { User, Client } from "@/types";
import styles from "./styles.module.scss";
import DeleteButton from "../DeleteButton/DeleteButton";
import Modal from "../Modal/Modal";
import EditUserForm from "../EditUserForm/EditUserForm";
import EditClientForm from "../EditClientForm/EditClientForm";

type ClientWithComputed = Client & {
  bookingsCount?: number;
  lastBooking?: string;
};

type UserWithComputed = User & {
  bookingsCount?: number;
  lastBooking?: string;
};

type EditModalState =
  | { open: false }
  | { open: true; type: "user"; data: UserWithComputed }
  | { open: true; type: "client"; data: ClientWithComputed };

const DEFAULT_LIMIT = 10;

const AdminUserClientList = () => {
  // States
  const [users, setUsers] = useState<UserWithComputed[]>([]);
  const [clients, setClients] = useState<ClientWithComputed[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editModal, setEditModal] = useState<EditModalState>({ open: false });

  // Pagination
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState({
    total: 0,
    page: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 1,
  });
  const [clientPage, setClientPage] = useState(1);
  const [clientPagination, setClientPagination] = useState({
    total: 0,
    page: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 1,
  });

  // Pagination component
  function Pagination({
    page,
    totalPages,
    onPageChange,
  }: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) {
    if (totalPages <= 1) return null;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          margin: "2rem 0",
        }}
      >
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1}>
          Précédent
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          Suivant
        </button>
      </div>
    );
  }

  // Chargement des données paginées
  const refreshData = async (
    pageUsers = userPage,
    pageClients = clientPage
  ) => {
    setLoading(true);
    try {
      const [userData, clientData] = await Promise.all([
        fetch(`/api/users?page=${pageUsers}&limit=${DEFAULT_LIMIT}`).then((r) =>
          r.json()
        ),
        fetch(`/api/clients?page=${pageClients}&limit=${DEFAULT_LIMIT}`).then(
          (r) => r.json()
        ),
      ]);
      setUsers(Array.isArray(userData.users) ? userData.users : []);
      setUserPagination(
        userData.pagination || {
          total: 0,
          page: 1,
          limit: DEFAULT_LIMIT,
          totalPages: 1,
        }
      );
      setClients(Array.isArray(clientData.clients) ? clientData.clients : []);
      setClientPagination(
        clientData.pagination || {
          total: 0,
          page: 1,
          limit: DEFAULT_LIMIT,
          totalPages: 1,
        }
      );
      setMessage("");
    } catch {
      setMessage("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData(userPage, clientPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPage, clientPage]);

  // Recherche
  const lower = searchTerm.toLowerCase();
  const filter = <
    T extends { name?: string | null; fullName?: string | null; email: string },
  >(
    arr: T[]
  ) =>
    Array.isArray(arr)
      ? arr.filter(
          (item) =>
            (
              item.name?.toLowerCase() ??
              item.fullName?.toLowerCase() ??
              ""
            ).includes(lower) || item.email.toLowerCase().includes(lower)
        )
      : [];

  // Suppression
  const handleDelete = async (type: "user" | "client", id: string | number) => {
    if (!confirm("Supprimer cet élément ?")) return;
    await fetch(`/api/${type === "user" ? "users" : "clients"}/${id}`, {
      method: "DELETE",
    });
    refreshData();
  };

  // Ouvre le modal d'édition
  const handleEdit = (
    type: "user" | "client",
    data: UserWithComputed | ClientWithComputed
  ) => {
    if (type === "user") {
      setEditModal({
        open: true,
        type: "user",
        data: data as UserWithComputed,
      });
    } else {
      setEditModal({
        open: true,
        type: "client",
        data: data as ClientWithComputed,
      });
    }
  };

  // Ferme le modal et rafraîchit la liste après édition
  const handleEditSuccess = () => {
    setEditModal({ open: false });
    refreshData();
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Utilisateurs & Clients</h2>
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
        <>
          <h3 className={styles.subtitle}>Utilisateurs</h3>
          <Table
            data={filter(users).map((user) => ({
              id: user.clerkUserId,
              name: user.name ?? "",
              email: user.email,
              phoneNumber: user.phoneNumber ?? "",
              bookingsCount: user.bookingsCount,
              lastBooking: user.lastBooking,
              image: user.image ?? null,
              role: user.role?.name ?? "",
              type: "user" as const,
              raw: user,
            }))}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
          <Pagination
            page={userPagination.page}
            totalPages={userPagination.totalPages}
            onPageChange={setUserPage}
          />

          <h3 className={styles.subtitle}>
            Clients (hors utilisateurs inscrits)
          </h3>
          <Table
            data={filter(clients).map((client) => ({
              id: client.id,
              name: client.fullName,
              email: client.email,
              phoneNumber: client.phoneNumber,
              bookingsCount: client.bookingsCount,
              lastBooking: client.lastBooking,
              image: undefined,
              role: undefined,
              type: "client" as const,
              raw: client,
            }))}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
          <Pagination
            page={clientPagination.page}
            totalPages={clientPagination.totalPages}
            onPageChange={setClientPage}
          />
        </>
      )}

      {/* Modal d'édition */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false })}
        title={
          editModal.open
            ? editModal.type === "user"
              ? "Modifier l'utilisateur"
              : "Modifier le client"
            : ""
        }
      >
        {editModal.open && editModal.type === "user" && (
          <EditUserForm user={editModal.data} onSuccess={handleEditSuccess} />
        )}
        {editModal.open && editModal.type === "client" && (
          <EditClientForm
            client={editModal.data}
            onSuccess={handleEditSuccess}
          />
        )}
      </Modal>
    </div>
  );
};

// Table générique pour User et Client
function Table({
  data,
  onDelete,
  onEdit,
}: {
  data: {
    id: string | number;
    name: string;
    email: string;
    phoneNumber?: string;
    bookingsCount?: number;
    lastBooking?: string;
    image?: string | null;
    role?: string;
    type: "user" | "client";
    raw: UserWithComputed | ClientWithComputed;
  }[];
  onDelete: (type: "user" | "client", id: string | number) => void;
  onEdit: (
    type: "user" | "client",
    data: UserWithComputed | ClientWithComputed
  ) => void;
}) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Nb réservations</th>
            <th>Dernière réservation</th>
            <th>Image</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={8}>Aucun résultat.</td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.phoneNumber || "-"}</td>
                <td>{item.bookingsCount ?? "-"}</td>
                <td>
                  {item.lastBooking
                    ? new Date(item.lastBooking).toLocaleDateString("fr-FR")
                    : "-"}
                </td>
                <td>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={40}
                      height={40}
                      className={styles.image}
                      unoptimized
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{item.role || "-"}</td>
                <td>
                  <button
                    type="button"
                    className={styles.link}
                    onClick={() => onEdit(item.type, item.raw)}
                  >
                    Modifier
                  </button>
                  <DeleteButton
                    id={item.id}
                    type={item.type}
                    className={styles.deleteButton}
                    onDeleted={() => onDelete(item.type, item.id)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUserClientList;
