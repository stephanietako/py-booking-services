// app/components/EditClientForm/EditClientForm.tsx
"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import styles from "./styles.module.scss";

interface EditClientFormProps {
  client: {
    id: number;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
  };
  onSuccess?: () => void;
}

export default function EditClientForm({
  client,
  onSuccess,
}: EditClientFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    setFormData({
      fullName: client.fullName || "",
      email: client.email || "",
      phoneNumber: client.phoneNumber || "",
    });
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Mise à jour du client...");

    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Erreur lors de la mise à jour.");

      toast.success("Client mis à jour avec succès !", { id: toastId });

      // Highlight + icône ✅
      window.scrollTo({ top: 0, behavior: "smooth" });
      setHighlight(true);
      setShowCheck(true);
      setTimeout(() => setShowCheck(false), 2000);
      if (onSuccess) {
        onSuccess();
      }
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
    <div className={styles.form_container}>
      <form
        onSubmit={handleSubmit}
        className={`${styles.form} ${highlight ? styles.highlight : ""}`}
      >
        <div className={styles.field}>
          <label htmlFor="fullName">Nom</label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="phoneNumber">Téléphone</label>
          <input
            id="phoneNumber"
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
        {showCheck && <div className={styles.checkIcon}>✅</div>}
      </form>
    </div>
  );
}
