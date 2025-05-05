// ReservationForm.tsx
// import { useState } from "react";
// import toast from "react-hot-toast";

// interface ReservationFormProps {
//   bookingId: string; // ID de la réservation passé par URL ou props
// }

// const ReservationForm: React.FC<ReservationFormProps> = ({ bookingId }) => {
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phoneNumber: "",
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const response = await fetch("/api/sendReservationDetails", {
//         method: "POST",
//         body: JSON.stringify({
//           bookingId,
//           ...formData,
//         }),
//       });

//       if (response.ok) {
//         toast.success("Votre réservation a été envoyée à l'administrateur.");
//       } else {
//         throw new Error("Erreur lors de l'envoi de la réservation.");
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Une erreur s'est produite.");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input
//         type="text"
//         name="firstName"
//         placeholder="Prénom"
//         value={formData.firstName}
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="text"
//         name="lastName"
//         placeholder="Nom"
//         value={formData.lastName}
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="email"
//         name="email"
//         placeholder="Email"
//         value={formData.email}
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="tel"
//         name="phoneNumber"
//         placeholder="Numéro de téléphone"
//         value={formData.phoneNumber}
//         onChange={handleChange}
//         required
//       />
//       <button type="submit">Envoyer</button>
//     </form>
//   );
// };

// export default ReservationForm;
"use client";

import { useState } from "react";
import { Booking } from "@/types";
import { sendBookingToAdmin } from "@/actions/admin";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import Spinner from "../Spinner/Spinner";
import { toast } from "react-hot-toast";
import styles from "./styles.module.scss";

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
      toast.success("🎉 Votre réservation a bien été envoyée !", {
        style: {
          animation: "fadeInUp 0.5s ease-out", // Animation personnalisée pour le toast
        },
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
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
