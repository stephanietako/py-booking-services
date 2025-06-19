// UserProfileUpdateForm.tsx
"use client";

import { FormState } from "@/types";
import { useState, useEffect } from "react";

interface UserProfileUpdateFormProps {
  userId: string;
}

const UserProfileUpdateForm: React.FC<UserProfileUpdateFormProps> = ({
  userId,
}) => {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    description: "",
    phoneNumber: "",
  });

  const [message, setMessage] = useState<string>("");
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        const result = await res.json();

        if (res.ok) {
          setFormData({
            name: result.name,
            email: result.email,
            description: result.description || "",
            phoneNumber: result.phoneNumber || "",
          });
        } else {
          setMessage("Erreur lors du chargement des données utilisateur");
        }
      } catch (error) {
        console.error("Impossible de récupérer les données", error);
        setMessage("Erreur lors du chargement");
      }
    };
    fetchUserData();
  }, [userId]);

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       const res = await fetch(`/api/getUser`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ userId }),
  //       });

  //       const result = await res.json();

  //       if (res.ok) {
  //         setFormData({
  //           name: result.name,
  //           email: result.email,
  //           description: result.description || "",
  //         });
  //       } else {
  //         setMessage("error fetching user data");
  //       }
  //     } catch (error) {
  //       console.error("Impossible de récupérer les données", error);
  //       setMessage("error fetching user data");
  //     }
  //   };
  //   fetchUserData();
  // }, [userId]);

  // Mettre à jour l'état du formulaire lors de la saisie de l'utilisateur
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Gérer la soumission du formulaire
  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   try {
  //     const res = await fetch(`/api/updateUser`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         userId,
  //         userDescription: formData.description,
  //       }),
  //     });

  //     const result = await res.json();

  //     if (res.ok) {
  //       setMessage("User data updated successfully!");
  //     } else {
  //       setMessage(result.error || "Failed to update user data.");
  //     }
  //   } catch (error) {
  //     console.error("Error submitting form", error);
  //     setMessage("Error submitting form.");
  //   }
  // };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: formData.name,
          userEmail: formData.email,
          userPhoneNumber: formData.phoneNumber,
          userDescription: formData.description,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("Données mises à jour !");
      } else {
        setMessage(result.error || "Échec de la mise à jour.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour", error);
      setMessage("Erreur lors de la soumission.");
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {message && <p className="message">{message}</p>}
      {/* Champ caché pour l'ID de l'utilisateur */}
      {/* <input type="hidden" name="id" value={userId} /> */}
      <div className="form_bloc">
        <label className="label" htmlFor="name">
          Nom
        </label>
        <input
          type="text"
          id="name"
          name="name"
          disabled
          value={formData.name}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div className="form_bloc">
        <br />
        <label className="label" htmlFor="email">
          Email
        </label>
        {/* <input
          className="input"
          type="text"
          id="email"
          name="email"
          disabled
          value={formData.email}
          onChange={handleChange}
        /> */}
        <input readOnly className="input" value={formData.email} />
      </div>
      <div className="form_bloc">
        <label className="label" htmlFor="phone">
          Téléphone
        </label>
        <input
          type="text"
          id="phone"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="input"
        />
      </div>

      {/* Champ pour la description */}
      <div className="form_bloc">
        <br />
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Ajouter une description ici..."
          className="textarea"
        />
      </div>
      <button type="submit">Mettre à jour</button>
    </form>
  );
};

export default UserProfileUpdateForm;
