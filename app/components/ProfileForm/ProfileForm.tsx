"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import styles from "./styles.module.scss";
import ProfileSidebar from "../ProfileSidebar/ProfileSidebar";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

interface FormState {
  userName: string;
  userEmail: string;
  userPhone: string;
  userDescription: string;
}

export default function ProfileForm() {
  const { user } = useUser();
  const clerkUserId = user?.id;

  const [form, setForm] = useState<FormState>({
    userName: "",
    userEmail: "",
    userPhone: "",
    userDescription: "",
  });

  const [initialForm, setInitialForm] = useState(form);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!clerkUserId) return;

    async function fetchUserData() {
      try {
        const res = await fetch(`/api/users/${clerkUserId}`);
        if (!res.ok) throw new Error("Erreur lors du chargement du profil");

        const data = await res.json();

        let phoneIntl = data.phoneNumber || "";

        if (phoneIntl && !phoneIntl.startsWith("+")) {
          phoneIntl = "+33" + phoneIntl.replace(/^0/, "");
        }

        const parsedForm = {
          userName: data.name || "",
          userEmail: data.email || "",
          userPhone: phoneIntl,
          userDescription: data.description || "",
        };

        setForm(parsedForm);
        setInitialForm(parsedForm);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    fetchUserData();
  }, [clerkUserId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (form.userPhone && !isValidPhoneNumber(form.userPhone)) {
      setError("Numéro de téléphone invalide.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/users/${clerkUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur lors de la mise à jour");
      }

      setSuccess(true);
      setInitialForm(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function isFormModified() {
    return (
      form.userName !== initialForm.userName ||
      form.userEmail !== initialForm.userEmail ||
      form.userPhone !== initialForm.userPhone ||
      form.userDescription !== initialForm.userDescription
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.onboarding}>
        <h2>👋 Bienvenue sur votre page de profil</h2>
        <p>
          Ici, vous pouvez consulter et modifier vos informations personnelles.
          Ces données sont utilisées pour vos factures, vos notifications et
          pour faciliter la communication avec notre équipe.
        </p>
        <p>
          Pensez à vérifier que votre nom, numéro de téléphone et description
          sont bien à jour.
        </p>
      </div>

      <div className={styles.formSide}>
        <h3>Bonjour {form.userName || user?.fullName || "utilisateur"}</h3>
        <p>Voici vos informations de profil. Vous pouvez les modifier.</p>
        <br />
        <form onSubmit={handleSubmit} className={styles.form}>
          {loading && <p>Chargement...</p>}
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>Profil mis à jour !</p>}

          <label htmlFor="fullName">
            Nom complet :
            <span
              style={{
                fontSize: "0.9em",
                color: "#888",
                marginLeft: 8,
              }}
            ></span>
          </label>
          <input
            type="text"
            name="userName"
            value={form.userName}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">
            Email :
            <span
              style={{
                fontSize: "0.9em",
                color: "#888",
                marginLeft: 8,
              }}
            ></span>
          </label>
          <input
            type="email"
            name="userEmail"
            value={form.userEmail}
            onChange={handleChange}
            required
            disabled
          />

          <label htmlFor="phoneNumber">
            Téléphone :
            <span
              style={{
                fontSize: "0.9em",
                color: "#888",
                marginLeft: 8,
              }}
            ></span>
          </label>
          <PhoneInput
            international
            defaultCountry="FR"
            placeholder="Entrez votre numéro"
            value={form.userPhone}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, userPhone: value || "" }))
            }
            id="phoneNumber"
            name="phoneNumber"
            required
          />

          <label>Note:</label>
          <textarea
            name="userDescription"
            value={form.userDescription}
            onChange={handleChange}
          />

          <div className={styles.buttonGroup}>
            <button type="submit" disabled={loading}>
              Mettre à jour
            </button>
            {isFormModified() && (
              <button
                type="button"
                onClick={() => setForm(initialForm)}
                disabled={loading}
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      <ProfileSidebar
        userName={form.userName}
        userPhone={form.userPhone}
        userDescription={form.userDescription}
      />
    </div>
  );
}
