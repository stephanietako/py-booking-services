//app/my-bookings/BookingForm.tsx
// "use client";

// import { useState } from "react";
// import { Booking } from "@/types";
// import { sendBookingToAdmin } from "@/lib/emailService";
// import styles from "./styles.module.scss";

// interface Props {
//   booking: Booking;
// }

// export default function BookingForm({ booking }: Props) {
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phoneNumber: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState<string | null>(null);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage(null);

//     try {
//       await sendBookingToAdmin(booking, formData);
//       setMessage("✅ Réservation envoyée avec succès !");
//     } catch (error) {
//       setMessage("❌ Échec de l'envoi de la réservation.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form className={styles.form} onSubmit={handleSubmit}>
//       <h2>Vos informations</h2>
//       {Object.entries(formData).map(([field, value]) => (
//         <div key={field} className={styles.field}>
//           <label htmlFor={field}>{field}</label>
//           <input
//             id={field}
//             name={field}
//             value={value}
//             onChange={handleChange}
//             required
//           />
//         </div>
//       ))}
//       <button type="submit" disabled={loading}>
//         {loading ? "Envoi en cours..." : "Envoyer la réservation"}
//       </button>
//       {message && <p className={styles.message}>{message}</p>}
//     </form>
//   );
// }
"use client";

import { Booking } from "@/types";
import { useState } from "react";
import { sendBookingToAdmin } from "@/lib/emailService";
import styles from "./styles.module.scss";

interface Props {
  booking: Booking;
}

export default function BookingForm({ booking }: Props) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await sendBookingToAdmin(booking, formData);

      const res = await fetch(`/api/bookings/${booking.id}/payment-url`);
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Erreur création lien paiement");

      setSuccess(true);
    } catch (err) {
      console.error("❌ Erreur formulaire :", err);
      setError("Impossible d’envoyer la réservation.");
    } finally {
      setLoading(false);
    }
  };

  const formatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: booking.service?.currency || "EUR",
  });

  return (
    <form onSubmit={handleSubmit} className={styles.formWrapper}>
      <div className={styles.formGroup}>
        <label htmlFor="firstName" className={styles.label}>
          Prénom
        </label>
        <input
          id="firstName"
          name="firstName"
          placeholder="Prénom"
          required
          className={styles.input}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="lastName" className={styles.label}>
          Nom
        </label>
        <input
          id="lastName"
          name="lastName"
          placeholder="Nom"
          required
          className={styles.input}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          className={styles.input}
          name="email"
          placeholder="Email"
          type="email"
          required
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phoneNumber" className={styles.label}>
          Téléphone
        </label>
        <input
          id="phoneNumber"
          className={styles.input}
          name="phoneNumber"
          placeholder="Téléphone"
          type="tel"
          required
          onChange={handleChange}
        />
      </div>

      <hr />

      <h3>Résumé</h3>
      <p>
        <strong>Bateau :</strong> {formatter.format(booking.boatAmount)}
      </p>
      <p>
        <strong>Total :</strong> {formatter.format(booking.totalAmount)}
      </p>

      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? "Envoi en cours..." : "Envoyer la réservation"}
      </button>
      {success && (
        <p className={styles.success}>
          ✅ Réservation envoyée !<br />
          Vous recevrez un email avec les instructions de paiement.
        </p>
      )}
    </form>
  );
}
