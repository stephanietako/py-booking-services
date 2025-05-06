"use client";

import { useState } from "react";
import { Booking } from "@/types";
import { sendBookingToAdmin } from "@/lib/email";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import Spinner from "../Spinner/Spinner";
import { toast } from "react-hot-toast";
import styles from "./styles.module.scss";

// Regex pour valider un numéro de téléphone international (format de base)
const phoneNumberRegex =
  /^(?:\+?\d{1,3})?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/;

const ReservationFormPage = ({ booking }: { booking: Booking }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null); // Erreur pour numéro de téléphone

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));

    // Reset phone number error when user changes phone input
    if (name === "phoneNumber") {
      setPhoneError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation du numéro de téléphone
    if (!phoneNumberRegex.test(formData.phoneNumber)) {
      setPhoneError("Veuillez entrer un numéro de téléphone valide.");
      setLoading(false);
      return;
    }

    try {
      await sendBookingToAdmin(booking, formData);
      toast.success("🎉 Votre réservation a bien été envoyée !", {
        style: {
          animation: "fadeInUp 0.5s ease-out", // Animation personnalisée pour le toast
        },
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
      });
    } catch (err) {
      console.error("Erreur lors de l'envoi :", err);
      setError("Impossible d'envoyer la réservation à l'administrateur.");
      toast.error("❌ Une erreur est survenue. Veuillez réessayer.", {
        style: {
          animation: "fadeInUp 0.5s ease-out", // Animation personnalisée pour le toast
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Wrapper>
        <Spinner />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <section className={styles.reservationSection}>
        <h1 className={styles.title}>Réservation</h1>
        <form onSubmit={handleSubmit} className={styles.reservationForm}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName">Prénom</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName">Nom</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phoneNumber">Numéro de téléphone</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
            {phoneError && <p className={styles.error}>{phoneError}</p>}
          </div>

          <button type="submit" className={styles.submitButton}>
            Confirmer ma réservation
          </button>

          {error && <p className={styles.error}>{error}</p>}
        </form>
      </section>
    </Wrapper>
  );
};

export default ReservationFormPage;
