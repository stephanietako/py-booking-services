"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import styles from "./styles.module.scss";

interface EditUserFormProps {
  user: {
    clerkUserId: string;
    name: string;
    email: string;
    phoneNumber?: string | null;
    description?: string | null;
  };
}

export default function EditUserForm({ user }: EditUserFormProps) {
  const [formData, setFormData] = useState({
    userId: user.clerkUserId,
    userName: user.name || "",
    userEmail: user.email || "",
    userPhone: user.phoneNumber || "",
    userDescription: user.description || "",
  });

  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [showCheck, setShowCheck] = useState(false); // Nouvelle état pour l'icône ✅

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Mise à jour de l'utilisateur...");

    try {
      const res = await fetch("/api/users/updateUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Erreur lors de la mise à jour.");

      toast.success("Utilisateur mis à jour avec succès !", { id: toastId });

      // ✅ Réinitialisation
      setFormData({
        userId: user.clerkUserId,
        userName: "",
        userEmail: "",
        userPhone: "",
        userDescription: "",
      });

      // ✅ Scroll top + Highlight
      window.scrollTo({ top: 0, behavior: "smooth" });
      setHighlight(true);
      setShowCheck(true); // Afficher l'icône ✅
      setTimeout(() => setShowCheck(false), 2000); // Cacher l'icône après 2 secondes
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Erreur inconnue.", { id: toastId });
      } else {
        toast.error("Erreur inconnue.", { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${styles.form} ${highlight ? styles.highlight : ""}`}
    >
      <div className={styles.field}>
        <label htmlFor="userName">Nom</label>
        <input
          id="userName"
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          disabled={loading}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="userEmail">Email</label>
        <input
          id="userEmail"
          type="email"
          name="userEmail"
          value={formData.userEmail}
          onChange={handleChange}
          disabled={loading}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="userPhone">Téléphone</label>
        <input
          id="userPhone"
          type="tel"
          name="userPhone"
          value={formData.userPhone}
          onChange={handleChange}
          disabled={loading}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="userDescription">Description</label>
        <textarea
          id="userDescription"
          name="userDescription"
          value={formData.userDescription}
          onChange={handleChange}
          disabled={loading}
        />
      </div>
      <button type="submit" disabled={loading} className={styles.button}>
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
      {showCheck && <div className={styles.checkIcon}>✅</div>}{" "}
      {/* Affichage de l'icône ✅ */}
    </form>
  );
}
