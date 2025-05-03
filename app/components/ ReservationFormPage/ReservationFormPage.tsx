"use client";

import { useState } from "react";
import { Booking } from "@/types";

import Wrapper from "@/app/components/Wrapper/Wrapper";
// Styles
// import styles from "./styles.module.scss";
import Spinner from "../Spinner/Spinner";
import { sendBookingToAdmin } from "@/actions/admin";

const ReservationFormPage = ({ booking }: { booking: Booking }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await sendBookingToAdmin(booking, formData);
      // Rediriger l'utilisateur vers une page de confirmation ou notification de succès
      alert("Votre demande a été envoyée à l'administrateur.");
    } catch (err) {
      console.error("Erreur lors de l'envoi :", err);
      setError("Impossible d'envoyer la réservation à l'administrateur.");
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
      <section>
        <h1>Réservation</h1>
        <form onSubmit={handleSubmit} className="reservationForm">
          <div className="formGroup">
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

          <div className="formGroup">
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

          <div className="formGroup">
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

          <div className="formGroup">
            <label htmlFor="phoneNumber">Numéro de téléphone</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submitButton">
            Confirmer ma réservation
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>
    </Wrapper>
  );
};

export default ReservationFormPage;
